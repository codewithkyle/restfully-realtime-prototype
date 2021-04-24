import { configure, mount } from "@codewithkyle/router";

const main = document.body.querySelector("main");
mount(main);

// Configure the router
configure({
    "/": {
        tagName: "home-page",
        file: "./homepage.js",
    },
    "/projects": "project-browser",
    "/project/{UID}": {
        tagName: "project-component",
        file: "./project.js",
    },
    "/products": "product-browser",
    "404": "missing-page",
});