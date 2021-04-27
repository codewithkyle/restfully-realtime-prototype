import { html, render } from "lit-html";
import { navigateTo } from "@codewithkyle/router";
import idb from "../controllers/idb-manager";

export default class ListBrowser extends HTMLElement{
    constructor(){
        super();
        this.init();
    }

    private async init(){
        const lists = await idb.getLists();
        this.render(lists);
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
                Authorization: sessionStorage.getItem("uid"),
                "Content-Type": "application/json",
            }),
            body: JSON.stringify(data),
        });
        const response = await request.json();
        if (response.success){
            await idb.addList(response.data);
            navigateTo(`/lists/${response.data.uid}`);
        }
    }

    private render(lists){
        const view = html`
            <div class="w-full h-full" flex="items-center justify-center">
                <div class="w-mobile max-w-full mt-4 mx-auto radius-0.5 bg-white shadow-sm p-1">
                    <h1 class="block w-full font-grey-800 font-lg mb-1 font-bold text-center">Lists</h1>
                    ${lists?.length ? lists.map(list => {
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