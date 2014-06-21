dungeon-game
============

A fast-paced multiplayer action role playing game written in JavaScript.

Requirements
------------

A high level overview of the game structure:

### Server

- Built on-top of ExpressJS and Socket.io
- Authoritative server (as much as possible)
- Runs logic that cannot be run on the client
- Must be able to handle events from up to 100 clients
- Uses oddment tables for mobs and items
- Attaches to client events; emits and broadcasts events to clients
- Single point of configuration (configuration sent to clients)

### Client

- Built on-top of the Phaser framework (http://phaser.io)
- Runs physics (probably using the arcade physics system)
- Renders the game state in real time (doesn't wait for the server)
- Emits events to the server and attaches to server events (no broadcasting)
- Renders tile-based maps (JSON + png)
- Uses RequireJS as r.js can convert CommonJS modules to AMD modules

### Game objects

- Maintains the state of the game
- Base class under shared, client and server classes under respective directory
- Base classes packaged using r.js for the client
- Serialized objects are passed over the network (JSON)

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
- Enable socket communication __DONE__
- Player game object __DONE__
- Make clients aware of other clients __DONE__
- Object inheritance __DONE__
- Base for shared game objects (server, client) __DONE__
- Support for multiple game states (menu, gameplay, etc.) __DONE__
- Tile-based maps __DONE__
- Use namespace for socket communication __DONE__
- Component support for entities (maybe) __DONE__
- Spawn maps on the server and send it the to clients
- Spawn entities on the server and send them to the clients
- Object multi-inheritance (maybe)
- Some chest game objects
- Some monster game objects
- Oddment tables for item drops (run logic on server)
- PVE combat (run logic on server)
- Multiple socket rooms
- Generate random maps
- ...
