const express = require("express");
const rimraf = require("rimraf");
const jwt = require('jsonwebtoken');
const app = express();
const {run: runWSServer} = require("../webSocketServer/webSocketServer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const formidable = require('formidable');
const {HTTP_SERVER_PORT, INPUTS_FOLDER, OUTPUTS_FOLDER, DB_URL, JWT_KEY} = require("../config");
const ImagesOptimizer = require("../components/ImagesOptimizer/ImagesOptimizer");
const JimpOptimizerStrategy = require("../components/ImagesOptimizer/JimpOptimizerStrategy");
const FilesCollection = require("../components/FilesCollection/FilesCollection");
const File = require("../components/FilesCollection/File");
const ProcessingParameters = require("../components/ProcessingParameters");
const {DataProcessorFactory, DATA_PROCESSOR_TYPES} = require("../components/dataProcessors/DataProcessorFactory");
const Input = require("../components/Input");
const DBApi = require("../components/DBAPI/SqliteDBApi");

const wsServer = runWSServer();

const imageDataProcessor = DataProcessorFactory.createDataProcessor({
    type: DATA_PROCESSOR_TYPES.IMAGE,
    params: {
        optimizer: new ImagesOptimizer({
            strategy: new JimpOptimizerStrategy()
        })
    }
});

const dbapi = new DBApi({ url: DB_URL});
dbapi.open();

const createPDF = ({outputFilepath, inputFolder, processingParams}) => {
    const filesCollection = new FilesCollection({dirPath: inputFolder});
    const processingParameters = new ProcessingParameters({
        quality: +processingParams.quality,
        maxSize: +processingParams.maxSize
    });
    const input = new Input({filesCollection, processingParameters});

    imageDataProcessor.read({filesCollection: input.filesCollection});

    return imageDataProcessor.run({
        file: new File({filePath: outputFilepath}),
        processingParameters
    });
};

app.useP = function(...args) {
    function wrap(fn) {
        return async function(req, res, next) {
            // catch both synchronous exceptions and asynchronous rejections
            try {
                await fn(req, res, next);
            } catch(e) {
                next(e);
            }
        }
    }

    // reconstruct arguments with wrapped functions
    let newArgs = args.map(arg => {
        if (typeof arg === "function") {
            return wrap(arg);
        } else {
            return arg;
        }
    });
    // register actual middleware with wrapped functions
    app.use(...newArgs);
};

const findUser = (req) => {
    return new Promise((res, rej) => {
        if (req.headers.authorization) {
            jwt.verify(
                req.headers.authorization.split(' ')[1],
                JWT_KEY,
                async (err, payload) => {
                    if (err) res();
                    else if (payload) {
                        try {
                            const user = await dbapi.user.getById({id: payload.id});
                            res(user);
                        } catch(err) {
                            console.log(err);
                            res();
                        }
                    }
                }
            )
        } else {
            res();
        }
    });
};

app.useP(async (req, res, next) => {
    req.user = await findUser(req);
    next();
});

app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());
app.use(cors());

app.post("/uploadImages", (req, res) => {
    const form = new formidable.IncomingForm();

    const wsConnectionId = req.headers["ws-id"]?.toString();

    form.parse(req, async (err, fields, files) => {
        let keys = Object.keys(files);
        rimraf.sync(INPUTS_FOLDER);
        fs.mkdirSync(INPUTS_FOLDER);
        for (let i = 0; i < keys.length; i++) {
            const oldPath = files[keys[i]].path;
            const newPath = path.join(INPUTS_FOLDER, `${i}${path.extname(files[keys[i]].name)}`);
            fs.renameSync(oldPath, newPath);

            if (i === keys.length - 1) {
                try {
                    await createPDF({
                        outputFilepath: path.join(OUTPUTS_FOLDER, "output.pdf"),
                        inputFolder: INPUTS_FOLDER,
                        processingParams: fields
                    });

                    if (wsConnectionId) {
                        wsServer.notifyProcessingFinished(wsConnectionId, "OK");
                    }
                } catch(e) {
                    console.log(e);
                    if (wsConnectionId) {
                        wsServer.notifyProcessingFinished(wsConnectionId, "ERROR");
                    }
                }
            }
        }
    });

    res.json({status: 0});
});

app.post("/register", async (req, res) => {
    const {email, password} = req.body;
    const response = res.setHeader("Content-Type", "application/json");

    try {
        const existingUser = await dbapi.user.get({email});

        if (existingUser) {
            response.status(200).json({status: 1, messages: ["User exists"]});
            return;
        }

        await dbapi.user.add({email, password});
        response.status(201).json({status: 0, messages: ["Success"]});
    } catch(err) {
        response.status(500).json({status: 1, messages: [err.message]});
    }
});

app.post("/login", async (req, res) => {
    const {email, password} = req.body;
    const response = res.setHeader("Content-Type", "application/json");

    try {
        const existingUser = await dbapi.user.get({email});

        if (!existingUser || existingUser.password !== password) {
            return response.status(200).json({status: 1, messages: ["Invalid email or password"]});
        }

        response.status(200).send(JSON.stringify({
            status: 0,
            messages: ["Success"],
            token: jwt.sign({
                exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
                id: existingUser.id
            }, JWT_KEY)
        }));
    } catch(err) {
        response.status(500).json({status: 1, messages: [err.message]});
    }
});

app.get('/download', function(req, res){
    const file = `${OUTPUTS_FOLDER}/output.pdf`
    res.download(file, 'output.pdf');
});

app.get('/me', async (req, res) => {
    const response = res.setHeader("Content-Type", "application/json");

    if (!req.user) return response.json({status: 1, messages: ["Unauthorized"]});

    response.send(JSON.stringify({
        status: 0,
        messages: ["Authorized"],
        email: req.user.email
    }));
});

const run = () => {
    app.listen(HTTP_SERVER_PORT, () => {
        console.log(`Server started on port ${HTTP_SERVER_PORT}`);
    })
};

module.exports = {run};