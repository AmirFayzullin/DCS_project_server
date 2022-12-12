const fs = require("fs");
const PDFDocument = require('pdfkit');
const {DataProcessor} = require("./DataProcessor");
const ImagesOptimizer = require("../ImagesOptimizer/ImagesOptimizer");
const FilesCollection = require("../FilesCollection/FilesCollection");
const File = require("../FilesCollection/File");
const Neuron = require("../QualityDefinerNeuron/QualityDefinerNeuron");
const ProcessingParameters = require("../ProcessingParameters");
const CONFIG = require("../../config");

class ImageDataProcessor extends DataProcessor {
    _inputFilesCollection = null;
    _outputFile = null;
    _optimizer = null;
    _qualityDefinerNeuron = null;
    _PDF_IMAGE_STYLE = {
        width: 615,
        height: 800
    };

    constructor({optimizer}) {
        if (!(optimizer instanceof ImagesOptimizer))
            throw new Error("[ImageDataProcessor]: optimizer should be an instance of ImagesOptimizer");
        super();
        this._optimizer = optimizer;
    }

    read({filesCollection}) {
        if (!(filesCollection instanceof FilesCollection))
            throw new Error(this._signString("filesCollection should be an instance of FilesCollection"));
        this._outputFile = null;
        this._inputFilesCollection = filesCollection;

        this._inputFilesCollection.open();
    }

    /**
     * implements data processing flow
     * @param {File} file - output pdf file
     * @param {ProcessingParameters} processingParameters - quality of images
     * @return {Promise<void>}
     */
    async run({file, processingParameters}) {
        const {quality, maxSize} = processingParameters;
        if (!(file instanceof File) ||
            !(processingParameters instanceof ProcessingParameters) ||
            (quality && (quality < CONFIG.MIN_IMAGE_QUALITY || quality > CONFIG.MAX_IMAGE_QUALITY)) ||
            (maxSize && maxSize < CONFIG.MIN_PDF_SIZE)
        ) {
            throw new Error(this._signString("invalid arguments"));
        }

        this._outputFile = file;

        let q = quality;
        if (!q && maxSize !== null) {                    // if quality isn't stated, but we have max size, we should calc quality automatically
            q = this._defineQuality(maxSize);
            if (q < CONFIG.MIN_IMAGE_QUALITY || q > CONFIG.MAX_IMAGE_QUALITY)
                throw new Error(this._signString("Defining quality automatically failed"));
        } else if (!q && !maxSize) {
            q = 99;                 // default quality if we haven't params
        }

        await this._optimize(q);

        this._fulfillOutputFile();

        return Promise.resolve();
    }

    getResult() {
        return this._outputFile;
    }

    _signString(str) {
        return super._signString(`\n\t[ImageDataProcessor]: ${str}`);
    }

    _optimize = async (quality) => {
        if (quality < CONFIG.MIN_IMAGE_QUALITY || quality > CONFIG.MAX_IMAGE_QUALITY)
            throw new Error(this._signString("Quality isn't in bounds"));
        console.log(this._signString("Optimizing..."));
        await this._optimizer.optimize({
            files: this._inputFilesCollection.getFiles(),
            quality
        });

        console.log(this._signString("Optimizing finished"));
    }

    _fulfillOutputFile() {
        console.log(this._signString("Creating pdf file..."));

        const doc = new PDFDocument();

        doc.pipe(fs.createWriteStream(this._outputFile.filePath));

        const files = this._inputFilesCollection.getFiles();
        let isNewPage = false;

        for (let file of files) {
            if (isNewPage) doc.addPage();

            doc.image(file.filePath, 0, 0, this._PDF_IMAGE_STYLE);

            isNewPage = true;
        }

        doc.end();

        console.log(this._signString("Creating pdf file finished"));
    }

    _defineQuality(maxSize) {
        if (!this._qualityDefinerNeuron) this._qualityDefinerNeuron = new Neuron();
        const filesSizes = this._inputFilesCollection.getSizes();

        const {quality, approximateSize} = this._qualityDefinerNeuron.defineQuality({filesSizes, maxSize})

        console.log(this._signString(`Quality = ${quality} | Approximate size = ${approximateSize}`));

        return quality;
    }
}

module.exports = ImageDataProcessor;