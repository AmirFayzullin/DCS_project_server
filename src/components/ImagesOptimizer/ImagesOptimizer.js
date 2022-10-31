class ImagesOptimizer {
    constructor({strategy}) {
        this.setStrategy(strategy);
    }

    optimize({files, quality}) {
        return this._strategy.optimize({files, quality});
    }

    setStrategy(strategy) {
        this._strategy = strategy;
    }
}

module.exports = ImagesOptimizer;