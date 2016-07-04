/**
 * Created by raghav on 3/7/16.
 */

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var sget = require('sget');

var colorOptions = [
    "#ff0000", "#e50000", "#d90000", "#330000", "#b26559", "#401d10", "#a65b29", "#ff8800",
    "#f2ba79", "#f2c200", "#7f6600", "#e6daac", "#403d30", "#403c00", "#eeff00", "#7d8060",
    "#7ca629", "#00ff22", "#33cc5c", "#1a6642", "#66cc9c", "#0d3330", "#00becc", "#00334d",
    "#566973", "#307cbf", "#bfe1ff", "#00258c", "#8091ff", "#2000f2", "#0a004d", "#464359",
    "#cbace6", "#cc00be", "#330d2b", "#8c467e", "#f20061", "#ff80b3", "#990029", "#733949",
    "#f2b6be"
];

app.get('/', function (req, res) {
    var express = require('express');
    app.use(express.static(path.join(__dirname)));
    res.sendFile(path.join(__dirname, '../express-proj', 'game.html'));
});

var config = {
    boardSize: null,
    maxNumberOfPlayers: null,
    blockingTime: null
};

var gameState = {
    cells: {},
    players: {},
    config: {},
    colors: {}
};
gameOn = false;
io.on('connection', function (socket) {
    socket.on('joinGame', function (from) {
        if (gameState.players[encodeURI(from)] == undefined) {
            gameState.players[encodeURI(from)] = {
                name: from,
                cells: []
            };
            var randomIndex = Math.floor(Math.random() * colorOptions.length);
            gameState.colors[encodeURI(from)] = gameState.colors[encodeURI(from)] = colorOptions[randomIndex];
            colorOptions.splice(randomIndex, 1);
        }
        io.emit('joinGame', from);
        io.emit('updateGameState', gameState);
    });
    socket.on('selectColor', function (user, x, y, color) {
        io.emit('selectColor', user, x, y, color);
    });
    socket.on('blockBoard', function () {
        io.emit('blockBoard');
    });
    socket.on('removePlayer', function (player) {
        if (gameState.players[encodeURI(player)] != undefined) {
            delete gameState.players[encodeURI(player)];
            colorOptions.push(gameState.colors[encodeURI(player)]);
            delete gameState.colors[encodeURI(player)];
            io.emit('updateGameState', gameState);
            console.log(player + " left the game! " + Object.keys(gameState.players).length + " player(s) is(are) still playing the game!");
        }
    });
    socket.on('updateGameState', function (gameState) {
        io.emit('updateGameState', gameState);
    });
    io.emit('updateGameState', gameState);
});

config.boardSize = sget('Boardsize ? [Min : 4 & Max : 12] : ');

while (config.boardSize < 4 || config.boardSize > 12) {
    console.log('Invalid Board Size!! Try again...');
    config.boardSize = sget('Boardsize ? [Min : 4 & Max : 12] : ');
}

config.maxNumberOfPlayers = sget('Max. No. of Players allowed ? [between 2 & 8] : ');

while (config.maxNumberOfPlayers < 2 || config.maxNumberOfPlayers > 8) {
    console.log('Invalid No. of players!! Try again...');
    config.maxNumberOfPlayers = sget('Max. No. of Players allowed ? [between 2 & 8] : ');
}

config.blockingTime = sget('Blocking Time in seconds ? [between 2 & 8] : ');

while (config.blockingTime < 2 || config.blockingTime > 8) {
    console.log('Invalid No. of players!! Try again...');
    config.blockingTime = sget('Blocking Time in seconds ? [between 2 & 8] : ');
}
gameState.config = config;
for (var i = 0; i < config.boardSize; i++) {
    for (var j = 0; j < config.boardSize; j++) {
        if (gameState.cells[i] == undefined) {
            gameState.cells[i] = {};
        }
        gameState.cells[i][j] = {
            color: null,
            occupiedBy: null
        };
    }
}

http.listen(80, function () {
    console.log('listening on *:80');
});