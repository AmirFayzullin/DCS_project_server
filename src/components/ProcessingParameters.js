const CONFIG = require("../config");

class ProcessingParameters {
    constructor({quality, maxSize}) {
        if ((quality && (quality < CONFIG.MIN_IMAGE_QUALITY || quality > CONFIG.MAX_IMAGE_QUALITY)) ||
            (maxSize && maxSize < CONFIG.MIN_PDF_SIZE)) {
            throw new Error("Incorrect processing parameters");
        }

        this.quality = quality;
        this.maxSize = maxSize;
    }
}

module.exports = ProcessingParameters;