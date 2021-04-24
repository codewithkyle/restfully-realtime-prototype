import { navigateTo } from "@codewithkyle/router";

export default class Project extends HTMLElement{
    private uid: string;
    constructor(tokens, params){
        super();
        this.uid = tokens.UID;
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
        if (response.success){
            // TODO: render
        } else {
            navigateTo(`/projects`);
        }
    }
}