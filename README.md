CAP THAT FLAG
=============

A fast-paced multiplayer action role playing game written in JavaScript.

Specifications
--------------

A high level overview of the game structure:

### Server

- Built on-top of ExpressJS and Primus.io
- Authoritative server (does all sensitive calculations)
- Must be able to handle events from up to 100 clients
- Uses oddment tables for mob spawns and item drops
- Attaches to client events; emits and broadcasts events to clients
- Single point of configuration (configuration sent to clients)

### Client

- Built on-top of the Phaser framework (http://phaser.io)
- Runs physics (arcade physics, and ninja if seen necessary)
- Renders the game state in real time (doesn't wait for the server)
- Emits events to the server and attaches to server events
- Renders tile-based maps (JSON + png)
- Uses RequireJS as r.js can convert CommonJS modules to AMD modules

### Entities

- Final entity class that can be initialized with JSON data through a factory
- Functionality added by various components (both server and client)
- Attributes stored under a single property
- Can be serialize to JSON for network communication

### Gameplay

- Fast-paced ARPG
- Easy to play and quick to learn
- Players can join at any point
- Multiplayer with up to 100 players
- Genuine role playing experience
- Randomly generated maps
- Reveal map using line of sight
- Random mobs and item drops
- Runs on mobile devices (tablet and phone)
- Combat log (server updates and clients read)
- Multiple game rooms (maybe)
- In-game chat (maybe)

To-dos
------

Things to do, in order of priority:

- Basic server __DONE__
- Basic client __DONE__
- Modular design with shared classes __DONE__
- Enable socket communication __DONE__
- Player game object __DONE__
- Make clients aware of other clients __DONE__
- Object inheritance __DONE__
- Base for shared classes (server, client) __DONE__
- Support for multiple game states (menu, gameplay, etc.) __DONE__
- Tile-based maps __DONE__
- Use namespace for socket communication __DONE__
- Component support for entities (maybe) __DONE__
- Spawn maps on the server and send it the to clients __DONE__
- Spawn entities on the server and send them to the clients __DONE__
- Server game loop (10-30 ticks per second) __DONE__
- Entity prediction and server reconciliation __DONE__
- Synchronize server state to all clients __DONE__
- Entity delay and interpolation __DONE__
- Fix client prediction and server reconciliation
- Some chest game objects
- Some monster game objects
- Oddment tables for item drops (run logic on server)
- PVE combat (run logic on server)
- Multiple socket rooms
- Randomly generated maps
- ...
