import { navigateTo } from "@codewithkyle/router";
import { html, render } from "lit-html";

import { LoginComponent } from "../components/login-component";
customElements.define("login-component", LoginComponent);

export default class Homepage extends HTMLElement{
    constructor(){
        super();
        this.render();
    }

    private render(){
        const view = html`
            <div class="w-full h-full" flex="items-center justify-center">
                ${ sessionStorage.getItem("uid") ? html`
                    <div class="block p-1 bg-white radius-0.5 shadow-md w-mobile max-w-full" grid="columns 2 gap-1">
                        <a href="/projects" class="bttn" kind="solid" color="primary" shape="rounded">View Projects</a>
                        <a href="/products" class="bttn" kind="solid" color="primary" shape="rounded">View Products</a>
                    </div>
                ` : html`
                    <login-component class="block p-1 bg-white radius-0.5 shadow-md w-mobile max-w-full">
                        <form>
                            <div class="input">
                                <input type="email" name="email" placeholder="Email address" required>
                            </div>
                            <button type="submit" class="bttn w-full mt-1" kind="solid" color="primary" shape="rounded">Login</button>
                        </form>
                    </login-component>
                ` }
            </div>
        `;
        render(view, this);
    }
}