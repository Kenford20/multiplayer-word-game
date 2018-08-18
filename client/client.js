window.onload=function(){

/* Global variables
**********************************/
const joinBlue_btn = document.querySelector("#blue");
const joinRed_btn = document.querySelector("#red");
const redSpy_btn = document.querySelector("#red-spy");
const blueSpy_btn = document.querySelector("#blue-spy");
const startGame_btn = document.querySelector("#start-game");
const hint_btn = document.querySelector("#hint-btn");
const submit_name = document.querySelector("#name_btn");
const name = document.querySelector("#name");
const gameBoard = document.querySelector("#game-board");
const allCards = document.querySelectorAll(".card");
const blueWaitingMessage = document.querySelector("#blue-waiting");
const redWaitingMessage = document.querySelector("#red-waiting");
const blueGuessMessage = document.querySelector("#blue-guess");
const redGuessMessage = document.querySelector("#red-guess");

var spectatorList = document.querySelector("#players");
var bluePlayerList = document.querySelector("#blue-players");
var redPlayerList = document.querySelector("#red-players");
var gameisNotStarted = true;
var thereIsABlueSpy = false; 
var thereIsARedSpy = false;

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

var numberOfCards = {
	blue: 0,
	red: 0,
	yellow: 7,
	black: 1
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
	if(client.name != ''){
		socket.emit('blue', client.name);
		client.team = 'blue';
		client.teamJoinCounter++;
		console.log("after joining blue: " + client.teamJoinCounter);
	}
}

function joinRedTeam(){
	if(client.name != ''){
		socket.emit('red', client.name);
		client.team = 'red';
		client.teamJoinCounter++;
		console.log("after joining red: " + client.teamJoinCounter);
	}
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
		thereIsARedSpy = true;
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
		thereIsABlueSpy = true;
	}
	socket.emit('highlightBlueSpy');
}

