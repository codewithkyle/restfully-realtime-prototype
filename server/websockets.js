const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 5002 });
wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        // TODO: handle message
    });
    // ws.send('something');
});
module.exports = wss;