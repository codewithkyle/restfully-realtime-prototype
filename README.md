# RESTfully Realtime Prototype

Prototyping a RESTful API with real time background synchronization via Web Sockets.

## Prototype Overview

This prototype is designed to explore the effort it would take to add a real time background synchronization layer to an existing RESTful API. In this prototype we will be using Web Sockets, however, WebRTC could be another promising technology allowing users to keep their peers in sync without relaying messages through the server.

## Roadmap

- [ ] Basic account creation
- [ ] Users can create products
- [ ] Users can create purchase orders
- [ ] Users can add products to purchase orders
- [ ] Users can change product quantities on a purhcase order
- [ ] Sync purchase order model (product quantity) changes with all connected users

### Bonus

- [ ] Store information in IDB
- [ ] Keep all products and purchase orders in sync
- [ ] Add persistance with [Prisma](https://www.prisma.io/)
- [ ] Implement [Firebase Auth](https://firebase.google.com/)

## Postmortem

Pending.