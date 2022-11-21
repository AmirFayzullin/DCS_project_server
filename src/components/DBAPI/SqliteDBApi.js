const DBAPI = require("./DBAPI");
const sqlite3 = require("sqlite3").verbose();

class SqliteDBApi extends DBAPI {
    _db = null;

    constructor({url}) {
        super({url});
    }

    loadApi({Api, name}) {
        this[name] = new Api(this);
    }

    open() {
        return new Promise((res, rej) => {
            this._db = new sqlite3.Database(this._url, () => {
                res();
            });
        });
    }

    _wrapBySerialize(cb) {
        return async (params) => {
            return new Promise((res, rej) => {
                this._db.serialize(async () => {
                    try {
                        const result = await cb(params);
                        res(result);
                    } catch(e) {
                        rej(e);
                    }
                });
            })
        };
    }

    close() {
        this._db.close();
    }
}

module.exports = SqliteDBApi;