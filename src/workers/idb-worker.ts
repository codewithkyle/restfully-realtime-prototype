self.importScripts("/js/idb.js");

class IDBWorker {
    private db:any;

    constructor(){
        self.onmessage = this.inbox.bind(this);
        this.init();
    }

    private inbox(e:MessageEvent){
        const { type, uid, data } = e.data;
        switch (type){
            case "delete":
                this.delete(data).then(() => {
                    this.send("response", null, uid);
                });
                break;
            case "get":
                this.get(data).then(output => {
                    this.send("response", output, uid);
                });
                break;
            case "select":
                this.select(data).then((output)=>{
                    this.send("response", output, uid);
                });
                break;
            case "put":
                this.put(data).then(()=>{
                    this.send("response", null, uid);
                }).catch(error => {
                    this.send("error", error, uid);
                });
                break;
            default:
                console.warn(`Invalid IDB Worker message type: ${type}`);
                break;
        }
    }

    private send(type: string, data: any = null, uid: string = null, origin = null) {
		const message = {
			type: type,
			data: data,
			uid: uid,
		};
		if (origin) {
			self.postMessage(message, origin);
		} else {
			// @ts-expect-error
			self.postMessage(message);
		}
	}

    private async delete(settings){
        await this.db.delete(settings.table, settings.key);
    }

    private async select(settings){
        const lists = await this.db.getAll(settings.table);
        return lists;
    }

    private async put(settings){
        await this.db.put(settings.table, settings.data);
    }

    private async get(settings){
        const data = await this.db.get(settings.table, settings.key);
        return data;
    }

    private async init(){
        // @ts-ignore
        this.db = await openDB("app", 1, {
            upgrade(db) {
                const listsStore = db.createObjectStore("lists", {
                    keyPath: "uid",
                    autoIncrement: false,
                });
                listsStore.createIndex("uid", "uid", { unique: true });
                listsStore.createIndex("name", "name", { unique: false });
                listsStore.createIndex("author", "author", { unique: false });
                listsStore.createIndex("items", "items", { unique: false });
            }
        });
        const request = await fetch("/api/v1/lists", {
            headers: new Headers({
                Accept: "application/json",
            }),
        });
        const response = await request.json();
        if (request.ok && response.success){
            for (const list of response.data){
                await this.db.put("lists", list);
            }
            const lists = await this.db.getAll("lists");
            for (const savedList of lists){
                let keep = false;
                for (const newList of response.data){
                    if (newList.uid === savedList.uid){
                        keep = true;
                        break;
                    }
                }
                if (!keep){
                    await this.db.delete("lists", savedList.uid);
                }
            }
        }
        this.send("ready");
    }
}
new IDBWorker();