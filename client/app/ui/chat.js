'use strict';

var utils = require('../../../shared/utils')
    , Chat;

Chat = utils.inherit(null, {
    x: 0
    , y: 0
    , width: 0
    , height: 0
    , _line: null
    , _input: null
    , _rows: null
    , _messages: null
    , _styles: null
    , _enterKey: null
    , _capture: false
    , constructor: function(x, y, rows, font, game) {
        this.x = x;
        this.y = y;

        this._rows = [];
        this._messages = [
            {text: '/s Good day sir!', style: 'all'}
            , {text: '/t This is a message to the team', style: 'team'}
            , {text: '/w foo This is a private message', style: 'private'}
        ];
        this._styles = {
            all: {font: font, fill: '#ffffff'}
            , team: {font: font, fill: '#0099ff'}
            , private: {font: font, fill: '#cc00ff'}
        };

        this._enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        game.input.keyboard.addCallbacks(this, this.onKeyPressed);

        for (var i = 0; i < rows; i++) {
            this._rows.push(game.add.text(this.x, this.y + (16 * i), '', this._styles.all));
        }

        this._input = game.add.text(this.x, this.y + (16 * (rows + 1)), '', this._styles.all);
    }
    , onKeyPressed: function(event) {
        if (this._capture) {
            this._line = this._line || '';

            var letter = String.fromCharCode(event.which);
            if (!event.shiftKey) {
                letter = letter.toLowerCase();
            }

            this._line += letter;
        }
    }
    , add: function(message) {
        if (message.text) {
            if (!message.style) {
                message.style = 'all';
            }

            this._messages.push(message);
        }
    }
    , update: function(elapsed) {
        var offset = this._messages.length - this._rows.length
            , message;

        if (offset < 0) {
            offset = 0;
        }

        for (var i = 0; i < this._rows.length; i++) {
            if (this._messages[i]) {
                message = this._messages[i + offset];
                this._rows[i].text = message.text;
                this._rows[i].setStyle(this._styles[message.style]);
            }
        }

        if (this._enterKey.isDown) {
            if (!this._capture) {
                this._capture = true;
                console.log('capturing input');
            } else {
                this.add({text: this._line});
                this._input.text = '';
                this._line = null;
                this._capture = false;
            }
        }

        if (this._line) {
            this._input.text = this._line;
        }
    }
});

module.exports = Chat;
