# RESTfully Realtime Prototype

Prototyping a RESTful API with real time background synchronization via Web Sockets.

## Prototype Overview

This prototype is designed to explore the effort it would take to add a real time background synchronization layer to an existing RESTful API. In this prototype we will be using Web Sockets, however, WebRTC could be another promising technology allowing users to keep their peers in sync without relaying messages through the server.

## Roadmap

- [x] Basic account creation
- [x] Users can create lists
- [x] Users can update the list name
- [x] Users can delete a list they created
- [x] Users can make a list publicly editable
- [x] Users can add/update/delete list items
- [x] Users can rearrange list items
- [x] Add toaster notifications

## Postmortem

> A few things to note before reading. CRDT is an abbreviation for [Conflict-Free Replicated Data Types](https://crdt.tech/). I will also refer to the individual CRDT operations as opcodes. I noticed a similarity between the role that [opcodes](https://en.wikipedia.org/wiki/Opcode) play within CPU architectures and operation-based CRDTs. I am simply borrowing the terminology.

It's worth noting that I didn't implement the RESTful API "correctly" or more accurately, as I initially intended. I was expecting a single POST endpoint that I could hit in order to update a list. I intended to send the full data model to a single endpoint where the server would apply it to the in-memory model and a diffing algorithm would generate opcodes. In the end, I created a RESTful API with several endpoints designed to perform small individualized changes. Now for the postmortem.

I was able to add a real-time data synchronization layer to an existing RESTful API. One of the main problems I ran into was getting the UI to rerender without causing UX issues. Initially, one Web Component was used to render the entire list model. However, when the list item values changed the entire element would rerender causing the user to lose their focus state. If they were typing something it would also briefly reset the list item value to the previous state. To solve this issue I had to loosen the  DOM-model binding by breaking line items out into their own Web Components with their own data models. After doing so I could apply operations directly to a list item allowing the user to retain the active elements focus state. The UX jank can still occur, however, it's only when the user is trying to update a list item that another user is currently updating. I decided that the UX issues caused by two users updating the same input were acceptable and somewhat expected.

The other main issue that occurred was the inability to programmatically difference arrays accurately. I decided to create a tree structure in order to avoid performing move operations. Why avoid move operations? Because they can't be automatically detected when diffing two models.

For example, when comparing two values located at the same array index across two models it's unclear what operations need to be performed. If the values are the same we could assume nothing happened, however, we could also assume the index was deleted and the value in the adjacent slot (that now exists in the slot we are checking) is the exact same. You could argue that the lengths of the array would be different and I would agree. However, what if the user added a new item to the array making them the same length? What if they deleted two values within the array and added two new ones. Everything will have shifted making it impossible to detect what operations are actually needed. You might also ask, "why does it matter, can't you just send the new array to everyone?". You could, but what if another user has already made changes to one of the other values within the array. How do we sync their changes with yours?

Diffing arrays quickly becomes a major headache. So what's the solution? Banish arrays from the model. If that's not possible you'll need to refactor the API to handle move operations and you lose the ability to automatically diff and sync data. Essentially the point is that if arrays are involved a refactor will be required.

Overall I would label this prototype as a success. The next step in exploring CRDTs will be to create an offline-first prototype with complete peer-to-peer synchronization and a proper implementation of eventual consistency.