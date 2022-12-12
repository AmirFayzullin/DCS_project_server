const express = require("express");
const rimraf = require("rimraf");
const app = express();
const {run: runWSServer} = require("../webSocketServer/webSocketServer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const formidable = require('formidable');
const {HTTP_SERVER_PORT, INPUTS_FOLDER, OUTPUTS_FOLDER} = require("../config");
const ImagesOptimizer = require("../components/ImagesOptimizer/ImagesOptimizer");
const JimpOptimizerStrategy = require("../components/ImagesOptimizer/JimpOptimizerStrategy");
const FilesCollection = require("../components/FilesCollection/FilesCollection");
const File = require("../components/FilesCollection/File");
const ProcessingParameters = require("../components/ProcessingParameters");
const {DataProcessorFactory, DATA_PROCESSOR_TYPES} = require("../components/dataProcessors/DataProcessorFactory");
const Input = require("../components/Input");

const wsServer = runWSServer();

const imageDataProcessor = DataProcessorFactory.createDataProcessor({
    type: DATA_PROCESSOR_TYPES.IMAGE,
    params: {
        optimizer: new ImagesOptimizer({
            strategy: new JimpOptimizerStrategy()
        })
    }
});

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

    res.send({status: "ok"});
});

app.get('/download', function(req, res){
    const file = `${OUTPUTS_FOLDER}/output.pdf`;
    res.download(file, 'output.pdf');
});

const run = () => {
    app.listen(HTTP_SERVER_PORT, () => {
        console.log(`Server started on port ${HTTP_SERVER_PORT}`);
    })
};

module.exports = {run};