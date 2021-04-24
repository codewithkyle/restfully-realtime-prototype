const { v4: uuid } = require('uuid');

class AccountManager {
    constructor(){
        this.users = {};
    }

    lookupUser(email){
        email = email.toLowerCase().trim();
        let uid = null;
        if (email in this.users){
            uid = this.users[email];
        }
        return uid;
    }

    createUser(email){
        const uid = uuid();
        this.users[email.toLowerCase().trim()] = uid;
        return uid;
    }

    verifyUser(userId){
        let verified = false;
        for (const key in this.users){
            if (this.users[key] === userId){
                verified = true;
                break;
            }
        }
        if (!verified){
            throw 401;
        }
    }
}
const manager = new AccountManager();
module.exports = manager;