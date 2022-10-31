const {DataProcessorFactory, DATA_PROCESSOR_TYPES} = require("./components/DataProcessorFactory")
const FilesCollection = require("./components/FilesCollection/FilesCollection");
const File = require("./components/FilesCollection/File");
const ImagesOptimizer = require("./components/ImagesOptimizer/ImagesOptimizer");
const JimpOptimizerStrategy = require("./components/ImagesOptimizer/JimpOptimizerStrategy");
const Input = require("./components/Input");
const ProcessingParameters = require("./components/ProcessingParameters");

const main = () => {
    const filesCollection = new FilesCollection({
        dirPath: `${__dirname}/../files/inputs`,
    });

    const processingParameters = new ProcessingParameters({
        quality: 90
    });

    const input = new Input({filesCollection, processingParameters});

    const imageDataProcessor = DataProcessorFactory.createDataProcessor({
        type: DATA_PROCESSOR_TYPES.IMAGE,
        params: {
            optimizer: new ImagesOptimizer({
                strategy: new JimpOptimizerStrategy()
            })
        }
    });

    imageDataProcessor.read({filesCollection: input.filesCollection});

    imageDataProcessor.run({
        file: new File({filePath: `${__dirname}/../files/outputs/output.pdf`}),
        quality: input.processingParameters.quality
    });
};

main();