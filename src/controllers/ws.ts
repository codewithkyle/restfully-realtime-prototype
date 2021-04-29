import idb from "./idb-manager";

const socket = new WebSocket('ws://localhost:5002');

const operations = [];
let running = false;

async function processOperations(){
    running = true;
    const ops = operations.splice(0, operations.length);
    for (const op of ops){
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