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
	bluePlayers: [''],
	redPlayers: ['']
};

/*socket.io setup
********************************************/
// io is an object that creates by the socket function
var io = require('socket.io')(server,{});

io.sockets.on('connection', function(socket){
//	console.log('socket connection: '+ socket.id);
	
	//update a new player on the spectators list currently
	socket.emit('newPlayer', data.spectators);

socket.on('playerName', function(name){
	data.spectators.push(name);
	console.log(data.spectators);
	io.sockets.emit('playerNames', name);
})


	socket.on('blue', function(){
		console.log("Player has joined blue team: " + socket.id);
	});

	//setInterval(function(){
	//}1000/50);
})
