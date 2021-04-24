import { navigateTo } from "@codewithkyle/router";
import { html, render } from "lit-html";

export default class ProductBrowser extends HTMLElement{
    constructor(){
        super();
        this.init();
    }

    private async init(){
        const request = await fetch("/api/v1/products", {
            method: "GET",
            headers: new Headers({
                Accept: "application/json",
            }),
        });
        const response = await request.json();
        if (response.success){
            this.render(response.data);
        }
    }

    private createNewProduct:EventListener = async (e:Event) => {
        const name = prompt("New product name:");
        if (!name){
            return;
        }
        const data = {
            name: name,
        };
        const request = await fetch("/api/v1/products", {
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
            await this.init();
        }
    }

    private render(products){
        const view = html`
            <div class="w-full h-full" flex="items-center justify-center">
                <div class="w-mobile max-w-full mt-4 mx-auto radius-0.5 bg-white shadow-sm p-1">
                    <h1 class="block w-full font-grey-800 font-lg mb-1 font-bold text-center">Products</h1>
                    ${products.map(product => {
                        return html`
                            <div class="radius-0.5 w-full px-1 mb-1 font-grey-800 bg-grey-100 border-1 border-solid border-grey-300" flex="items-center" style="height:48px">
                                ${product.name}
                            </div>
                        `;
                    })}
                    <button @click=${this.createNewProduct} class="bttn w-full" kind="solid" color="primary" shape="rounded">New Product</button>
                </div>
            </div>
        `;
        render(view, this);
    }
}