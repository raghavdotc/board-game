/**
 * Created by raghav on 4/7/16.
 */

var app = require('express')();

var http = require('http').Server(app);

var io = require('socket.io')(http);

var path = require('path');

var sget = require('sget');

var playerSessions = {
    count: 0,
    sessions: {},
    colorOptions: [
        "#ff0000", "#e50000", "#d90000", "#330000", "#b26559", "#401d10", "#a65b29", "#ff8800",
        "#f2ba79", "#f2c200", "#7f6600", "#e6daac", "#403d30", "#403c00", "#eeff00", "#7d8060",
        "#7ca629", "#00ff22", "#33cc5c", "#1a6642", "#66cc9c", "#0d3330", "#00becc", "#00334d",
        "#566973", "#307cbf", "#bfe1ff", "#00258c", "#8091ff", "#2000f2", "#0a004d", "#464359",
        "#cbace6", "#cc00be", "#330d2b", "#8c467e", "#f20061", "#ff80b3", "#990029", "#733949",
        "#f2b6be"
    ],
    gameState: {
        cells: [],
        status: 0,
        colors: {}
    },
    gameConfig: {
        boardSize: null,
        maxNumberOfPlayers: null,
        blockingTime: null
    },
    cellsBlocked: 0
};

playerSessions.gameConfig.boardSize = sget('Boardsize ? [Min : 4 & Max : 12] : ');

while (playerSessions.gameConfig.boardSize < 4 || playerSessions.gameConfig.boardSize > 12) {
    console.log('Invalid Board Size!! Try again...');
    playerSessions.gameConfig.boardSize = sget('Boardsize ? [Min : 4 & Max : 12] : ');
}

for (var i = 0; i < playerSessions.gameConfig.boardSize; i++) {
    playerSessions.gameState.cells[i] = {};
    for (var j = 0; j < playerSessions.gameConfig.boardSize; j++) {
        playerSessions.gameState.cells[i][j] = {
            'fill': 'white',
            'occupiedBy': null
        };
    }
}

playerSessions.gameConfig.maxNumberOfPlayers = sget('Max. No. of Players allowed ? [between 2 & 8] : ');

while (playerSessions.gameConfig.maxNumberOfPlayers < 2 || playerSessions.gameConfig.maxNumberOfPlayers > 8) {
    console.log('Invalid No. of players!! Try again...');
    playerSessions.gameConfig.maxNumberOfPlayers = sget('Max. No. of Players allowed ? [between 2 & 8] : ');
}

playerSessions.gameConfig.blockingTime = sget('Blocking Time in seconds ? [between 2 & 8] : ');

while (playerSessions.gameConfig.blockingTime < 2 || playerSessions.gameConfig.blockingTime > 8) {
    console.log('Invalid No. of players!! Try again...');
    playerSessions.gameConfig.blockingTime = sget('Blocking Time in seconds ? [between 2 & 8] : ');
}

app.get('/', function (req, res) {
    var express = require('express');
    app.use(express.static(path.join(__dirname)));
    res.sendFile(path.join(__dirname, '../board-game', 'board-game.html'));
});

io.on('connection', function (socket) {
    socket.on('joinGame', function (user, color) {
        io.emit('playerJoined', user, color);
    });

    socket.on('playerSessions', function (sessions) {
        playerSessions = sessions;
        io.emit('playerSessions', sessions);
    });

    socket.on('removePlayer', function (player) {
        if (playerSessions.sessions[encodeURI(player)] != undefined) {
            playerSessions.colorOptions.push(playerSessions.sessions[encodeURI(player)].color);
            io.emit('removePlayer', player, playerSessions.sessions[encodeURI(player)].color)
            delete playerSessions.sessions[encodeURI(player)];
            playerSessions.count--;
            io.emit('playerSessions', playerSessions);
            console.log(player + " left the game! " + playerSessions.count + " player/s is/are still playing the game!");
        }
    });

    socket.on('blockBoard', function () {
        io.emit('blockBoard');
    });

    socket.on('finishGame', function (sessions) {
        io.emit('playerSessions', sessions);
    });

    io.emit('playerSessions', playerSessions);
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});