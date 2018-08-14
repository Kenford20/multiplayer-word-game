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

var SOCKET_LIST = {};
var data = {
	spectators: [],
	bluePlayers: [],
	redPlayers: [],
	blueSpyMaster:'',
	redSpyMaster:''
};
var buttonStates = {
	blue: false,
	red: false
};

/*socket.io setup
********************************************/
// io is an object that creates by the socket function
var io = require('socket.io')(server,{});

	io.sockets.on('connection', function(socket){
	//	console.log('socket connection: '+ socket.id);
		
	//update a new player on the spectators list currently
	socket.emit('allSpectators', data.spectators);
	socket.emit('allBluePlayers', data.bluePlayers);
	socket.emit('allRedPlayers', data.redPlayers);
	socket.emit('buttonStates', buttonStates);
	socket.emit('nameOfBlueSpy', data.blueSpyMaster);

	socket.on('playerName', function(name){
		data.spectators.push(name);
		console.log("spectators after entering: " + data.spectators);
		io.sockets.emit('playerNames', name);
	});

	socket.on('blue', function(clientName){
		console.log("Player: " + clientName + " has joined blue team");
		data.bluePlayers.push(clientName);
		io.sockets.emit('bluePlayer', clientName);
		var spectatorIndex = data.spectators.indexOf(clientName);
		data.spectators.splice(spectatorIndex, 1);
		io.sockets.emit('removeSpectator', clientName);
		console.log("spectators after joining blue team: " + data.spectators);
	});

	socket.on('red', function(clientName){
		console.log("Player: " + clientName + " has joined red team");
		data.redPlayers.push(clientName);
		io.sockets.emit('redPlayer', clientName);
		var spectatorIndex = data.spectators.indexOf(clientName);
		data.spectators.splice(spectatorIndex, 1);
		io.sockets.emit('removeSpectator', clientName);
		console.log("spectators after joining red team: " + data.spectators);	
	})

	socket.on('blueSpy', function(nameOfSpyMaster){
		io.sockets.emit('blueSpyButton', nameOfSpyMaster);
		buttonStates.blue = true;
		data.blueSpyMaster = nameOfSpyMaster;
	})

	socket.on('highlightBlueSpy', function(nameOfBlueSpy){
		io.sockets.emit('highlightBlueSpy', nameOfBlueSpy);
	})
	
	socket.on('redSpy', function(nameOfSpyMaster){
		io.sockets.emit('redSpyButton', nameOfSpyMaster);
		buttonStates.red = true;
		data.redSpyMaster = nameOfSpyMaster;
	})

	socket.on('highlightRedSpy', function(nameOfRedSpy){
		io.sockets.emit('highlightRedSpy', nameOfRedSpy);
	})

	//setInterval(function(){
	//}1000/50);
})
