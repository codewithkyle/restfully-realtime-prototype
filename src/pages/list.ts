import idb from "../controllers/idb-manager";
import { html, render } from "lit-html";
import SuperComponent from "@codewithkyle/supercomponent";

type ListState = {
    items: Array<any>,
    uid: string,
    author: string,
    name: string,
};
export default class List extends SuperComponent<ListState>{

    constructor(tokens, params){
        super();
        this.model = {
            items: [],
            uid: null,
            author: null,
            name: null,
        };
        this.init(tokens.UID);
    }

    private async init(uid){
        const list = await idb.getList(uid);
        this.update(list);
    }

    render(){
        const view = html`
            <div class="w-full h-full" flex="items-center justify-center">
                <div class="block p-1 bg-white radius-0.5 shadow-md w-mobile max-w-full">
                    <div>
                        <a href="/lists" class="bttn" icon="center" kind="text" color="grey" shape="round">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                            </svg>
                        </a>
                        <input type="text" value="${this.model.name}">
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