const fs = require("fs");
const PDFDocument = require('pdfkit');
const Jimp = require("jimp");
const {DataProcessor} = require("./DataProcessor");

class ImageDataProcessor extends DataProcessor {
    _inputFilesCollection = null;
    _outputFile = null;

    read({filesCollection}) {
        this._outputFile = null;
        this._inputFilesCollection = filesCollection;

        this._inputFilesCollection.open();
    }

    async run({file}) {
        this._outputFile = file;
        const doc = new PDFDocument({size: 'A4'});

        doc.pipe(fs.createWriteStream(file.filePath));

        await this._optimize(1);

        for (let i in this._inputFilesCollection.files) {
            if (+i) doc.addPage();

            doc.image(this._inputFilesCollection.files[i].filePath, 0, 0, {
                width: 615,
                height: 800
            });
        }

        doc.end();

        return Promise.resolve();
    }

    getResult() {
        return this._outputFile;
    }

    _signString(str) {
        return super._signString(`\n\t[ImageDataProcessor]: ${str}`);
    }

    _optimize = async (quality) => {
        console.log(this._signString("optimizong..."));
        await Promise.all(
            this._inputFilesCollection.files.map(async file => {
                const image = await Jimp.read(file.filePath);
                await image.quality(quality);
                await image.writeAsync(file.filePath);
            })
        );
    }
}

module.exports = ImageDataProcessor;