const { v4: uuid } = require('uuid');

class AccountManager {
    createUser(){
        const uid = uuid();
        return uid;
    }
}
const manager = new AccountManager();
module.exports = manager;