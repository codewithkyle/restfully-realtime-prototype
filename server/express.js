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

app.get("/*", async (req, res) => {
    return res.sendFile(path.join(cwd, "public", "index.html"));
});