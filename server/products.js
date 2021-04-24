const { v4: uuid } = require('uuid');

class ProductManager {
    constructor(){
        this.products = {};
    }
    createProduct(userId, name){
        const uid = uuid();
        this.products[uid] = new Product(uid, userId, name);
        return uid;
    }
    lookupProduct(uid){
        if (uid in this.products){
            return this.products[uid].getDetails();
        } else {
            throw 404;
        }
    }
    getProducts(){
        let out = [];
        for (const key in this.products){
            out.push(this.products[key].getDetails());
        }
        return out;
    }
}
const manager = new ProductManager();

class Product {
    constructor(uid, authorId, name){
        this.uid = uid;
        this.author = authorId;
        this.name = name;
    }
    getDetails(){
        return {
            uid: this.uid,
            author: this.author,
            name: this.name,
        };
    }
};
module.exports = manager;