const fs = require("fs");
const PDFDocument = require('pdfkit');
const {DataProcessor} = require("./DataProcessor");

class ImageDataProcessor extends DataProcessor {
    _inputFilesCollection = null;
    _outputFile = null;
    _optimizer = null;

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
     * @return {Promise<void>}
     */
    async run({file}) {
        this._outputFile = file;

        await this._optimize(90);

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
            files: this._inputFilesCollection.files,
            quality
        });

        console.log(this._signString("Optimizing finished"));
    }

    _fulfillOutputFile() {
        console.log(this._signString("Creating pdf file..."));

        const doc = new PDFDocument({size: 'A4'});

        doc.pipe(fs.createWriteStream(this._outputFile.filePath));

        for (let i in this._inputFilesCollection.files) {
            if (+i) doc.addPage();

            doc.image(this._inputFilesCollection.files[i].filePath, 0, 0, {
                width: 615,
                height: 800
            });
        }

        doc.end();

        console.log(this._signString("Creating pdf file finished"));
    }
}

module.exports = ImageDataProcessor;