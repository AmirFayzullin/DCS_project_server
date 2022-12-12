const DBAPI = require("./DBAPI");
const sqlite3 = require("sqlite3").verbose();
const UserApi = require("./apis/UserApi");
const CollectionApi = require("./apis/CollectionApi");

class SqliteDBApi extends DBAPI {
    _db = null;
    user = null;
    collection = null;

    constructor({url}) {
        super({url});
    }

    open() {
        return new Promise((res, rej) => {
            this._db = new sqlite3.Database(this._url, () => {
                this.user = new UserApi(this);
                this.collection = new CollectionApi(this);
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
        this.user = null;
        this.collection = null;
    }
}

module.exports = SqliteDBApi;