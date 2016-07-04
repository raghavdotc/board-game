/**
 * Created by raghav on 4/7/16.
 */
var socket = io();
playerSessions = null;

socket.on('playerSessions', function (sessions) {
    playerSessions = sessions;
    var scoreHtml = "";
    for (var playerKey in playerSessions.sessions) {
        scoreHtml += "<li><b>" + playerKey + "</b> : playerSessions.sessions[playerKey].cellsCount</li>";
    }
    $("#scoreboard").html(scoreHtml);
    if (playerSessions.sessions[encodeURI(username)] != undefined) {
        if (playerSessions.count > 1) {
            $("#waiter").addClass('hidden');
            $("#joiner").addClass('hidden');
            $("#joined").removeClass('hidden');
            if (playerSessions.gameState.status == 0) {
                playerSessions.gameState.status = 1;
                for (var i = 0; i < playerSessions.gameConfig.boardSize; i++) {
                    playerSessions.gameState.cells[i] = {};
                    for (var j = 0; j < playerSessions.gameConfig.boardSize; j++) {
                        playerSessions.gameState.cells[i][j] = {
                            'fill': 'white',
                            'occupiedBy': null
                        };
                    }
                }
            }
        } else {
            $("#waiter").removeClass('hidden');
            $("#joiner").addClass('hidden');
            $("#joined").addClass('hidden');
            if (playerSessions.gameState.status == 1) {
                playerSessions.gameState.status = 0;
            }
        }
    }
    updateGameBoard(playerSessions.gameState);
    var maxCells = playerSessions.gameConfig.boardSize * playerSessions.gameConfig.boardSize;
    // alert(playerSessions.cellsBlocked + "==" + maxCells);
    // alert(playerSessions.gameState.status);
    if (playerSessions.gameState.status && playerSessions.cellsBlocked == maxCells) {
        playerSessions.gameState.status = 0;
        playerSessions.cellsBlocked = 0;
        var maxCellsClicked = 0;
        for (var k in playerSessions.sessions) {
            if (playerSessions.sessions[k].cellsCount > maxCellsClicked) {
                maxCellsClicked = playerSessions.sessions[k].cellsCount;
            }
        }
        winners = [];
        for (var player in playerSessions.sessions) {
            if (playerSessions.sessions[player].cellsCount == maxCellsClicked) {
                winners.push(player);
            }
        }
        alert(winners + " won!!! You can start to play again!");
        playerSessions = {
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
        socket.emit('finishGame', playerSessions);
        window.location = '/';
    }
});

socket.on('playerJoined', function (user, color) {
    var me = $("#username").val();
    if (user == me) {
        user = "You";
    }
    $("#timeline").append("<li><b style='color: " + color + "'>" + user + "</b> joined the game!</li>");
});

socket.on('removePlayer', function (player, color) {
    $('#timeline').append("<li><b style='color: " + color + "'>" + player + '</b> left the game!</li>');
});

socket.on('blockBoard', function () {
    $.blockUI({message: "You can resume playing in a bit!"});
    setTimeout(function () {
        $.unblockUI({fadeOut: 200});
    }, playerSessions.gameConfig.blockingTime * 1000);
});


function updateGameBoard(gameState) {
    console.log(gameState);
    var gameHtml = "";
    for (var i in gameState.cells) {
        gameHtml += "<tr>";
        for (var j in gameState.cells[i]) {
            gameHtml += "<td id='" + i + '-' + j + "' style='background-color: " + gameState.cells[i][j].fill + "' class='" + (gameState.cells[i][j].fill == 'white' ? 'unoccupied' : "occupied") + "'></td>";
        }
        gameHtml += "</tr>";
    }
    $("#game-board table").html(gameHtml);
}