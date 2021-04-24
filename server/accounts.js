const { v4: uuid } = require('uuid');

class AccountManager {
    constructor(){
        this.users = {};
    }

    lookupUser(email){
        email = email.toLowerCase().trim();
        let uid = null;
        for (const key in this.users){
            if (key === email){
                uid = this.users[key];
                break;
            }
        }
        return uid;
    }

    createUser(email){
        const uid = uuid();
        this.users[email.toLowerCase().trim()] = uid;
        return uid;
    }
}
const manager = new AccountManager();
module.exports = manager;