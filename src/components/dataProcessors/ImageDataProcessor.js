const fs = require("fs");
const PDFDocument = require('pdfkit');
const {DataProcessor} = require("./DataProcessor");
const Neuron = require("../QualityDefinerNeuron/QualityDefinerNeuron");

class ImageDataProcessor extends DataProcessor {
    _inputFilesCollection = null;
    _outputFile = null;
    _optimizer = null;
    _qualityDefinerNeuron = null;

    constructor({optimizer}) {
        super();
        this._optimizer = optimizer;
    }

    read({filesCollection}) {
        this._outputFile = null;
        this._inputFilesCollection = filesCollection;

        this._inputFilesCollection.open();
    }

    /**
     * implements data processing flow
     * @param {File} file - output pdf file
     * @param {number | null} quality - quality of images
     * @param {number | null} maxSize - max output pdf file size
     * @return {Promise<void>}
     */
    async run({file, quality = null, maxSize = null}) {
        this._outputFile = file;

        let q = quality;
        if (!q) q = this._defineQuality(maxSize);

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
        console.log(this._signString("Optimizing..."));
        await this._optimizer.optimize({
            files: this._inputFilesCollection.getFiles(),
            quality
        });

        console.log(this._signString("Optimizing finished"));
    }

    _fulfillOutputFile() {
        console.log(this._signString("Creating pdf file..."));

        const doc = new PDFDocument({size: 'A4'});

        doc.pipe(fs.createWriteStream(this._outputFile.filePath));

        const files = this._inputFilesCollection.getFiles();
        let isNewPage = false;

        for (let file of files) {
            if (isNewPage) doc.addPage();

            doc.image(file.filePath, 0, 0, {
                width: 615,
                height: 800
            });

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