function removeSpectator(spectator){
	var childs = spectatorList.querySelectorAll("h3");
	for(i=0;i<childs.length;i++){
		if(childs[i].innerHTML == (spectator + '  '))
			spectatorList.removeChild(childs[i]);
	}

	console.log(client.name + " is on a team: " + client.isOnATeam);

// handles team changing of clients (you're switching teams if counter > 1)
	if(client.teamJoinCounter > 1 && client.name == spectator){
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

/* GAME HAS NOW STARTED BELOW
****************************************************************
****************************************************************/

function gameStartSetup(){

	// start game only when the two spymasters are chosen
	if(thereIsABlueSpy && thereIsARedSpy){
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
			numberOfCards.blue = 9;
			numberOfCards.red = 8;
		}
		else if(randomTeamStarts == 1){
			whichTeamStarts = cardType.redTeamStarts;
			socket.emit('redTeamStarts');
			numberOfCards.blue = 8;
			numberOfCards.red = 9;
		}
		console.log(numberOfCards);
		boardData.divColors = whichTeamStarts;

		socket.emit('setUpBoardforSpies', boardData);
	}

	// this is for the words
	/*var gameWords = gameBoard.querySelectorAll("a");
	for(i=0;i<gameWords.length;i++){
		gameWords[i].innerHTML = randomWord;
	} */
}

function spyMasterBoard(boardObject){
	// assign random color to each div or card on the game board
	for(i=0; i<allCards.length;i++){
		let randomIndex = boardObject.randomIndices[i];
		let randomCardColor = boardObject.divColors[randomIndex];
		allCards[i].classList.add(randomCardColor);
	}
}

function createHintBox(gameData){
	document.querySelector("#input-hint").classList.remove("hide");
	document.querySelector("#hint-btn").classList.remove("hide");
	var numCards;
	var selectNode = document.createElement("select");
	document.querySelector("#hint").appendChild(selectNode);
	
	if(gameData.isBlueTurn)
		numCards = gameData.numBlueCards;
	else
		numCards = gameData.numRedCards;

	console.log(numCards);
    for(i=1; i<(numCards+1); i++){
    	var selectOption = document.createElement("option");
    	selectOption.setAttribute("value", i);
    	selectOption.innerHTML = i;
    	selectNode.appendChild(selectOption);
	}
	console.log(selectNode);
}

function blueTeamWaits(gameData){
	document.querySelector("#message").innerHTML = "";
	blueWaitingMessage.classList.remove("hide");
	redWaitingMessage.classList.add("hide");
	redGuessMessage.classList.add("hide");
	document.querySelector("#hint-message").classList.add("hide");
}

function redTeamWaits(gameData){
	document.querySelector("#message").innerHTML = "";
	redWaitingMessage.classList.remove("hide");
	blueWaitingMessage.classList.add("hide");
	blueGuessMessage.classList.add("hide");
	document.querySelector("#hint-message").classList.add("hide");
}

/*
// reveals a message to all clients prompting them to wait for spymaster
function waitingMessage(gameData){
	document.querySelector("#message").innerHTML = "";

	if(gameData.isBlueTurn){
		blueWaitingMessage.classList.remove("hide");
		redWaitingMessage.classList.add("hide");
		redGuessMessage.classList.add("hide");
	}
	else{
		redWaitingMessage.classList.remove("hide");
		blueWaitingMessage.classList.add("hide");
		blueGuessMessage.classList.add("hide");
	}
	document.querySelector("#hint-message").classList.add("hide");
}*/

// runs when hint submission button is clicked
// hides the hint input from the spy master once the hint is submitted
function startGuess(){
	socket.emit('guessMessage');

	var hintData = {
		word: '',
		number: 0,
		isBlueTurn: false,
		isRedTurn: false
	};

	hintData.word = document.querySelector("#input-hint").value;
	hintData.number = document.querySelector("select").value;
	socket.emit('revealHint', hintData);

	document.querySelector("#input-hint").classList.add("hide");
	document.querySelector("#hint-btn").classList.add("hide");
	var select = document.querySelector("select");
	select.parentNode.removeChild(select);

	socket.emit('pickCards');
}

// reveals a message to all clients prompting them to guess
function guessMessage(gameData){
	if(gameData.isBlueTurn){
		blueWaitingMessage.classList.add("hide");
		blueGuessMessage.classList.remove("hide");
	}
	else{
		redWaitingMessage.classList.add("hide");
		redGuessMessage.classList.remove("hide");
	}
}

// reveals the hint to all clients, showing the word and number
function revealHint(hintData){
	document.querySelector("#hint-message").classList.remove("hide");

	var hintWord = document.querySelector("#input-hint");
	document.querySelector("#hint-word").innerHTML = hintData.word;

	var hintNumber = document.querySelector("select");
	document.querySelector("#hint-number").innerHTML = hintData.number;

	// styling the hint spans
	if(hintData.isBlueTurn){
		document.querySelector("#hint-word").style.color = "#1c64ff";
		document.querySelector("#hint-number").style.color = "#1c64ff";
	}
	else{
		document.querySelector("#hint-word").style.color = "#db3328";
		document.querySelector("#hint-number").style.color = "#db3328";
	}
}

// creates an event listener for all the cards and sends the card info on click
function pickCards(gameData){
	/*for(i=0; i<allCards.length; i++){
		allCards[i].addEventListener("click", function{
		 	whichCardWasPicked(this, gameData); 
		});
	}*/

	for(i=0; i<allCards.length; i++){
		allCards[i].addEventListener("click", whichCardWasPicked);
	}
}

// determines which card was selected based on the index in the array of cards
function whichCardWasPicked(){
	var cardCounter = 0;

		for(i=0;i<allCards.length;i++){
			if(allCards[i] == this) // this = the card selected
				break;
			else{
				cardCounter++;
			}
		}
		console.log(cardCounter);
		socket.emit('cardWasPicked', cardCounter);
}

// receives the selected card from above and reveals its true color from the game board
// turn ends when the number of selected cards match the number given in the hint
// turn also ends when a yellow or a card from the opposite team is selected
function revealCardColor(gameData){	
	var cardSelected = gameData.cardSelected;
	console.log("card selected: " +cardSelected);
	allCards[cardSelected].classList.add(gameData.gameBoardColors[cardSelected]);
	
	if(gameData.numCardsPicked < gameData.numCardsToGuess){
			socket.emit('updateCardCount', gameData.gameBoardColors[cardSelected]);
			if(gameData.gameBoardColors[cardSelected] == 'yellow'){
				socket.emit('endTurn');
				console.log("turn has ended becasue you chose a yellow card");
			}
			if(gameData.gameBoardColors[cardSelected] == 'black')
				socket.emit('endGame');
		}
	else{
		socket.emit('endTurn');
		console.log("turn has ended, out of card selections");
	}
}

function removeEventListeners(){
	console.log("removing event listeners");
	
	for(i=0;i<allCards.length;i++){
		allCards[i].removeEventListener("click", whichCardWasPicked);
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

// spy stuff setup
socket.on('blueSpyButton', removeBlueSpyButton);
socket.on('redSpyButton', removeRedSpyButton);
socket.on('highlightBlueSpy', highlightBlueSpy);
socket.on('highlightRedSpy', highlightRedSpy);

// game started
socket.on('youCanSeeTheBoard', spyMasterBoard);
socket.on('createHintBox', createHintBox);
socket.on('waitingForBlueSpy', blueTeamWaits);
socket.on('waitingForRedSpy', redTeamWaits);
socket.on('guessMessage', guessMessage);
socket.on('revealHint', revealHint);
socket.on('pickCards', pickCards);
socket.on('revealCardColor', revealCardColor);
socket.on('donePickingCards', removeEventListeners);

/* Event Listeners
***********************************/
submit_name.addEventListener("click", sendNameToServer);
joinBlue_btn.addEventListener("click", joinBlueTeam);
joinRed_btn.addEventListener("click", joinRedTeam);
blueSpy_btn.addEventListener("click", blueSpyMaster);
redSpy_btn.addEventListener("click", redSpyMaster);
startGame_btn.addEventListener("click", gameStartSetup);
hint_btn.addEventListener("click", startGuess);
}