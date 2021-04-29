import { html, render } from "lit-html";
import { navigateTo } from "@codewithkyle/router";
import idb from "../controllers/idb-manager";
import SuperComponent from "@codewithkyle/supercomponent";
import { subscribe, unsubscribe } from "@codewithkyle/pubsub";
import { toast } from "@codewithkyle/notifyjs";

type ListBrowserState = {
    lists: Array<any>,
};
export default class ListBrowser extends SuperComponent<ListBrowserState>{
    private inboxId: string;

    constructor(){
        super();
        if (!localStorage.getItem("uid")){
            navigateTo("/");
        }
        this.model = {
            lists: [],
        };
        this.init();
    }

    private async init(){
        const lists = await idb.getLists();
        this.update({
            lists: lists,
        });
    }

    private createList:EventListener = async (e:Event) => {
        const name = prompt("List name:");
        if (!name){
            return;
        }
        const data = {
            name: name,
        };
        const request = await fetch("/api/v1/lists", {
            method: "PUT",
            headers: new Headers({
                Accept: "application/json",
                Authorization: localStorage.getItem("uid"),
                "Content-Type": "application/json",
            }),
            body: JSON.stringify(data),
        });
        const response = await request.json();
        if (response.success){
            await idb.addList(response.data);
            navigateTo(`/lists/${response.data.uid}`);
            toast({
                title: "List Created",
                message: `List ${name} has been created.`,
                classes: ["-green"],
                closeable: true,
            });
        }
    }

    private async inbox(){
        const lists = await idb.getLists();
        this.update({
            lists: lists,
        });
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
        const validLists = [];
        for (let i = 0; i < this.model.lists.length; i++){
            if (!this.model.lists[i].deleted){
                validLists.push(this.model.lists[i]);
            }
        }
        const view = html`
            <div class="w-full h-full" flex="items-center justify-center">
                <div class="w-mobile max-w-full mt-4 mx-auto radius-0.5 bg-white shadow-sm p-1 border-1 border-solid border-grey-300" style="max-height: calc(100vh - 2rem);overflow-y: auto;">
                    <h1 class="block w-full font-grey-800 font-lg mb-1 font-bold text-center">Lists</h1>
                    ${validLists.length ? validLists.map(list => {
                        if (list.deleted){
                            return;
                        }
                        return html`
                            <a href="/lists/${list.uid}" class="radius-0.5 w-full px-1 mb-1 font-grey-800 bg-grey-100 border-1 border-solid border-grey-300" flex="items-center" style="height:48px">
                                ${list.name}
                            </a>
                        `;
                    }) : html`<p class="w-full block text-center font-grey-700 line-normal font-sm mb-1.5">Create a list to get started.</p>`}
                    <div class="block w-full" grid="columns 2 gap-1">
                        <a href="/" class="bttn" kind="solid" color="primary" shape="rounded">Back</a>
                        <button @click=${this.createList} class="bttn" kind="solid" color="success" shape="rounded">Create List</button>
                    </div>
                </div>
            </div>
        `;
        render(view, this);
    }
}