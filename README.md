dungeon-game
============

A fast-paced multiplayer action role playing game written in JavaScript.

Requirements
------------

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

### Game objects

- Maintains the state of the game
- Can be serialized into JSON
- Serialized objects are passed over the network
- CommonJS modules packaged using glue.js for the client

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
