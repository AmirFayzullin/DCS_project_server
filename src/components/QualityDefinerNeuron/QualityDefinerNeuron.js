const process = require('process');
const fs = require('fs');

class Neuron {
    constructor() {
        let data = fs.readFileSync(__dirname + '/weights.json', 'UTF-8');
        this._weightsData = JSON.parse(data);
    }

    _processInput({totalFilesSize, quality}) {
        const weights = this._weightsData.find((d) => d.quality === quality);
        return totalFilesSize * weights.lastWeight1 * quality * weights.lastWeight2;
    }

    defineQuality({filesSizes, maxSize}) {
        const totalFilesSize = filesSizes.reduce((init = 0, next) => init + next);
        let quality = 100;
        let approximateSize = maxSize + 1;
        do {
            quality--;
            approximateSize = this._processInput({totalFilesSize, quality});
        }
        while (approximateSize > maxSize);

        return {quality, approximateSize};
    }
}

module.exports = Neuron;
