'use strict';

require.config({
    baseUrl: 'static/js/',
    shim: {
    	'phaser': {
    		exports: 'Phaser'
    	},
        'socket.io': {
            exports: 'io'
        }
    },
    paths: {
        dungeon: 'dungeon',
        shared: 'shared',
        lodash: 'lib/lodash/dist/lodash.compat',
        jquery: 'lib/jquery/dist/jquery',
        requirejs: 'lib/requirejs/require',
        phaser: 'lib/phaser-official/build/phaser',
        'socket.io': '../../socket.io/socket.io'
    }
});
