class CollectionApi {
    constructor(dbapi) {
        this._dbapi = dbapi;

        this.add = this._dbapi._wrapBySerialize(this.add);
        this.get = this._dbapi._wrapBySerialize(this.get);
        this.remove = this._dbapi._wrapBySerialize(this.remove);
        this.getAll = this._dbapi._wrapBySerialize(this.getAll);
        this.addFile = this._dbapi._wrapBySerialize(this.addFile);
        this.getFiles = this._dbapi._wrapBySerialize(this.getFiles);
    }

    add = ({userId, dateProcessed, files}) => {
        return new Promise((res, rej) => {
            this._dbapi._db.run(`INSERT into Files (id, userId, dateProcessed) values (NULL, ${userId}, "${dateProcessed}");`);
            this._dbapi._db.get(`SELECT * from Files where userId = ? and dateProcessed = ?`, [userId, dateProcessed], (err, row) => {

                Promise.all(files.map(file => this.addFile({collectionId: row.id, ...file})))
                    .then(() => {
                        res(row);
                    })
            });
        });
    };

    get = ({collectionId}) => {
        return new Promise((res, rej) => {
            this._dbapi._db.get(`SELECT * from Files where id = ?`, [collectionId], (err, row) => {
                res(row);
            });
        });
    };

    remove = ({collectionId}) => {
        this._dbapi._db.run(`delete from File where collectionId = ${collectionId};`)
            .run(`delete from Files where id = ${collectionId};`);
    };

    share = ({collectionId, password}) => {
        this._dbapi._db.run(`update Files set isShared=1, sharingPassword="${password}" where id=${collectionId}`);
    };

    unshare = ({collectionId}) => {
        this._dbapi._db.run(`update Files set isShared=NULL, sharingPassword=NULL where id=${collectionId}`)
    };

    getAll = ({userId}) => {
        return new Promise((res, rej) => {
            this._dbapi._db.all(`SELECT * from Files where userId = ?`, [userId], (err, rows) => {
                res(rows);
            });
        });
    };

    addFile = ({collectionId, path, type}) => {
        return new Promise((res, rej) => {
            this._dbapi._db.run(`INSERT into File (collectionId , "path", "type") values (${collectionId}, "${path}", "${type}");`, (err) => {
                res();
            });
        });
    };

    getFiles = ({collectionId}) => {
        return new Promise((res, rej) => {
            this._dbapi._db.all(`SELECT * from File where collectionId = ?`, [collectionId], (err, row) => {
                res(row);
            });
        });
    }
}

module.exports = CollectionApi;