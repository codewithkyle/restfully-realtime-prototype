const http = require('http');
const express = require('express');
const app = express();
app.use(express.static('public'));
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const httpServer = http.createServer(app);
httpServer.listen(5001);
const path = require("path");
const cwd = process.cwd();

const { buildSuccessResponse, buildErrorResponse, clone } = require("./utils");
const AccountManager = require("./accounts");
const ListManager = require("./lists");
const CommandCenter = require("./command-center");
const generate = require("./diff");

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
        const { name } = req.body;
        const listUid = ListManager.create(userId, name);
        const list = ListManager.lookup(listUid);
        CommandCenter.op({
            op: "INSERT",
            table: "lists",
            key: list.uid,
            value: list,
        });
        return res.status(200).json(buildSuccessResponse(list));
    } catch (status) {
        switch (status){
            case 401:
                return res.status(status).json(buildErrorResponse("You are not authorized to perform this action."));
            default:
                return res.status(500).json(buildErrorResponse(status));
        }
    }
});

app.delete('/api/v1/lists/:listUid', async (req, res) => {
    try {
        const { listUid } = req.params;
        const userId = req.get("authorization");
        const list = ListManager.verifyAccess(listUid, userId);
        ListManager.deleteList(listUid);
        CommandCenter.op({
            op: "DELETE",
            table: "lists",
            key: listUid,
            tombstone: list,
        });
        return res.status(200).json(buildSuccessResponse());
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

app.post('/api/v1/lists/:listUid/toggle', async (req, res) => {
    try {
        const { listUid } = req.params;
        const userId = req.get("authorization");
        const list = ListManager.toggle(listUid);
        CommandCenter.op({
            op: "SET",
            table: "lists",
            key: listUid,
            keypath: "public",
            value: list.public,
        });
        return res.status(200).json(buildSuccessResponse(list));
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

app.post('/api/v1/lists/:listUid/update-title', async (req, res) => {
    try {
        const { listUid } = req.params;
        const { title } = req.body;
        const userId = req.get("authorization");
        const updated = ListManager.updateTitle(listUid, title);
        CommandCenter.op({
            table: "lists",
            key: listUid,
            op: "SET",
            keypath: `name`,
            value: title,
        });
        return res.status(200).json(buildSuccessResponse(updated));
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

app.put('/api/v1/lists/:listUid/items', async (req, res) => {
    try {
        const { listUid } = req.params;
        const { value } = req.body;
        const userId = req.get("authorization");
        const current = clone(ListManager.verifyAccess(listUid, userId));
        const updated = ListManager.addItem(listUid, value);
        CommandCenter.op(generate(current, updated, "lists", listUid));
        return res.status(200).json(buildSuccessResponse(updated));
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

app.delete('/api/v1/lists/:listUid/items/:itemUid', async (req, res) => {
    try {
        const { listUid, itemUid } = req.params;
        const userId = req.get("authorization");
        const updated = ListManager.removeItem(listUid, itemUid);
        CommandCenter.op({
            table: "lists",
            key: listUid,
            op: "UNSET",
            keypath: `items::${itemUid}`,
        });
        return res.status(200).json(buildSuccessResponse(updated));
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

app.post('/api/v1/lists/:listUid/items/:itemUid/update', async (req, res) => {
    try {
        const { listUid, itemUid } = req.params;
        const { value } = req.body;
        const userId = req.get("authorization");
        const updated = ListManager.updateLineItem(listUid, itemUid, value);
        CommandCenter.op({
            table: "lists",
            key: listUid,
            op: "SET",
            keypath: `items::${itemUid}::value`,
            value: value,
        });
        return res.status(200).json(buildSuccessResponse(updated));
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

app.post('/api/v1/lists/:listUid/items/:itemUid/move', async (req, res) => {
    try {
        const { listUid, itemUid } = req.params;
        const { hijackedItemId } = req.body;
        const userId = req.get("authorization");
        const updated = ListManager.moveLineItem(listUid, itemUid, hijackedItemId);
        const op = {
            op: "BATCH",
            ops: []
        };
        for (const key in updated.items){
            op.ops.push({
                op: "SET",
                table: "lists",
                key: listUid,
                keypath: `items::${key}::order`,
                value: updated.items[key].order,
            });
        }
        CommandCenter.op(op);
        return res.status(200).json(buildSuccessResponse(updated));
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