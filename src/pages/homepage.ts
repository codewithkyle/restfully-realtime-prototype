import { navigateTo } from "@codewithkyle/router";
import { html, render } from "lit-html";
import idb from "../controllers/idb-manager";
import { toast } from "@codewithkyle/notifyjs";

export default class Homepage extends HTMLElement{
    constructor(){
        super();
        this.init();
    }

    private async init(){
        if (!localStorage.getItem("uid")){
            const request = await fetch("/api/v1/login", {
                method: "POST",
                headers: new Headers({
                    Accept: "application/json",
                })
            });
            const response = await request.json();
            if (request.ok && response.success){
                localStorage.setItem("uid", response.data);
            }
        }
        this.render();
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

    private render(){
        const view = html`
            <div class="w-full h-full" flex="items-center justify-center">
                <div class="block p-1 bg-white radius-0.5 shadow-md w-mobile max-w-full border-1 border-solid border-grey-300" grid="columns 2 gap-1">
                    <a href="/lists" class="bttn" kind="solid" color="primary" shape="rounded">View Lists</a>
                    <button @click=${this.createList} class="bttn" kind="solid" color="success" shape="rounded">Create List</button>
                </div>
            </div>
        `;
        render(view, this);
    }
}