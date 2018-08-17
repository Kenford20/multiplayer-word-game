/* Express setup
**********************************/

// imports the npm module that is being used aka express here
var express = require('express');
var app = express();
var server = require('http').Server(app);

app.get('/',function(req,res){
	res.sendFile(__dirname + '/client/index.html');
});

//app.use('/client', express.static(__dirname + '/client'));
app.use(express.static('client'));

server.listen(3000);
console.log('Server started!');

var socketIDlist = [];
var data = {
	spectators: [],
	bluePlayers: [],
	blueIDs: [],
	redPlayers: [],
	redIDs: [],
	blueSpyMaster:'',
	redSpyMaster:'',
	blueSpyID:0,
	redSpyID:0
};
var buttonStates = {
	blue: false,
	red: false
};

var firstTurn = {
	blue: false,
	red: false,
	numBlueCards: 0,
	numRedCards: 0,
	numYellowCards: 7,
	numBlackCards: 1
};

var gameBoardColors = {
	cardColor: []
};

var gameTurns = {
	turnCounter: 0,
	isBlueTurn: false,
	isRedTurn: false
};

/*socket.io setup
********************************************/
// io is an object that creates by the socket function
var io = require('socket.io')(server,{});

	io.sockets.on('connection', function(socket){
	console.log('socket connection: '+ socket.id);
	socketIDlist.push(socket.id);
		
	//update a new player on the spectators list currently
	socket.emit('allSpectators', data.spectators);
	socket.emit('allBluePlayers', data.bluePlayers);
	socket.emit('allRedPlayers', data.redPlayers);
	socket.emit('buttonStates', buttonStates);
	socket.emit('nameOfBlueSpy', data.blueSpyMaster);
	socket.emit('nameOfRedSpy', data.redSpyMaster);

	// game setup
	socket.on('playerName', function(name){
		data.spectators.push(name);
		console.log("spectators after entering: " + data.spectators);
		io.sockets.emit('playerNames', name);
	});

	socket.on('blue', function(clientName){
		console.log("Player: " + clientName + " has joined blue team");
		data.bluePlayers.push(clientName);
		data.blueIDs.push(socket.id);
		io.sockets.emit('bluePlayer', clientName);
		var spectatorIndex = data.spectators.indexOf(clientName);
		data.spectators.splice(spectatorIndex, 1);
		io.sockets.emit('removeSpectator', clientName);
		console.log("BLUE PLAYER IDS: " + data.blueIDs);
		//console.log("spectators after joining blue team: " + data.spectators);
	});

	socket.on('removeFromBlue', function(bluePlayerToBeRemoved){
		console.log("current blue players: " + data.bluePlayers);
		var bluePlayerIndex = data.bluePlayers.indexOf(bluePlayerToBeRemoved);
		data.bluePlayers.splice(bluePlayerIndex, 1);
		var bluePlayerID = data.blueIDs.indexOf(socket.id);
		data.blueIDs.splice(bluePlayerID, 1);
		console.log("Blue players after removal: " + data.bluePlayers);
		io.sockets.emit('blueToRed', bluePlayerToBeRemoved);
	})

	socket.on('red', function(clientName){
		console.log("Player: " + clientName + " has joined red team");
		data.redPlayers.push(clientName);
		data.redIDs.push(socket.id);
		io.sockets.emit('redPlayer', clientName);
		var spectatorIndex = data.spectators.indexOf(clientName);
		data.spectators.splice(spectatorIndex, 1);
		io.sockets.emit('removeSpectator', clientName);
		console.log("RED PLAYER IDS: " + data.redIDs);
		//console.log("spectators after joining red team: " + data.spectators);	
	})

	socket.on('removeFromRed', function(redPlayerToBeRemoved){
		console.log("current red players: " + data.redPlayers);
		var redPlayerIndex = data.redPlayers.indexOf(redPlayerToBeRemoved);
		data.redPlayers.splice(redPlayerIndex, 1);
		var redPlayerID = data.redIDs.indexOf(socket.id);
		data.redIDs.splice(redPlayerID, 1);
		console.log("Red players after removal: " + data.redPlayers);
		io.sockets.emit('redToBlue', redPlayerToBeRemoved);
	})

	socket.on('blueSpy', function(nameOfSpyMaster){
		io.sockets.emit('blueSpyButton', nameOfSpyMaster);
		buttonStates.blue = true;
		data.blueSpyMaster = nameOfSpyMaster;
		data.blueSpyID = socket.id;
		console.log("BLUE SPY ID: " + data.blueSpyID);
	})

	socket.on('highlightBlueSpy', function(){
		io.sockets.emit('highlightBlueSpy', data.blueSpyMaster);
	})
	
	socket.on('redSpy', function(nameOfSpyMaster){
		io.sockets.emit('redSpyButton', nameOfSpyMaster);
		buttonStates.red = true;
		data.redSpyMaster = nameOfSpyMaster;
		data.redSpyID = socket.id;
		console.log("RED SPY ID: " + data.redSpyID);
	})

	socket.on('highlightRedSpy', function(nameOfRedSpy){
		io.sockets.emit('highlightRedSpy', data.redSpyMaster);
	})

	// game has started
	socket.on('setUpBoardforSpies', function(boardObject){
		console.log(boardObject);
		io.to(data.blueSpyID).emit('youCanSeeTheBoard', boardObject);
		io.to(data.redSpyID).emit('youCanSeeTheBoard', boardObject);
	})

	socket.on('blueTeamStarts', function(){
		firstTurn.blue = true;
		firstTurn.numBlueCards = 9;
		firstTurn.numRedCards = 8;
		gameTurns.isBlueTurn = true;
		gameTurns.turnCounter++;
		io.to(data.blueSpyID).emit('createHintBox', firstTurn);
		io.sockets.emit('waitingForBlueSpy', firstTurn);
		console.log("blue team starts");
	})

	socket.on('redTeamStarts', function(){
		firstTurn.red = true;
		firstTurn.numBlueCards = 8;
		firstTurn.numRedCards = 9;
		gameTurns.isRedTurn = true;
		gameTurns.turnCounter++;
		io.to(data.redSpyID).emit('createHintBox', firstTurn);
		io.sockets.emit('waitingForRedSpy', firstTurn);
		console.log("red team starts");
	})

	socket.on('guessMessage', function(){
		io.sockets.emit('guessMessage', gameTurns);
	})

	socket.on('revealHint', function(hintData){
		hintData.isBlueTurn = gameTurns.isBlueTurn;
		hintData.isRedTurn = gameTurns.isRedTurn;
		io.sockets.emit('revealHint', hintData);
	})

	socket.on('timeToGuess', function(){
		// tell only blue players to take their turn
		if(gameTurns.isBlueTurn){
			for(i=0;i<data.blueIDs.length;i++)
				io.to(data.blueIDs[i]).emit('timeToGuess', gameTurns);
		}
		// otherwise tell red players to
		else{
			for(i=0;i<data.redIDs.length;i++)
				io.to(data.redIDs[i]).emit('timeToGuess', gameTurns);
		}
	})
})
