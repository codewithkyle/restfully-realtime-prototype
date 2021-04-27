import idb from "../controllers/idb-manager";
import { html, render } from "lit-html";
import SuperComponent from "@codewithkyle/supercomponent";
import css from "../utils/css";
import { navigateTo } from "@codewithkyle/router";
import { subscribe, unsubscribe } from "@codewithkyle/pubsub";

type ListState = {
    items: Array<any>,
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
            items: [],
            uid: null,
            author: null,
            name: null,
            public: false,
        };
        this.init(tokens.UID);
    }

    private async init(uid){
        await css(["list", "overflow-menu"]);
        const list = await idb.getList(uid);
        if (!list){
            navigateTo("/lists");
        }
        this.update(list);
    }

    private async inbox(data){
        if (data === this.model.uid){
            const updatedList = await idb.getList(this.model.uid);
            if (updatedList === null){
                navigateTo("/lists");
            } else {
                this.update(updatedList);
            }
        }
    }

    private deleteList:EventListener = async (e:Event) => {
        const request = await fetch(`/api/v1/lists/${this.model.uid}`, {
            method: "DELETE",
            headers: new Headers({
                Accept: "application/json",
                Authorization: sessionStorage.getItem("uid"),
            }),
        });
        const response = await request.json();
        if (request.ok && response.success){
            await idb.deleteList(this.model.uid);
            navigateTo("/lists");
        }
    }

    private togglePublic:EventListener = async (e:Event) => {
        const request = await fetch(`/api/v1/lists/${this.model.uid}/toggle`, {
            method: "POST",
            headers: new Headers({
                Accept: "application/json",
                Authorization: sessionStorage.getItem("uid"),
            }),
        });
        const response = await request.json();
        if (request.ok && response.success){
            await idb.addList(response.data);
            this.update(response.data);
        }
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
                <div class="block px-0.5 py-0.75 bg-white radius-0.5 shadow-md w-mobile max-w-full">
                    <div class="w-full" flex="items-center row nowrap">
                        <a href="/lists" class="bttn mr-0.25" icon="center" kind="text" color="grey" shape="round">
                            <svg style="width:20px;height:20px;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                            </svg>
                        </a>
                        <input class="title-input" type="text" value="${this.model.name}">
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
                    ${this.model.items.map(item => {
                        return html`
                            <div class="block w-full font-grey-800 mt-1 px-1 bg-grey-100 border-1 border-solid border-grey-300 radius-0.25" flex="row nowrap items-center" style="height:36px;" data-uid="${item.uid}">
                                ${item.name}
                            </div>
                        `;
                    })}
                </div>
            </div>
        `;
        render(view, this);
    }
}