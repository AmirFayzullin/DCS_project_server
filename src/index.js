const {DataProcessorFactory, DATA_PROCESSOR_TYPES} = require("./components/DataProcessorFactory")
const FilesCollection = require("./components/FilesCollection/FilesCollection");
const File = require("./components/FilesCollection/File");
const ImagesOptimizer = require("./components/ImagesOptimizer/ImagesOptimizer");
const JimpOptimizerStrategy = require("./components/ImagesOptimizer/JimpOptimizerStrategy");
const Input = require("./components/Input");
const ProcessingParameters = require("./components/ProcessingParameters");
const SqliteDBApi = require("./components/DBAPI/SqliteDBApi");
const sqlite3 = require("sqlite3");
const UserApi = require("./components/DBAPI/apis/UserApi");
const CollectionApi = require("./components/DBAPI/apis/CollectionApi");

const DBAPI_CONFIG = [
    {
        Api: CollectionApi,
        name: 'collection'
    },
    {
        Api: UserApi,
        name: "user"
    }
];

const initDBApi = async () => {
    const db = new SqliteDBApi({
        url: "C:\\Users\\Amir\\Desktop\\For UGATU\\Designing and constructing software\\Project\\server\\db\\db"
    });

    db.loadApi({
        Api: UserApi,
        name: 'user'
    });

    db.loadApi({
        Api: CollectionApi,
        name: 'collection'
    });

    await db.open();

    return db;
};


const main = async () => {
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

    // imageDataProcessor.run({
    //     file: new File({filePath: `${__dirname}/../files/outputs/output.pdf`}),
    //     processingParameters
    // });

    const db = await initDBApi();

    const user = await db.user.add({
        email: "someEmail@gmail.com",
        password: "myPass"
    });

    const collection = await db.collection.add({
        userId: 1,
        dateProcessed: (new Date).toLocaleDateString(),
        files: [
            {
                path: '/path/img1.jpg',
                type: 'input'
            },
            {
                path: '/path/img2.jpg',
                type: 'input'
            },
            {
                path: '/path/out.pdf',
                type: 'output'
            },
        ]
    });

    console.log(collection);

    const files = await db.collection.getFiles({collectionId: collection.id});
    console.log(files);
};

main();