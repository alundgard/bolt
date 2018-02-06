
/*******************************************************************************

updateTrain.js

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
			window.game.player.playerInput(e.keyCode) // Check player input
		}
	}
});

$(document).keyup(function(e) {
	fired = false;
});

// Start game loop
$(document).ready(function() {

	console.log('updateTrain.js');

	// Attach mturk submit function to the button
	$('#submit_mturk').click(function(){
		$('#mturk_form').submit();
	});

	var mturk = gup('workerId');
	var pathType = gup('pathType');
	var phaseType = 'train';
	var pfTime = 3000;
	var roundTime = 3000;
	var roundMax = 3;

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

	// Global to save worker performance stats
	STATS = {
		numResp:0,
		numSucc:0,
		respTimes:[]
	}

	// Instruction controller global
	INSTR = new Instr_Control();
	INSTR.appendMessages();
	INSTR.runInstructions();
	$('#start-button').show();

});

