const socket = new WebSocket('ws://localhost:5002');
socket.addEventListener('open', (event) => {
    socket.send('Hello Server!');
});
socket.addEventListener('message', (event) => {
    console.log('Message from server:', event.data);
});