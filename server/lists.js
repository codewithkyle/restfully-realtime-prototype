const { v4: uuid } = require('uuid');

class ListManager {
    constructor(){
        this.lists = {};
    }
    createList(userId, name){
        const uid = uuid();
        this.lists[uid] = new List(uid, userId, name);
        return uid;
    }
    lookupList(uid){
        if (uid in this.lists){
            return this.lists[uid].getDetails();
        } else {
            throw 404;
        }
    }
    getLists(){
        let out = [];
        for (const key in this.lists){
            out.push(this.lists[key].getDetails());
        }
        return out;
    }
}
const manager = new ListManager();

class List {
    constructor(uid, authorId, name){
        this.uid = uid;
        this.author = authorId;
        this.name = name;
        this.items = [];
        this.public = false;
    }
    getDetails(){
        return {
            uid: this.uid,
            author: this.author,
            name: this.name,
            items: this.items,
            public: this.public,
        };
    }
};
module.exports = manager;