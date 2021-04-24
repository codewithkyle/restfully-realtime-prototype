import { navigateTo } from "@codewithkyle/router";
import { html, render } from "lit-html";

export default class ProjectBrowser extends HTMLElement{
    constructor(){
        super();
        this.init();
    }

    private async init(){
        const request = await fetch("/api/v1/projects", {
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

    private createNewProject:EventListener = async (e:Event) => {
        const name = prompt("New project name:");
        if (!name){
            return;
        }
        const data = {
            name: name,
        };
        const request = await fetch("/api/v1/projects", {
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
            navigateTo(`/project/${response.data}`);
        }
    }

    private render(projects){
        const view = html`
            <div class="w-mobile max-w-full mt-4 mx-auto radius-0.5 bg-white shadow-sm p-1">
                ${projects.map(project => {
                    return html`<a href="/project/${project.uid}" class="radius-0.5 w-full px-1 mb-1 font-grey-800 bg-grey-100" flex="items-center" style="height:48px">
                        ${project.name}
                </a>`;
                })}
                <button @click=${this.createNewProject} class="bttn w-full" kind="solid" color="primary" shape="rounded">New Project</button>
            </div>
        `;
        render(view, this);
    }
}