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
const ListManager = require("./lists");

app.post('/api/v1/login', async (req, res) => {
    try {
        const uid = AccountManager.createUser();
        return res.status(200).json(buildSuccessResponse(uid));
    } catch (status) {
        switch (status){
            default:
                return res.status(500).json(buildErrorResponse(status));
        }
    }
});

app.get('/api/v1/lists', async (req, res) => {
    try {
        const lists = ListManager.getLists();
        return res.status(200).json(buildSuccessResponse(lists));
    } catch (status) {
        switch (status){
            default:
                return res.status(500).json(buildErrorResponse(status));
        }
    }
});

app.put('/api/v1/lists', async (req, res) => {
    try {
        const userId = req.get("authorization");
        const name = req.body.name;
        const listUid = ListManager.createList(userId, name);
        return res.status(200).json(buildSuccessResponse(listUid));
    } catch (status) {
        switch (status){
            case 401:
                return res.status(status).json(buildErrorResponse("You are not authorized to perform this action."));
            default:
                return res.status(500).json(buildErrorResponse(status));
        }
    }
});

app.get('/api/v1/lists/:uid', async (req, res) => {
    try {
        const userId = req.get("authorization");
        const project = ListManager.lookupList(req.params.uid);
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

app.get("/*", async (req, res) => {
    return res.sendFile(path.join(cwd, "public", "index.html"));
});