import idb from "../controllers/idb-manager";
import { html, render } from "lit-html";
import SuperComponent from "@codewithkyle/supercomponent";
import css from "../utils/css";
import { navigateTo } from "@codewithkyle/router";
import { subscribe, unsubscribe } from "@codewithkyle/pubsub";
import debounce from "../utils/debounce";
import { setValueFromKeypath, unsetValueFromKeypath } from "../utils/op-center";
import { toast } from "@codewithkyle/notifyjs";

import ListItem from "../components/list-item";
customElements.define("list-item", ListItem);

type ListState = {
    items: any,
    uid: string,
    author: string,
    name: string,
    public: boolean;
};
export default class List extends SuperComponent<ListState>{
    private inboxId: string;

    constructor(tokens, params){
        super();
        this.model = {
            items: {},
            uid: null,
            author: null,
            name: null,
            public: false,
        };
        this.init(tokens.UID);
    }

    private async init(uid){
        await css(["list", "overflow-menu", "list-item"]);
        const list = await idb.getList(uid);
        if (!list){
            navigateTo("/lists");
        }
        this.update(list);
        this.focusAddButton();
    }

    private async handleBatchedOps(ops){
        for (const op of ops){
            await this.inbox(op);
        }
    }

    private async inbox(operation){
        if (operation.key === this.model.uid){
            const keypath = operation?.keypath?.split("::") ?? [];
            switch (operation.op){
                case "UNSET":
                    if (keypath?.[0] === "items"){
                        const item = this.querySelector(`[data-uid="${keypath[1]}"]`) as ListItem;
                        if (item){
                            item.remove();
                        }
                    } else {
                        const updated = {...this.model};
                        unsetValueFromKeypath(updated, keypath);
                        this.update(updated);
                    }
                    break;
                case "SET":
                    if (keypath?.[0] === "items"){
                        const item = this.querySelector(`[data-uid="${keypath[1]}"]`) as ListItem;
                        if (item){
                            item.set(keypath.splice(2, keypath.length - 1), operation.value);
                        } else {
                            const updated = {...this.model};
                            setValueFromKeypath(updated, keypath, operation.value);
                            this.update(updated);
                        }
                    } else {
                        const updated = {...this.model};
                        setValueFromKeypath(updated, keypath, operation.value);
                        this.update(updated);
                    }
                    break;
                case "BATCH":
                    await this.handleBatchedOps(operation.ops);
                    break;
                case "INSERT":
                    return;
                case "DELETE":
                    navigateTo("/lists");
                    toast({
                        title: "List Deleted",
                        message: `${this.model.name} has been deleted.`,
                        classes: ["-red"],
                        closeable: true,
                    });
                    break;
                default:
                    break;
            }
        }
    }

    private deleteList:EventListener = async (e:Event) => {
        const request = await fetch(`/api/v1/lists/${this.model.uid}`, {
            method: "DELETE",
            headers: new Headers({
                Accept: "application/json",
                Authorization: localStorage.getItem("uid"),
            }),
        });
        const response = await request.json();
        if (request.ok && response.success){
            navigateTo("/lists");
        } else {
            toast({
                title: "Error",
                message: response.error,
                classes: ["-red"],
                closeable: true,
            });
        }
    }

    private togglePublic:EventListener = async (e:Event) => {
        const request = await fetch(`/api/v1/lists/${this.model.uid}/toggle`, {
            method: "POST",
            headers: new Headers({
                Accept: "application/json",
                Authorization: localStorage.getItem("uid"),
            }),
        });
    }

    private focusAddButton(){
        // @ts-ignore
        document.activeElement?.blur();
        const addBttn:HTMLButtonElement = document.body.querySelector(".js-add");
        if (addBttn){
            addBttn.focus();
        }
    }

    private async updateTitle(value){
        if (value.length){
            const data = {
                title: value,
            };
            const request = await fetch(`/api/v1/lists/${this.model.uid}/update-title`, {
                method: "POST",
                headers: new Headers({
                    Accept: "application/json",
                    Authorization: localStorage.getItem("uid"),
                    "Content-Type": "application/json",
                }),
                body: JSON.stringify(data),
            });
            const response = await request.json();
            if (!request.ok || !response?.success){
                toast({
                    title: "Error",
                    message: response.error,
                    classes: ["-red"],
                    closeable: true,
                });
            }
        }
    }
    private debounceTitleInput = debounce(this.updateTitle.bind(this), 600, false);
    private handleTitleInput:EventListener = (e:Event) => {
        const target = e.currentTarget as HTMLInputElement;
        this.debounceTitleInput(target.value);
    }

    private addItem:EventListener = async (e:Event) => {
        const value = prompt("New list item:");
        if (!value){
            return;
        }
        const data = {
            value: value,
        };
        const request = await fetch(`/api/v1/lists/${this.model.uid}/items`, {
            method: "PUT",
            headers: new Headers({
                Accept: "application/json",
                Authorization: localStorage.getItem("uid"),
                "Content-Type": "application/json",
            }),
            body: JSON.stringify(data),
        });
        const response = await request.json();
        if (!request.ok || !response?.success){
            toast({
                title: "Error",
                message: response.error,
                classes: ["-red"],
                closeable: true,
            });
        }
        this.focusAddButton();
    }

    connected(){
        this.inboxId = subscribe("data-sync", this.inbox.bind(this));
    }

    disconnected(){
        if (this.inboxId){
            unsubscribe(this.inboxId, "data-sync");
        }
    }

    render(){
        const view = html`
            <div class="w-full h-full" flex="items-center justify-center">
                <div class="block px-0.5 py-0.75 bg-white radius-0.5 shadow-md w-mobile max-w-full border-1 border-solid border-grey-300" style="max-height: calc(100vh - 2rem);overflow-y: auto;min-height:150px;">
                    <div class="w-full" flex="items-center row nowrap">
                        <a href="/lists" class="bttn mr-0.25" icon="center" kind="text" color="grey" shape="round">
                            <svg style="width:20px;height:20px;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                            </svg>
                        </a>
                        <input @input=${this.handleTitleInput} class="title-input" type="text" .value="${this.model.name}" title="${this.model.name}">
                        <overflow-button class="ml-0.25">
                            <button>
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                            </button>
                            <overflow-menu>
                                <button @click=${this.togglePublic}>
                                    ${ this.model.public ? "Make Private" : "Make Public" }
                                </button>
                                <button color="danger" @click=${this.deleteList}>
                                    Delete List
                                </button>
                            </overflow-menu>
                        </overflow-button>
                    </div>
                    <div class="list">
                        ${Object.keys(this.model.items).map(key => {
                            return new ListItem(key, this.model.items[key].value, this.model.items[key].order, this.model.uid);
                        })}
                    </div>
                    <button @click=${this.addItem} class="js-add bttn w-full mt-0.5" kind="text" color="grey" shape="rounded">Add Item</button>
                </div>
            </div>
        `;
        render(view, this);
        this.querySelectorAll("textarea").forEach(el => {
            el.style.height = `${el.scrollHeight}px`;
        });
    }
}