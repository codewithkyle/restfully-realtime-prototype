import { navigateTo } from "@codewithkyle/router";
import { html, render } from "lit-html";
import fuzzysort from "fuzzysort";

export default class Project extends HTMLElement{
    private uid: string;
    private products: Array<any>;
    private project: any;
    private productSearch: Array<any>;

    constructor(tokens, params){
        super();
        this.uid = tokens.UID;
        this.products = [];
        this.project = null;
        this.productSearch = [];
        this.init();
    }

    private async init(){
        const request = await fetch(`/api/v1/projects/${this.uid}`, {
            method: "GET",
            headers: new Headers({
                Accept: "application/json",
                Authorization: sessionStorage.getItem("uid"),
            })
        });
        const response = await request.json();
        const productRequest = await fetch(`/api/v1/products`, {
            method: "GET",
            headers: new Headers({
                Accept: "application/json",
                Authorization: sessionStorage.getItem("uid"),
            })
        });
        const productResponse = await productRequest.json();
        if (response.success && productResponse.success){
            this.products = productResponse.data;
            this.project = response.data;
            this.render();
        } else {
            navigateTo(`/projects`);
        }
    }

    private searchProducts:EventListener = (e:Event) => {
        const input = e.currentTarget as HTMLInputElement;
        if (input.value.length){
            const results = fuzzysort.go(input.value, this.products, {
                allowTypo: false,
                threshold: -10000,
                key: "name"
            });
            this.productSearch = [];
            for (let i = 0; i < results.length; i++){
                this.productSearch.push(results[i].obj);
            }
            this.render();
        }
    }

    private addProduct:EventListener = (e:Event) => {
        const target = e.currentTarget as HTMLElement;
        let product = null;
        for (let i = 0; i < this.products.length; i++){
            if (this.products[i].uid === target.dataset.uid){
                product = this.products[i];
                break;
            }
        }
        // TODO: update qty if product already exists
        this.project.products.push(product);
        this.productSearch = [];
        this.render();
    }

    private render(){
        const view = html`
            <div class="w-full h-full" flex="items-center justify-center">
                <div class="block p-1 bg-white radius-0.5 shadow-md w-tablet max-w-full">
                    <div class="input">
                        <input type="search" placeholder="Search products..." @input=${this.searchProducts}>
                        ${this.productSearch.length ? html`
                            <div class="block w-full absolute bg-white p-0.5 radius-0.25 shadow-md" style="z-index:1000;left:0;top:100%;">
                                ${this.productSearch.map(product => {
                                    return html`
                                        <button class="bttn w-full" kind="text" color="grey" shape="rounded" @click=${this.addProduct} data-uid="${product.uid}">${product.name}</button>
                                    `;
                                })}
                            </div>
                        ` : ""}
                        ${this.project.products.map(product => {
                            return html`
                                <div class="block w-full font-grey-800 mt-1 px-1 bg-grey-100 border-1 border-solid border-grey-300 radius-0.25" flex="row nowrap items-center" style="height:36px;" data-uid="${product.uid}">
                                    ${product.name}
                                </div>
                            `;
                        })}
                    </div>
                </div>
            </div>
        `;
        render(view, this);
    }
}