import { html, render } from "lit-html";

export default class MissingPage extends HTMLElement{
    constructor(){
        super();
        this.render();
    }

    private render(){
        const view = html`
            <div class="fixed center p-1 bg-white radius-0.5 border-1 border-solid border-grey-300 shadow-lg" flex="items-center row nowrap">
                <h1 class="font-bold font-xl inline-block">404</h1>
                <span class="inline-block mx-0.5 font-grey-500">|</span>
                <p class="font-grey-700 font-xs">
                    Project not found.
                </p>
            </div>
        `;
        render(view, this);
    }
}