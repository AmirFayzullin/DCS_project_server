const fs = require("fs");
const File = require("./File");

class FilesCollection {
    files = [];
    constructor({dirPath}) {
        this._dirPath = dirPath;
    }

    open() {
        const filenames = fs.readdirSync(this._dirPath);
        this.files = filenames.map(filename => {
            return new File({
                filePath: `${this._dirPath}/${filename}`
            });
        });
    }
}

module.exports = FilesCollection;