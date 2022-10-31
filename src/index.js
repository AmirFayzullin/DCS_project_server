const {DataProcessorFactory, DATA_PROCESSOR_TYPES} = require("./components/DataProcessorFactory")
const FilesCollection = require("./components/FilesCollection/FilesCollection");
const File = require("./components/FilesCollection/File");
const ImagesOptimizer = require("./components/ImagesOptimizer/ImagesOptimizer");
const JimpOptimizerStrategy = require("./components/ImagesOptimizer/JimpOptimizerStrategy");

const main = () => {
    const filesCollection = new FilesCollection({
        dirPath: `${__dirname}/../files/inputs`,
    });

    const imageDataProcessor = DataProcessorFactory.createDataProcessor({
        type: DATA_PROCESSOR_TYPES.IMAGE,
        params: {
            optimizer: new ImagesOptimizer({
                strategy: new JimpOptimizerStrategy()
            })
        }
    });

    imageDataProcessor.read({filesCollection});

    imageDataProcessor.run({
        file: new File({filePath: `${__dirname}/../files/outputs/output.pdf`}),
        maxSize: 20,
    });
};

main();