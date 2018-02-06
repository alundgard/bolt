
/*******************************************************************************

updateWorker.js

Instantiates the Loop object (window.game.loop)
Starts the main game loop
Requires the following already executed:
		phase.js
		player.js
		enemy.js
		setup.js
		pfLoop.js
		roundLoop.js

*******************************************************************************/

/*******************************************************************************/
/*******************************************************************************/
/*******************************************************************************/
/********                                                               ********/
/********                                                               ********/
/********                                                               ********/
/********                           DOCUMENT                            ********/
/********                                                               ********/
/********                                                               ********/
/********                                                               ********/
/*******************************************************************************/
/*******************************************************************************/
/*******************************************************************************/

//==============================================================================
// Get all keyboard input
// Prevent default behaviors for game actions [up, down, left, right, spacebar]
// Send keyboard input to player.js for parsing

var FIRED = false; // prevents hold-down key input
var GO = false; // prevents key input during countdown

$(document).keydown(function(e) {
	if(GO && !FIRED) {
		FIRED = true;
		if ($.inArray(e.keyCode, [32,37,38,39,40]) != -1) {
			e.preventDefault();
			window.game.player.playerInput(e.keyCode) // Check player input
		}
	}
});

$(document).keyup(function(e) {
	FIRED = false;
});

// Start game loop
$(document).ready(function() {

	console.log('updateWorker.js');
	SOCKET = io();

	/*=================================================================*/

	// Attach mturk submit function to the button
	$('#submit_mturk').click(function(){
		$('#mturk_form').submit();
	})

	/*------------------------------------------------------------------
	registerWorker
		Sent when client arrives to localhost:3000/game
	*/
	var mturk = gup('workerId');
	SOCKET.emit('registerWorker', mturk);

	/*------------------------------------------------------------------
	startCountdown
		Received when server starts server-side countdown
	*/
	SOCKET.on('startCountdown', function(_DAT) {
		console.log('Received startCountdown.', _DAT);
		$('#load-txt').hide();

		DAT = JSON.parse(_DAT);

		INSTR = new Instr_Control(); // Instruction controller global 
		INSTR.appendMessages();
		INSTR.getReady();

		window.game.round = new Round_Loop(DAT);
		window.game.round.startGame(); // create PF loop object
	});

	/*------------------------------------------------------------------
	startRound
		Received when server starts server-side round
	*/
	SOCKET.on('startRound', function(_round_num) {
		console.log('Received startRound.', _round_num);
		
		// Get round number from server
		window.game.round.round_num = parseInt(_round_num);

		 // Force finish any existing rounds
		$('#round-bar').finish();

		window.game.round.startRound();
	});

	/*------------------------------------------------------------------
	gameSnapshot
		Description
	*/
	SOCKET.on('gameSnapshot', function(obj) {
		console.log('Received gameSnapshot: ',obj);
		var obj = JSON.parse(obj);

		window.game.loop.resetMap();

		window.game.enemy.positions = obj.adver_positions;
		window.game.player.posX = obj.agent_posX;
		window.game.player.posY = obj.agent_posY;
		window.game.player.crossHash = obj.cross_hash;

		window.game.loop.startPF();
	});

});

