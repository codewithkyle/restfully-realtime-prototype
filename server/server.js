const http = require('http');
const express = require('express');
const app = express();
app.use(express.static('public'));
const httpServer = http.createServer(app);
httpServer.listen(5001);
const wss = require("./websockets");