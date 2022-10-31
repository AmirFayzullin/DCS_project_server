const fs = require("fs");
const File = require("./File");

class FilesCollection {
    _files = [];
    _filesSizes = [];
    constructor({dirPath}) {
        this._dirPath = dirPath;
    }

    getSizes = () => {
        if (this._filesSizes.length > 0) return this._filesSizes;

        this._filesSizes = this._files.map(file => file.getSize());

        return this._filesSizes;
    };

    getFiles = () => {
        return [...this._files];
    };

    open() {
        const filenames = fs.readdirSync(this._dirPath);
        this._files = filenames.map(filename => {
            return new File({
                filePath: `${this._dirPath}/${filename}`
            });
        });
    }
}

module.exports = FilesCollection;