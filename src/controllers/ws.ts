import idb from "./idb-manager";

const socket = new WebSocket('ws://localhost:5002');
socket.addEventListener('message', (event) => {
    try {
        const data = JSON.parse(event.data);
        idb.handleOP(data);
    } catch (e) {
        console.error(e);
        console.log(event.data);
    }
});