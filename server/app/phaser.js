// this is an ingenius hack that allows us to run Phaser without a browser
// ... and yes, it took some time to figure out how to do this

var Canvas = require('canvas')
    , jsdom = require('jsdom')
    , document = jsdom.jsdom(null)
    , window = document.parentWindow
    , Phaser;

// expose a few things to all the modules
global.document = document;
global.window = window;
global.Canvas = Canvas;
global.Image = Canvas.Image;
global.window.CanvasRenderingContext2D = 'foo'; // let Phaser know that we have a canvas
global.window.Element = undefined;
global.navigator = {userAgent: 'Custom'}; // could be anything

// fake the xml http request object because Phaser.Loader uses it
global.XMLHttpRequest = function() {};

// load an expose PIXI in order to finally load Phaser
global.PIXI = require('Phaser/build/custom/pixi');
global.Phaser = Phaser = require('Phaser/build/custom/phaser-arcade-physics');

module.exports = Phaser;
