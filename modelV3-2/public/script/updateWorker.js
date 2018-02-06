
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
var fired = false;
$(document).keydown(function(e) {
	if(!fired) {
		fired = true;
		if ($.inArray(e.keyCode, [32,37,38,39,40]) != -1) {
			e.preventDefault();
		}
		window.game.player.playerInput(e.keyCode) // Check player input
	}
});

$(document).keyup(function(e) {
	fired = false;
});

// Start game loop
$(document).ready(function() {

	console.log('updateWorker.js');
	SOCKET = io();

	var mturk = gup('workerId');
	var pathType = gup('pathType');
	var phaseType = gup('phaseType');
	if (phaseType == 'train') {
		var pfTime = 3000;
		var roundTime = 3000;
		var roundMax = 3;
	}
	else if (phaseType == 'test') {
		var pfTime = parseInt(gup('pfTime'));
		var roundTime = parseInt(gup('roundTime'));
		var roundMax = parseInt(gup('roundMax'));
	}
	else { console.log('ERROR: Invalid phaseType!') }

	/*=================================================================*/
	// GLOBALS
	DAT = {'mturkId':mturk,
				'phaseType':phaseType,
				'pathType':pathType,
				'pfTime':pfTime,
				'roundTime':roundTime,
				'roundMax':roundMax
				};

	console.log('DAT',DAT);

	INSTR = new Instr_Control(); // Instruction controller global

	/*=================================================================*/

	// Attach mturk submit function to the button
	$('#submit_mturk').click(function(){
		$('#mturk_form').submit();
	})

	/*------------------------------------------------------------------
	registerWorker
		Sent when client arrives to localhost:3000/game
	*/
	SOCKET.emit('registerWorker', JSON.stringify(DAT));

	/*------------------------------------------------------------------
	queryGame
		Sent when client arrives to localhost:3000/game
	*/
	SOCKET.emit('queryGame');

	/*------------------------------------------------------------------
	showGame
		Received when client responds to queryGame
	*/
	SOCKET.on('showGame', function(resp) {
		console.log('Received showGame.', resp);

		// Ask to start the game
		if (resp == "NO_GAME_EXISTS") {

			//----------------------------------------------------------
			if (phaseType == 'train') {

					INSTR.runInstructions();

			//----------------------------------------------------------
			} else if (phaseType == 'test') {
				var str = "Remember, the test rounds will be MUCH faster than the practice rounds.";
				alert(str);
				INSTR.appendMessages();
				INSTR.getReady();
			}
		} 
	});

	/*------------------------------------------------------------------
	gameSnapshot
		Description
	*/
	SOCKET.on('gameSnapshot', function(obj) {
		//console.log('Received gameSnapshot: ',obj);
		var obj = JSON.parse(obj);

		window.game.loop.resetMap();
		window.game.map = obj.map;
		window.game.enemy.positions = obj.enemy.positions;
		window.game.obstacle.positions = obj.obstacle.positions;
		window.game.player.moved = obj.player.moved;
		window.game.player.posX = obj.player.posX;
		window.game.player.posY = obj.player.posY;

		window.game.loop.startPF();
	});

});

