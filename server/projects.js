const { v4: uuid } = require('uuid');

class ProjectManager {
    constructor(){
        this.projects = {};
    }
    createProject(userId, name){
        const uid = uuid();
        this.projects[uid] = new Project(uid, userId, name);
        return uid;
    }
    lookupProject(uid){
        if (uid in this.projects){
            return this.projects[uid].getDetails();
        } else {
            throw 404;
        }
    }
    getProjects(){
        let out = [];
        for (const key in this.projects){
            out.push(this.projects[key].getDetails());
        }
        return out;
    }
}
const manager = new ProjectManager();

class Project {
    constructor(uid, authorId, name){
        this.uid = uid;
        this.author = authorId;
        this.name = name;
        this.products = [];
    }
    getDetails(){
        return {
            uid: this.uid,
            author: this.author,
            name: this.name,
            products: this.products,
        };
    }
};
module.exports = manager;