define([
    'phaser'
    , 'shared/utils'
    , 'shared/entity'
], function (Phaser, utils, Entity) {
    'use strict';

    // client-side chest class
    var Chest = utils.inherit(Entity, {
        key: 'chest'
        , width: 32
        , height: 32
        // loads entity assets
        , preload: function(game) {
            // pre-load sprite images
            game.load.image(
                'treasure-chest-1'
                , 'static/assets/images/sprites/loot/treasure-chest-1.png'
            );
        }
    });

    return Chest;
});
