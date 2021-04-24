import { html, render } from "lit-html";

export default class ProjectBrowser extends HTMLElement{
    constructor(){
        super();
        this.render();
    }

    private render(){
        const view = html`Hello world`;
        render(view, this);
    }
}