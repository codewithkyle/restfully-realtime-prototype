import { configure, mount } from "@codewithkyle/router";

const main = document.body.querySelector("main");
mount(main);

// Configure the router
configure({
    "/": {
        tagName: "home-page",
        file: "./homepage.js",
    },
    "/lists": "list-browser",
    "/lists/{UID}": {
        tagName: "list-component",
        file: "./list.js",
    },
    "404": "missing-page",
});