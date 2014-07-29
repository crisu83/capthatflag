CAP THAT FLAG
=============

A fast-paced multiplayer capture that flag game written in JavaScript.

Specifications
--------------

A high level overview of the game structure:

### Server

- Built on-top of ExpressJS and Primus.io (http://express.io, http://primus.io)
- Authoritative server (does all computations)
- Must be able to handle events from up to 100 clients
- Attaches to client events; emits and broadcasts events to clients
- Single point of configuration (configuration sent to clients)
- Runs custom physics

### Client

- Built on-top of the Phaser framework (http://phaser.io)
- Renders the game state in real time (doesn't wait for a response from the server)
- Emits events to the server and attaches to server events
- Renders tile-based maps build in using Tiled (http://www.mapeditor.org/)
- Uses Grunt and Browserify to build the client

### Entities

- Final entity class that can be initialized from JSON data through a factory
- Functionality added with various components (both server and client)
- Attributes stored under a single property
- Can be serialize to JSON for network communication

### Gameplay

- Fast-paced CTF
- Easy to play and quick to learn
- Short games that players can join at any point
- Four teams that players join automatically
- Emphasizes team play over solo play
- Multiplayer with support for a lot of players
