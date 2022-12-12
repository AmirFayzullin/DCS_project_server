const path = require("path");

module.exports = {
    MIN_IMAGE_QUALITY: 10,
    MAX_IMAGE_QUALITY: 100,
    MIN_PDF_SIZE: 0,
    HTTP_SERVER_PORT: 5000,
    WEB_SOCKET_SERVER_PORT: 5001,
    INPUTS_FOLDER: path.join(__dirname, "..", "files", "inputs"),
    OUTPUTS_FOLDER: path.join(__dirname, "..", "files", "outputs")
};