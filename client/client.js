window.onload=function(){

const joinBlue_btn = document.querySelector("#blue");
const joinRed_btn = document.querySelector("#red");
const redSpy_btn = document.querySelector("#red-spy");
const blueSpy_btn = document.querySelector("#blue-spy");
const submit_name = document.querySelector("#name_btn");
const name = document.querySelector("#name");

var client = {
	name: '',
	team: '',
	spymaster: false
};
var spectatorList = document.querySelector("#players");
var bluePlayerList = document.querySelector("#blue-players");
var redPlayerList = document.querySelector("#red-players");

var wordType = {
	redTeamStarts: ['red', 'red', 'red', 'red', 'red', 'red', 'red', 'red', 'red', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'yellow', 'yellow' 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'black'],
	blueTeamStarts: ['red', 'red', 'red', 'red', 'red', 'red', 'red', 'red', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'yellow', 'yellow' 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'black'],
}
var socket = io();

/* Function Definitions
*************************************/
function createSpectators(spectatorData){
	createName(spectatorData, spectatorList);
}

function createBluePlayers(bluePlayerData){
	createName(bluePlayerData, bluePlayerList);
}

function createRedPlayers(redPlayerData){
	createName(redPlayerData, redPlayerList);
}

function createName(data, elementLocation){
	var player = document.createElement("h3");
	var node = document.createTextNode(data + "  ");
	player.appendChild(node);
	elementLocation.appendChild(player);
	name.value = "";
}

function currentSpectators(allSpectators){
	updateCurrentPlayers(allSpectators, spectatorList);
}

function currentBluePlayers(allBluePlayers){
	updateCurrentPlayers(allBluePlayers, bluePlayerList);
}

function currentRedPlayers(allRedPlayers){
	updateCurrentPlayers(allRedPlayers, redPlayerList);
}

function updateCurrentPlayers(data, elementLocation){
	for(i=0;i<data.length;i++){
		var player = document.createElement("h3");
		var node = document.createTextNode(data[i] + "  ");
		player.appendChild(node);
		elementLocation.appendChild(player);
	}
}

function removeSpectator(spectator){
	var childs = spectatorList.querySelectorAll("h3");
	for(i=0;i<childs.length;i++){
		if(childs[i].innerHTML == (spectator + '  '))
			spectatorList.removeChild(childs[i]);
	}
}

function sendNameToServer(){
	console.log("the name is " + name.value);
	socket.emit('playerName', name.value);
	client.name = name.value;
	console.log(client.name);
}

function joinBlueTeam(){
	console.log(client.name);
	socket.emit('blue', client.name);
	client.team = 'blue';
}

function joinRedTeam(){
	socket.emit('red', client.name);
	client.team = 'red';
}

function checkButtonStates(state){
	if(state.blue == true)
		removeBlueSpyButton();
}

function redSpyMaster(){
	client.spymaster = true;
	socket.emit('redSpy', client.name);
}

function blueSpyMaster(){
	client.spymaster = true;
	socket.emit('blueSpy', client.name);
}

function removeRedSpyButton(nameOfRedSpy){
	var redSpy = document.querySelector("#red-spy-message");
	var redSpyName = document.querySelector("#red-spy-name");
	redSpyName.innerHTML = nameOfRedSpy;
	if(nameOfRedSpy != ''){
		redSpy_btn.style.display = "none";
		redSpy.classList.remove("hide");
	}
	socket.emit('highlightRedSpy', nameOfRedSpy);
}

function removeBlueSpyButton(nameOfBlueSpy){
	var blueSpy = document.querySelector("#blue-spy-message");
	var blueSpyName = document.querySelector("#blue-spy-name");
	blueSpyName.innerHTML = nameOfBlueSpy;
	if(nameOfBlueSpy != ''){
		blueSpy_btn.style.display = "none";
		blueSpy.classList.remove("hide");
	}
	socket.emit('highlightBlueSpy', nameOfBlueSpy);
}

function highlightSpy(nameOfSpy){
	var bluePlayers = bluePlayerList.querySelectorAll("h3");
	var redPlayers = redPlayerList.querySelectorAll("h3");
	var players;

	console.log(client.team);

	if(client.team == 'blue')
		players = bluePlayers;
	else if(client.team == 'red'){
		players = redPlayers;
		console.log(players);
	}

	console.log(bluePlayers);
	console.log(redPlayers);
	console.log(players);

	if(client.team != ''){
		for(i=0;i<players.length;i++){
			console.log(nameOfSpy);
			console.log(players[i].innerHTML);
			if(players[i].innerHTML == (nameOfSpy + '  ')){
				players[i].style.background = "grey";
				players[i].style.border = "2px solid lightgrey";
			}
		}
	}
}
/*
function highlightSpy(nameOfSpy){
	var bluePlayers = bluePlayerList.querySelectorAll("h3");
	console.log(bluePlayers);
	for(i=0;i<bluePlayers.length;i++){
		console.log(nameOfSpy);
		console.log(bluePlayers[i].innerHTML);
		if(bluePlayers[i].innerHTML == (nameOfSpy + '  ')){
			bluePlayers[i].style.background = "grey";
			bluePlayers[i].style.border = "2px solid lightblue"
		}
	}
}*/

/* Sockets
**************************************/
socket.on('playerNames', createSpectators);
// updating new players who joined later than others
socket.on('allSpectators', currentSpectators);
socket.on('allBluePlayers', currentBluePlayers);
socket.on('allRedPlayers', currentRedPlayers);
socket.on('buttonStates', checkButtonStates);
socket.on('nameOfBlueSpy', removeBlueSpyButton);

// move the clients' name to their respective teams
socket.on('bluePlayer', createBluePlayers);
socket.on('redPlayer', createRedPlayers);
socket.on('removeSpectator', removeSpectator);

// spy stuff
socket.on('blueSpyButton', removeBlueSpyButton);
socket.on('redSpyButton', removeRedSpyButton);
socket.on('highlightBlueSpy', highlightSpy);
socket.on('highlightRedSpy', highlightSpy)

/* Event Listeners
***********************************/
console.log(name_btn);
submit_name.addEventListener("click", sendNameToServer);
joinBlue_btn.addEventListener("click", joinBlueTeam);
joinRed_btn.addEventListener("click", joinRedTeam);
blueSpy_btn.addEventListener("click", blueSpyMaster);
redSpy_btn.addEventListener("click", redSpyMaster);
}