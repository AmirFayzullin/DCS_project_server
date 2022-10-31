const OptimizerStrategy = require("./OptimizerStrategy");
const Jimp = require("jimp");

class JimpOptimizerStrategy extends OptimizerStrategy {

    async _optimizeFile(file, quality) {
        return new Promise(async (res) => {
            const image = await Jimp.read(file.filePath);
            await image.quality(quality);
            await image.writeAsync(file.filePath);
            res();
        });
    }

    async optimize({files, quality}) {
        return await Promise.all(files.map(file => this._optimizeFile(file, quality)));
    }
}

module.exports = JimpOptimizerStrategy;