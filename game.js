/**
 * Created by raghav on 3/7/16.
 */

var socket = io();

var username = null;
var gameStateData = {};
function joinGame() {
    username = $('#username').val();
    if (username == '') {
        alert("Username is mandatory");
    } else {
        if (gameStateData.players[encodeURI(username)] == undefined) {
            $("#joiner").hide();
            $("#waiter").show();
            socket.emit('updateGameState', gameStateData);
            socket.emit('joinGame', username);
        } else {
            alert('Username has already been taken. Choose a different one!');
        }
    }
    return false;
}
var me = '';
$(document).on("click", "#game-board td.unoccupied", function () {
    $(this).removeClass('unoccupied');
    $(this).addClass('occupied');
    var id = $(this).attr("id");
    var array = id.split("-");
    gameStateData.players[encodeURI(me)].cells.push(id);
    gameStateData.cells[array[0]][array[1]] = {
        occupiedBy: me,
        color: gameStateData.colors[encodeURI(me)]
    };
    $(this).css('background-color', gameStateData.colors[encodeURI(me)]);
    socket.emit('updateGameState', gameStateData);
    socket.emit('blockBoard');
});

socket.on('blockBoard', function () {
    $.blockUI({message: "You can resume playing soon!"});
    setTimeout(function () {
        $.unblockUI({fadeOut: 200});
    }, gameStateData.config.blockingTime * 1000);
});

socket.on('joinGame', function (username, color) {
    me = $("#username").val();
    $('#messages').append('<li><b style="color: ' + gameStateData.colors[encodeURI(username)] + '">' + (username == me ? 'You' : username) + '</b> joined the game!</li>');
});

socket.on('removePlayer', function (player) {
    $('#messages').append('<li><b>' + player + '</b> left the game!</li>');
});

socket.on('updateGameState', function (gameState) {
    gameStateData = gameState;
    var count = 0;
    for (var user in gameStateData.players) {
        count++;
    }
    if (count > 1) {
        $("#waiter").hide();
        $("#joined").show();
    }
    updateGameBoard(gameStateData);
});

$(window).on("beforeunload", function () {
    socket.emit('removePlayer', username);
});

function updateGameBoard(gameState) {
    var gameHtml = "";
    for (var i in gameState.cells) {
        gameHtml += "<tr>";
        for (var j in gameState.cells[i]) {
            gameHtml += "<td id='" + i + '-' + j + "' user='" + gameState.cells[i][j].occupiedBy + "' style='background-color: " + (gameState.cells[i][j].color != null ? gameState.cells[i][j].color : "white") + "' class='" + (gameState.cells[i][j].color != null ? 'occupied' : "unoccupied") + "'></td>";
        }
        gameHtml += "</tr>";
    }
    $("#game-board table").html(gameHtml);
    if ($(".unoccupied").length < 1) {
        var maxScore = 0;
        var winner = null;
        for (var player in gameState.players) {
            if (gameState.players[player].cells.length > maxScore) {
                maxScore = gameState.players[player].cells.length;
                winner = player;
            }
        }
        alert(winner + " has won!");
        window.location.reload();
    }
}
