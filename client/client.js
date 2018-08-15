window.onload=function(){

/* Global variables
**********************************/
const joinBlue_btn = document.querySelector("#blue");
const joinRed_btn = document.querySelector("#red");
const redSpy_btn = document.querySelector("#red-spy");
const blueSpy_btn = document.querySelector("#blue-spy");
const startGame_btn = document.querySelector("#start-game");
const submit_name = document.querySelector("#name_btn");
const name = document.querySelector("#name");
const gameBoard = document.querySelector("#game-board");

var spectatorList = document.querySelector("#players");
var bluePlayerList = document.querySelector("#blue-players");
var redPlayerList = document.querySelector("#red-players");
var gameisNotStarted = true;

var client = {
	name: '',
	team: '',
	spymaster: false,
	yourTurn: false,
	teamJoinCounter: 0,
	isOnATeam: false
};

var cardType = {
	redTeamStarts: ['red', 'red', 'red', 'red', 'red', 'red', 'red', 'red', 'red', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'black'],
	blueTeamStarts: ['red', 'red', 'red', 'red', 'red', 'red', 'red', 'red', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'black'],
};

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

function sendNameToServer(){
	console.log("the name is " + name.value);
	socket.emit('playerName', name.value);
	client.name = name.value;
	submit_name.classList.add("hide");
	name.classList.add("hide");
}

function joinBlueTeam(){
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
	socket.emit('highlightBlueSpy');
}

function removeSpectator(spectator){
	var childs = spectatorList.querySelectorAll("h3");
	for(i=0;i<childs.length;i++){
		if(childs[i].innerHTML == (spectator + '  '))
			spectatorList.removeChild(childs[i]);
	}

	console.log(client.name + "is on a team: " + client.isOnATeam);

// handles team changing of clients (you're switching teams if counter > 1)
	if(client.isOnATeam && client.name == spectator){
		if(client.team == "red")
			socket.emit('removeFromBlue', spectator);
		else if(client.team == "blue" && client.name == spectator)
			socket.emit('removeFromRed', spectator);
	}
	client.isOnATeam = true;
}

function blueToRed(spectator){
	// blue player switches to red team
	var childs = bluePlayerList.querySelectorAll("h3");
	for(i=0;i<childs.length;i++){
		if(childs[i].innerHTML == (spectator + '  '))
			bluePlayerList.removeChild(childs[i]);
	}
}

function redToBlue(spectator){
	// red player switches to blue team
	var childs = redPlayerList.querySelectorAll("h3");
	for(i=0;i<childs.length;i++){
		if(childs[i].innerHTML == (spectator + '  '))
			redPlayerList.removeChild(childs[i]);
	}
}

function highlightRedSpy(nameOfSpy){
	var redPlayers = redPlayerList.querySelectorAll("h3");
	 
	for(i=0;i<redPlayers.length;i++){
		if(redPlayers[i].innerHTML == (nameOfSpy + '  ')){
			redPlayers[i].style.background = "grey";
			redPlayers[i].style.border = "2px solid lightgrey";
		}
	}
}

function highlightBlueSpy(nameOfSpy){
	var bluePlayers = bluePlayerList.querySelectorAll("h3");
	for(i=0;i<bluePlayers.length;i++){
		if(bluePlayers[i].innerHTML == (nameOfSpy + '  ')){
			bluePlayers[i].style.background = "grey";
			bluePlayers[i].style.border = "2px solid lightblue"
		}
	}
}

function shuffleNumbers(array) {
    var i = array.length;
    var j = 0;
    var temp;

    while (i--) {
    	// generates a random index to swap with
        j = Math.floor(Math.random() * (i+1));

        // swap randomly chosen element with current element
        temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

// Game has started below
function gameStartSetup(){
	var boardData = {
		randomIndices: [],
		divColors: []
	}

	var randomNumbers = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24];

	shuffleNumbers(randomNumbers);
	boardData.randomIndices = randomNumbers;
	var randomTeamStarts = Math.floor(Math.random() * 2); // returns 0 or 1

	if(randomTeamStarts == 0){
		whichTeamStarts = cardType.blueTeamStarts;
		socket.emit('blueTeamStarts');
	}
	else if(randomTeamStarts == 1){
		whichTeamStarts = cardType.redTeamStarts;
		socket.emit('redTeamStarts');
	}
	boardData.divColors = whichTeamStarts;

	socket.emit('setUpBoardforSpies', boardData);

	// this is for the words
	/*var gameWords = gameBoard.querySelectorAll("a");
	for(i=0;i<gameWords.length;i++){
		gameWords[i].innerHTML = randomWord;
	} */
}

function spyMasterBoard(boardObject){
	var cardColors = gameBoard.querySelectorAll("div");

	// assign random color to each div or card on the game board
	for(i=0; i<cardColors.length;i++){
		let randomIndex = boardObject.randomIndices[i];
		console.log(randomIndex);
		let randomCardColor = boardObject.divColors[randomIndex];
		cardColors[i].classList.add(randomCardColor);
	}
}

/* Sockets
**************************************/
socket.on('playerNames', createSpectators);
// updating new players who joined later than others
socket.on('allSpectators', currentSpectators);
socket.on('allBluePlayers', currentBluePlayers);
socket.on('allRedPlayers', currentRedPlayers);
socket.on('buttonStates', checkButtonStates);
socket.on('nameOfBlueSpy', removeBlueSpyButton);
socket.on('nameOfRedSpy', removeRedSpyButton);

// move the clients' name to their respective teams
socket.on('bluePlayer', createBluePlayers);
socket.on('redPlayer', createRedPlayers);
socket.on('removeSpectator', removeSpectator);
socket.on('blueToRed', blueToRed);
socket.on('redToBlue', redToBlue);

// spy stuff
socket.on('blueSpyButton', removeBlueSpyButton);
socket.on('redSpyButton', removeRedSpyButton);
socket.on('highlightBlueSpy', highlightBlueSpy);
socket.on('highlightRedSpy', highlightRedSpy);
socket.on('youCanSeeTheBoard', spyMasterBoard);

/* Event Listeners
***********************************/
console.log(name_btn);
submit_name.addEventListener("click", sendNameToServer);
joinBlue_btn.addEventListener("click", joinBlueTeam);
joinRed_btn.addEventListener("click", joinRedTeam);
blueSpy_btn.addEventListener("click", blueSpyMaster);
redSpy_btn.addEventListener("click", redSpyMaster);
startGame_btn.addEventListener("click", gameStartSetup);
}