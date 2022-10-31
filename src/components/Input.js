const FilesCollection = require("./FilesCollection/FilesCollection");
const ProcessingParameters = require("./ProcessingParameters");

class Input {
    constructor({filesCollection, processingParameters}) {
        if (!(filesCollection instanceof FilesCollection) ||
            !(processingParameters instanceof ProcessingParameters)) {
            throw new Error("Incorrect input");
        }
        this.filesCollection = filesCollection;
        this.processingParameters = processingParameters;
    }
}

module.exports = Input;