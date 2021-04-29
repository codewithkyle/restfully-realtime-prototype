import idb from "./idb-manager";

const socket = new WebSocket('ws://localhost:5002');

const operations = [];
let running = false;

async function processOperations(){
    running = true;
    for (const op of operations){
        await idb.handleOP(op);
    }
    running = false;
}

socket.addEventListener('message', (event) => {
    try {
        const op = JSON.parse(event.data);
        operations.push(op);
        if (!running){
            processOperations();
        }
    } catch (e) {
        console.error(e);
        console.log(event.data);
    }
});