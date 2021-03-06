import uuid from "../utils/uuid";
import noop from "../utils/noop";
import { createSubscription, publish } from "@codewithkyle/pubsub";

class IDBManager {
    private queue: Array<any>;
	private ready: boolean;
    private worker: Worker;
    private promises: {
		[key: string]: {
            success: Function;
            fail: Function;
        }
	};

    constructor(){
        this.ready = false;
        this.queue = [];
        this.promises = {};
        this.worker = new Worker("/js/idb-worker.js");
        this.worker.onmessage = this.inbox.bind(this);
        createSubscription("data-sync");
    }

    private inbox(e:MessageEvent):void{
        const { type, uid, data } = e.data;
        switch (type){
            case "error":
                if (this.promises?.[uid]) {
					this.promises[uid].fail(data);
					delete this.promises[uid];
				}
                break;
            case "response":
				if (this.promises?.[uid]) {
					this.promises[uid].success(data);
					delete this.promises[uid];
				}
				break;
            case "ready":
				this.flushQueue();
				break;
            default:
                console.warn(`Unknown IDB Worker response message type: ${type}`);
                break;
        }
    }

    private flushQueue() {
		this.ready = true;
		for (let i = this.queue.length - 1; i >= 0; i--) {
			this.worker.postMessage(this.queue[i]);
			this.queue.splice(i, 1);
		}
	}

    private send(type: string, data: any = null, resolve: Function = noop, reject:Function = noop) {
		const messageUid = uuid();
		const message = {
			type: type,
			data: data,
			uid: messageUid,
		};
        this.promises[messageUid] = {
            success: resolve,
            fail: reject
        };
		if (this.ready) {
			this.worker.postMessage(message);
		} else {
			this.queue.push(message);
		}
	}

    public getLists():Promise<Array<any>>{
        return new Promise((resolve) => {
            this.send("select", {
                table: "lists",
            }, resolve);
        });
    }

    public getList(uid){
        return new Promise((resolve) => {
            this.send("get", {
                table: "lists",
                key: uid,
            }, resolve);
        });
    }

    public addList(data){
        return new Promise((resolve) => {
            this.send("put", {
                table: "lists",
                data: data,
            }, resolve);
        });
    }

    public deleteList(uid){
        return new Promise((resolve) => {
            this.send("delete", {
                table: "lists",
                key: uid,
            }, resolve);
        });
    }

    private async performBatchedOPs(ops){
        for (const op of ops){
            await this.performOP(op);
        }
    }

    public async performOP(operation){
        const { op, table, key, value, keypath } = operation;
        switch (op){
            case "UNSET":
                await new Promise(resolve => {
                    this.send("unset", {
                        table: table,
                        key: key,
                        keypath: keypath,
                    }, resolve);
                });
                break;
            case "SET":
                await new Promise(resolve => {
                    this.send("set", {
                        table: table,
                        key: key,
                        value: value,
                        keypath: keypath
                    }, resolve);
                });
                break;
            case "DELETE":
                await new Promise(resolve => {
                    this.send("delete", {
                        table: table,
                        key: key,
                    }, resolve);
                });
                break;
            case "INSERT":
                await new Promise(resolve => {
                    this.send("put", {
                        table: table,
                        data: value,
                    }, resolve);
                });
                break;
            default:
                console.warn(`Unhandled OP type: ${op}`);
                break;
        }
        publish("data-sync", operation);
        console.log(operation);
    }

    public async handleOP(operation){
        const { op, ops } = operation;
        switch (op){
            case "BATCH":
                await this.performBatchedOPs(ops);
                break;
            default:
                await this.performOP(operation);
                break;
        }
    }
}
const manager = new IDBManager();
export { manager as default };