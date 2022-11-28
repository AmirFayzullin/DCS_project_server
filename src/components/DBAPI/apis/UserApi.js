class UserApi {
    constructor(dbapi) {
        this._dbapi = dbapi;

        this.add = this._dbapi._wrapBySerialize(this.add);
        this.get = this._dbapi._wrapBySerialize(this.get);
        this.getById = this._dbapi._wrapBySerialize(this.getById);
    }

    add = ({email, password}) => {
        this._dbapi._db.run(`INSERT into User (email, password, Id) values ("${email}", "${password}", NULL);`);
        return this.get({email});
    };

    get = ({email}) => {
        return new Promise((res, rej) => {
            this._dbapi._db.get(`SELECT * from User where email = ?`, [email], (err, row) => {
                res(row);
            });
        });
    };

    remove = ({id}) => {
        return new Promise((res, rej) => {
            this._dbapi._db.run(`delete from User where id = ${id};`, (err, row) => {
                res(row);
            })
        })
    };

    getById = ({id}) => {
        return new Promise((res, rej) => {
            this._dbapi._db.get(`SELECT * from User where id = ?`, [id], (err, row) => {
                res(row);
            });
        });
    }

    createVerificationCode = ({userId, code, actionType, action = "", dateRequested}) => {
        this._dbapi._db.run(
            `INSERT into VerificationCode (userId, code, actionType, action, dateRequested) 
            values ("${userId}", "${code}", ${actionType}, "${action}", "${dateRequested}");`
        );
    };

    removeVerificationCode = ({userId, actionType}) => {
        return new Promise((res, rej) => {
            this._dbapi._db.run(`delete from VerificationCode where userId = ${userId} and actionType = "${actionType}";`, (err, row) => {
                res(row);
            })
        });
    }
}

module.exports = UserApi;