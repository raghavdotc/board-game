/**
 * Created by raghav on 4/7/16.
 */
var tryJoining = function () {
    username = $("#username").val();
    if (playerSessions.count < playerSessions.gameConfig.maxNumberOfPlayers) {
        if (playerSessions.sessions[encodeURI(username)] != undefined) {
            alert("Username is already taken! Try typing in something else.");
        } else {
            playerSessions.sessions[encodeURI(username)] = {};
            playerSessions.sessions[encodeURI(username)].color = playerSessions.colorOptions.splice(Math.floor(Math.random() * playerSessions.colorOptions.length), 1);
            playerSessions.sessions[encodeURI(username)].cells = [];
            playerSessions.sessions[encodeURI(username)].cellsCount = 0;
            playerSessions.count++;
            socket.emit('joinGame', username);
            socket.emit('playerSessions', playerSessions);
            alert("You have successfully joined the game!");
        }
    } else {
        alert("Max allowed players reached! You can follow the game as a spectator!");
    }
    return false;
};

$(window).on("beforeunload", function () {
    var username = $("#username").val();
    socket.emit('removePlayer', username);
});

$(document).on("click", "#game-board td.unoccupied", function () {
    $(this).removeClass('unoccupied');
    $(this).addClass('occupied');
    var id = $(this).attr("id");
    var array = id.split("-");
    playerSessions.sessions[encodeURI(username)].cellsCount++;
    playerSessions.sessions[encodeURI(username)].cells.push(id);
    playerSessions.gameState.cells[array[0]][array[1]] = {
        occupiedBy: username,
        fill: playerSessions.sessions[encodeURI(username)].color
    };
    playerSessions.cellsBlocked++;
    $(this).css('background-color', playerSessions.sessions[encodeURI(username)].color);
    socket.emit('playerSessions', playerSessions);
    socket.emit('blockBoard');
});