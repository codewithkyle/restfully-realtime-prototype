const { v4: uuid } = require('uuid');

class ListManager {
    constructor(){
        this.lists = {};
    }
    create(userId, name){
        const uid = uuid();
        this.lists[uid] = new List(uid, userId, name);
        return uid;
    }
    lookup(uid){
        if (uid in this.lists){
            return this.lists[uid].getDetails();
        } else {
            throw 404;
        }
    }
    verifyAccess(uid, userId){
        const list = this.lookup(uid);
        if (list.author === userId || list.public){
            return list;
        } else {
            throw 401;
        }
    }
    getLists(){
        let out = [];
        for (const key in this.lists){
            out.push(this.lists[key].getDetails());
        }
        return out;
    }
    deleteList(uid){
        if (uid in this.lists){
            delete this.lists[uid];
        } else {
            throw 404;
        }
    }
    toggle(uid){
        if (uid in this.lists){
            this.lists[uid].toggle();
            return this.lists[uid].getDetails();
        } else {
            throw 404;
        }
    }
    updateTitle(uid, newName){
        if (uid in this.lists){
            this.lists[uid].name = newName;
            return this.lists[uid].getDetails();
        } else {
            throw 404;
        }
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
    toggle(){
        if (this.public){
            this.public = false;
        } else {
            this.public = true;
        }
    }
};
module.exports = manager;