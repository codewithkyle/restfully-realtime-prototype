import { html, render } from "lit-html";
import debounce from "../utils/debounce";
import idb from "../controllers/idb-manager";
import SuperComponent from "@codewithkyle/supercomponent";
import { publish } from "@codewithkyle/pubsub";

type ListItemState = {
    uid: string;
    value: string;
    listUid: string;
    order: number;
};
export default class ListItem extends SuperComponent<ListItemState>{
    constructor(uid, value, order, listUid){
        super();
        this.model = {
            uid: uid,
            value: value,
            listUid: listUid,
            order: order,
        };
        this.render();
    }

    private startDrag = (e:DragEvent) => {
        this.style.opacity = "0.3";
        e.dataTransfer.setData("uid", this.model.uid);
    }

    private stopDrag:EventListener = (e:Event) => {
        this.style.opacity = "1";
    }

    private dragEnter:EventListener = (e:Event) => {
        e.preventDefault();
        this.classList.add("drop-highlight");
    }

    private dragLeave:EventListener = (e:Event) => {
        this.classList.remove("drop-highlight");
    }

    private drop = async (e:DragEvent) => {
        e.preventDefault();
        this.classList.remove("drop-highlight");
        const data = {
            hijackedItemId: this.model.uid,
        };
        const targetUid = e.dataTransfer.getData("uid");
        if (this.model.uid === targetUid){
            return;
        }
        const request = await fetch(`/api/v1/lists/${this.model.listUid}/items/${targetUid}/move`, {
            method: "POST",
            headers: new Headers({
                Accept: "application/json",
                Authorization: localStorage.getItem("uid"),
                "Content-Type": "application/json",
            }),
            body: JSON.stringify(data),
        });
        const response = await request.json();
        if (request.ok && response.success){
            await idb.addList(response.data);
            // @ts-ignore
            this.closest("list-component").update(response.data);
        }
    }

    private deleteItem:EventListener = async (e:Event) => {
        const request = await fetch(`/api/v1/lists/${this.model.listUid}/items/${this.model.uid}`, {
            method: "DELETE",
            headers: new Headers({
                Accept: "application/json",
                Authorization: localStorage.getItem("uid"),
                "Content-Type": "application/json",
            }),
        });
        const response = await request.json();
        if (response.success){
            await idb.addList(response.data);
            this.remove();
        }
    }

    private async updateLineItem(target:HTMLTextAreaElement){
        const value = target.value.trim();
        const data = {
            value: value,
        };
        const request = await fetch(`/api/v1/lists/${this.model.listUid}/items/${this.model.uid}/update`, {
            method: "POST",
            headers: new Headers({
                Accept: "application/json",
                Authorization: localStorage.getItem("uid"),
                "Content-Type": "application/json",
            }),
            body: JSON.stringify(data),
        });
        const response = await request.json();
        if (request.ok && response.success){
            await idb.addList(response.data);
            target.style.height = `${target.scrollHeight}px`;
        }
    }
    private debounceLineItemInput = debounce(this.updateLineItem.bind(this), 600, false);
    private handleLineItemInput: EventListener = (e:Event) => {
        const target = e.currentTarget as HTMLInputElement;
        this.debounceLineItemInput(target);
    }

    connected(){
        this.addEventListener("drop", this.drop);
        this.addEventListener("dragover", this.dragEnter);
        this.addEventListener("dragleave", this.dragLeave);
        this.dataset.uid = this.model.uid;
    }

    render(){
        const view = html`
            <button draggable="true" @dragstart=${this.startDrag} @dragend=${this.stopDrag}>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
                </svg>
            </button>
            <input title="${this.model.value}" type="text" @input=${this.handleLineItemInput} value="${this.model.value}">
            <button @click=${this.deleteItem}>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        `;
        render(view, this);
        this.style.order = `${this.model.order}`;
    }
}