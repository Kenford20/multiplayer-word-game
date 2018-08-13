window.onload=function(){

const joinBlue_btn = document.querySelector(".join-blue");
const joinRed_btn = document.querySelector(".join-red");
const redSpy_btn = document.querySelector("#red-spy");
const blueSpy_btn = document.querySelector("#blue-spy");
const submit_name = document.querySelector("#name_btn");
const name = document.querySelector("#name");

var socket = io();

/* Function Definitions
*************************************/
function createName(data){
	var playerList = document.querySelector("#players")
	var player = document.createElement("h3");
	var node = document.createTextNode(data + ", ");
	player.appendChild(node);
	playerList.appendChild(player);
	name.value = "";
}

function updateCurrentPlayers(data){
	for(i=0;i<data.length;i++){
		var playerList = document.querySelector("#players")
		var player = document.createElement("h3");
		var node = document.createTextNode(data[i] + ", ");
		player.appendChild(node);
		playerList.appendChild(player);
	}
}

function sendNameToServer(){
	console.log("the name is " + name.value);
	socket.emit('playerName', name.value);
}

function joinBlueTeam(){
	socket.emit('blue');
}

socket.on('playerNames', createName);
socket.on('newPlayer', updateCurrentPlayers);

/* MAIN
***********************************/
console.log(name_btn);
submit_name.addEventListener("click", sendNameToServer);
joinBlue_btn.addEventListener("click", joinBlueTeam);

}