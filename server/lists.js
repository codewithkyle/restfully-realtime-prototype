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
    deleteList(uid, userId){
        if (uid in this.lists){
            if (this.lists[uid].author === userId){
                delete this.lists[uid];
            } else {
                throw 401;
            }
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
    addItem(uid, value){
        if (uid in this.lists){
            const itemUid = uuid();
            this.lists[uid].addItem(value, itemUid);
            return this.lists[uid].getDetails();
        } else {
            throw 404;
        }
    }
    removeItem(uid, itemId){
        if (uid in this.lists){
            this.lists[uid].removeItem(itemId);
            return this.lists[uid].getDetails();
        } else {
            throw 404;
        }
    }
    updateLineItem(uid, itemId, value){
        if (uid in this.lists){
            this.lists[uid].updateItem(itemId, value);
            return this.lists[uid].getDetails();
        } else {
            throw 404;
        }
    }
    moveLineItem(uid, itemId, hijackedItemId){
        if (uid in this.lists){
            this.lists[uid].moveItem(itemId, hijackedItemId);
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
        this.items = {};
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
    addItem(value, uid){
        this.items[uid] = {
            value: value,
            order: Object.keys(this.items).length,
        };
    }
    removeItem(uid){
        delete this.items[uid];
    }
    updateItem(uid, value){
        if (uid in this.items){
            this.items[uid] = Object.assign(this.items[uid], {
                value: value,
            });
        }
    }
    moveItem(uid, hijackedItemId){
        let newIndex = this.items[hijackedItemId].order;
        if (newIndex >= Object.keys(this.items).length - 1){
            newIndex = Object.keys(this.items).length;
        } else if (newIndex === this.items[uid].order + 1){
            newIndex = newIndex + 1;
        } else if (newIndex < 0) {
            newIndex = 0;
        }
        let items = [];
        for (let i = 0; i < Object.keys(this.items).length; i++){
            items.push(null);
        }
        for (const key in this.items){
            if (key !== uid){
                items.splice(this.items[key].order, 1, key);
            }
        }
        items.splice(newIndex, 0, uid);
        for (let i = items.length - 1; i >= 0; i--){
            if (items[i] === null){
                items.splice(i, 1);
            }
        }
        for (let i = 0; i < items.length; i++){
            this.items[items[i]].order = i;
        }
    }
};
module.exports = manager;