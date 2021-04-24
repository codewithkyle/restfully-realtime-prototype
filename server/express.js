const http = require('http');
const express = require('express');
const app = express();
app.use(express.static('public'));
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const httpServer = http.createServer(app);
httpServer.listen(5001);
const wss = require("./websockets");
const fs = require("fs");
const path = require("path");
const cwd = process.cwd();

const { buildSuccessResponse, buildErrorResponse } = require("./utils");
const AccountManager = require("./accounts");
const ProjectManager = require("./projects");
const ProductManager = require("./products");

app.post('/api/v1/login', async (req, res) => {
    try {
        const { email } = req.body;
        let uid = AccountManager.lookupUser(email);
        if (!uid){
            uid = AccountManager.createUser(email);
        }
        return res.status(200).json(buildSuccessResponse(uid));
    } catch (status) {
        switch (status){
            default:
                return res.status(500).json(buildErrorResponse(status));
        }
    }
});

app.get('/api/v1/projects', async (req, res) => {
    try {
        const projects = ProjectManager.getProjects();
        return res.status(200).json(buildSuccessResponse(projects));
    } catch (status) {
        switch (status){
            default:
                return res.status(500).json(buildErrorResponse(status));
        }
    }
});

app.put('/api/v1/projects', async (req, res) => {
    try {
        const userId = req.get("authorization");
        AccountManager.verifyUser(userId);
        const name = req.body.name;
        const projectUid = ProjectManager.createProject(userId, name);
        return res.status(200).json(buildSuccessResponse(projectUid));
    } catch (status) {
        switch (status){
            case 401:
                return res.status(status).json(buildErrorResponse("You are not authorized to perform this action."));
            default:
                return res.status(500).json(buildErrorResponse(status));
        }
    }
});

app.get('/api/v1/projects/:uid', async (req, res) => {
    try {
        const userId = req.get("authorization");
        AccountManager.verifyUser(userId);
        const project = ProjectManager.lookupProject(req.params.uid);
        return res.status(200).json(buildSuccessResponse(project));
    } catch (status) {
        switch (status){
            case 404:
                return res.status(status).json(buildErrorResponse(`Project with UID ${req.params.uid} does not exist.`));
            case 401:
                return res.status(status).json(buildErrorResponse("You are not authorized to perform this action."));
            default:
                return res.status(500).json(buildErrorResponse(status));
        }
    }
});

app.get('/api/v1/products', async (req, res) => {
    try {
        const products = ProductManager.getProducts();
        return res.status(200).json(buildSuccessResponse(products));
    } catch (status) {
        switch (status){
            default:
                return res.status(500).json(buildErrorResponse(status));
        }
    }
});

app.put('/api/v1/products', async (req, res) => {
    try {
        const userId = req.get("authorization");
        AccountManager.verifyUser(userId);
        const name = req.body.name;
        ProductManager.createProduct(userId, name);
        return res.status(200).json(buildSuccessResponse());
    } catch (status) {
        switch (status){
            case 401:
                return res.status(status).json(buildErrorResponse("You are not authorized to perform this action."));
            default:
                return res.status(500).json(buildErrorResponse(status));
        }
    }
});

app.get("/*", async (req, res) => {
    return res.sendFile(path.join(cwd, "public", "index.html"));
});