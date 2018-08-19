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
var playerData = {
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

var gameData = {	
	gameBoardColors: [],	
	turnCounter: 0,
	isBlueTurn: false,
	isRedTurn: false,
	numBlueCards: 0,
	numRedCards: 0,
	numYellowCards: 7,
	numBlackCards: 1,
	numCardsToGuess: 0,
	numCardsPicked: 0,
	cardSelected: 0,
	turnIsOver: false,
	clientCallCounter: 0,
	runOnce: true,
	runOnce2: true,
	gameOver: false
};

/*socket.io setup
********************************************/
// io is an object that creates by the socket function
var io = require('socket.io')(server,{});

	io.sockets.on('connection', function(socket){
	console.log('socket connection: '+ socket.id);
	socketIDlist.push(socket.id);
		
	//update a new player on the spectators list currently
	socket.emit('allSpectators', playerData.spectators);
	socket.emit('allBluePlayers', playerData.bluePlayers);
	socket.emit('allRedPlayers', playerData.redPlayers);
	socket.emit('buttonStates', buttonStates);
	socket.emit('nameOfBlueSpy', playerData.blueSpyMaster);
	socket.emit('nameOfRedSpy', playerData.redSpyMaster);

	// game setup
	socket.on('playerName', function(name){
		playerData.spectators.push(name);
		console.log("spectators after entering: " + playerData.spectators);
		io.sockets.emit('playerNames', name);
	});

	socket.on('blue', function(clientName){
		console.log("Player: " + clientName + " has joined blue team");
		playerData.bluePlayers.push(clientName);
		playerData.blueIDs.push(socket.id);
		io.sockets.emit('bluePlayer', clientName);
		var spectatorIndex = playerData.spectators.indexOf(clientName);
		playerData.spectators.splice(spectatorIndex, 1);
		io.sockets.emit('removeSpectator', clientName);
		console.log("BLUE PLAYER IDS: " + playerData.blueIDs);
		//console.log("spectators after joining blue team: " + playerData.spectators);
	});

	socket.on('removeFromBlue', function(bluePlayerToBeRemoved){
		console.log("current blue players: " + playerData.bluePlayers);
		var bluePlayerIndex = playerData.bluePlayers.indexOf(bluePlayerToBeRemoved);
		playerData.bluePlayers.splice(bluePlayerIndex, 1);
		var bluePlayerID = playerData.blueIDs.indexOf(socket.id);
		playerData.blueIDs.splice(bluePlayerID, 1);
		console.log("Blue players after removal: " + playerData.bluePlayers);
		io.sockets.emit('blueToRed', bluePlayerToBeRemoved);
	})

	socket.on('red', function(clientName){
		console.log("Player: " + clientName + " has joined red team");
		playerData.redPlayers.push(clientName);
		playerData.redIDs.push(socket.id);
		io.sockets.emit('redPlayer', clientName);
		var spectatorIndex = playerData.spectators.indexOf(clientName);
		playerData.spectators.splice(spectatorIndex, 1);
		io.sockets.emit('removeSpectator', clientName);
		console.log("RED PLAYER IDS: " + playerData.redIDs);
		//console.log("spectators after joining red team: " + playerData.spectators);	
	})

	socket.on('removeFromRed', function(redPlayerToBeRemoved){
		console.log("current red players: " + playerData.redPlayers);
		var redPlayerIndex = playerData.redPlayers.indexOf(redPlayerToBeRemoved);
		playerData.redPlayers.splice(redPlayerIndex, 1);
		var redPlayerID = playerData.redIDs.indexOf(socket.id);
		playerData.redIDs.splice(redPlayerID, 1);
		console.log("Red players after removal: " + playerData.redPlayers);
		io.sockets.emit('redToBlue', redPlayerToBeRemoved);
	})

	socket.on('blueSpy', function(nameOfSpyMaster){
		io.sockets.emit('blueSpyButton', nameOfSpyMaster);
		buttonStates.blue = true;
		playerData.blueSpyMaster = nameOfSpyMaster;
		playerData.blueSpyID = socket.id;
		console.log("BLUE SPY ID: " + playerData.blueSpyID);
	})

	socket.on('highlightBlueSpy', function(){
		io.sockets.emit('highlightBlueSpy', playerData.blueSpyMaster);
	})
	
	socket.on('redSpy', function(nameOfSpyMaster){
		io.sockets.emit('redSpyButton', nameOfSpyMaster);
		buttonStates.red = true;
		playerData.redSpyMaster = nameOfSpyMaster;
		playerData.redSpyID = socket.id;
		console.log("RED SPY ID: " + playerData.redSpyID);
	})

	socket.on('highlightRedSpy', function(nameOfRedSpy){
		io.sockets.emit('highlightRedSpy', playerData.redSpyMaster);
	})

	// game has started
	/***********************************/
	socket.on('gameHasStarted', function(){
		io.sockets.emit('gameHasStarted');
	})

	socket.on('setUpBoardforSpies', function(boardObject){
		//console.log(boardObject);
		for(i=0;i<boardObject.randomIndices.length; i++){
			let randomIndex = boardObject.randomIndices[i];
			let randomColor = boardObject.divColors[randomIndex];
			gameData.gameBoardColors.push(randomColor);
		}
		console.log(gameData.gameBoardColors);
		io.to(playerData.blueSpyID).emit('youCanSeeTheBoard', boardObject);
		io.to(playerData.redSpyID).emit('youCanSeeTheBoard', boardObject);
	})

	socket.on('blueTeamStarts', function(){
		gameData.isBlueTurn = true;
		gameData.isRedTurn = false;
		gameData.numBlueCards = 9;
		gameData.numRedCards = 8;
		gameData.turnCounter++;
		io.to(playerData.blueSpyID).emit('createHintBox', gameData);
		io.sockets.emit('waitingForBlueSpy', gameData);
		console.log("blue team starts");
	})

	socket.on('redTeamStarts', function(){
		gameData.isRedTurn = true;
		gameData.isBlueTurn = false;
		gameData.numBlueCards = 8;
		gameData.numRedCards = 9;
		gameData.turnCounter++;
		io.to(playerData.redSpyID).emit('createHintBox', gameData);
		io.sockets.emit('waitingForRedSpy', gameData);
		console.log("red team starts");
	})

	// 
	socket.on('guessMessage', function(){
		io.sockets.emit('guessMessage', gameData);
	})

	socket.on('revealHint', function(hintData){
		gameData.numCardsToGuess = hintData.number;
		hintData.isBlueTurn = gameData.isBlueTurn;
		hintData.isRedTurn = gameData.isRedTurn;
		gameData.numCardsPicked = 0;
		gameData.turnIsOver = false;
		gameData.runOnce = true;
		gameData.runOnce2 = true;
		io.sockets.emit('revealHint', hintData);
	})

	socket.on('pickCards', function(){

		// tell only blue players to take their turn
		if(gameData.isBlueTurn){
			for(i=0;i<playerData.blueIDs.length;i++)
				io.to(playerData.blueIDs[i]).emit('pickCards', gameData);
		}
		// otherwise tell red players to
		else{
			for(i=0;i<playerData.redIDs.length;i++)
				io.to(playerData.redIDs[i]).emit('pickCards', gameData);
		}
	})

	socket.on('cardWasPicked', function(cardCounter){
		//gameData.clientCallCounter = 0;
		gameData.clientCallCounter++;
		gameData.numCardsPicked++;
		gameData.cardSelected = cardCounter;
		gameData.runOnce2 = true;
		io.to(playerData.blueSpyID).emit('guessHasBeenMade', gameData);
		io.to(playerData.redSpyID).emit('guessHasBeenMade', gameData);
		io.sockets.emit('revealCardColor', gameData);
	})

	socket.on('updateCardCount', function(colorOfCard){
		gameData.clientCallCounter = 0;

		if(gameData.runOnce2){
			gameData.runOnce2 = false;

			if(colorOfCard == 'blue')
				gameData.numBlueCards--;
			else if(colorOfCard == 'red')
				gameData.numRedCards--;
			else if(colorOfCard == 'yellow')
				gameData.numYellowCards--;
		
			console.log("blue: " + gameData.numBlueCards + "red: " + gameData.numRedCards + "yellow: " + gameData.numYellowCards);
		
			if(gameData.numBlueCards == 0){
				gameData.gameOver = true;
				io.sockets.emit('blueWins');
			}
			else if(gameData.numRedCards == 0){
				gameData.gameOver = true;
				io.sockets.emit('redWins');
			}
		}
	})

	socket.on('blackCard', function(){
		if(gameData.isBlueTurn)
			io.sockets.emit('redWins');
		else
			io.sockets.emit('blueWins');
	})

	socket.on('endTurn', function(){
		gameData.clientCallCounter++;
		gameData.turnIsOver = true;
		console.log("call counter: " +gameData.clientCallCounter);
		if(gameData.runOnce){
			gameData.runOnce = false;
			gameData.turnCounter++;
			if(gameData.isBlueTurn){
				// switch to red team's turn
				console.log("it is now red turn");
				gameData.isBlueTurn = false;
				gameData.isRedTurn = true;
				io.to(playerData.redSpyID).emit('createHintBox', gameData);
				io.sockets.emit('waitingForRedSpy', gameData);
				io.sockets.emit('donePickingCards');
			}
			else if(gameData.isRedTurn){
				// switch to blue team's turn
				console.log("it is now blue turn");
				gameData.isBlueTurn = true;
				gameData.isRedTurn = false;
				io.to(playerData.blueSpyID).emit('createHintBox', gameData);
				io.sockets.emit('waitingForBlueSpy', gameData);
				io.sockets.emit('donePickingCards');
			}
		}
	})
})
