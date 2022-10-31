const ImageDataProcessor = require("./dataProcessors/ImageDataProcessor");

const DATA_PROCESSOR_TYPES = {
    IMAGE: "IMAGE"
};


class DataProcessorFactory {
    /**
     * creates an instance of DataProcessor
     * @param {Object} options - options for creating an instance
     */
    static createDataProcessor(options) {
        switch(options.type) {
            case DATA_PROCESSOR_TYPES.IMAGE:
                return new ImageDataProcessor(options.params);
            default:
                return null;
        }
    }
}

module.exports = {DATA_PROCESSOR_TYPES, DataProcessorFactory};