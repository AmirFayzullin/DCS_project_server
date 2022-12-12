const SqliteDBApi = require("./components/DBAPI/SqliteDBApi");
const UserApi = require("./components/DBAPI/apis/UserApi");
const CollectionApi = require("./components/DBAPI/apis/CollectionApi");
const {run: runHTTPServer} = require("./expressServer/expressServer");

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
    runHTTPServer();

    // const user = await db.user.add({
    //     email: "someEmail@gmail.com",
    //     password: "myPass"
    // });
    //
    // const collection = await db.collection.add({
    //     userId: 1,
    //     dateProcessed: (new Date).toLocaleDateString(),
    //     files: [
    //         {
    //             path: '/path/img1.jpg',
    //             type: 'input'
    //         },
    //         {
    //             path: '/path/img2.jpg',
    //             type: 'input'
    //         },
    //         {
    //             path: '/path/out.pdf',
    //             type: 'output'
    //         },
    //     ]
    // });
    //
    // console.log(collection);
    //
    // const files = await db.collection.getFiles({collectionId: collection.id});
    // console.log(files);
    //
    // await db.collection.share({
    //     collectionId: collection.id,
    //     password: "something"
    // });
};

main();