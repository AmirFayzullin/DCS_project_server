const fs = require("fs");

class File {
    constructor({filePath}) {
        this.filePath = filePath;
    }

    getSize() {
        return fs.statSync(this.filePath).size / 1000000;
    };
}

module.exports = File;