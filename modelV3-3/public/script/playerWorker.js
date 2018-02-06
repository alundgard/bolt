
/*******************************************************************************

player.js

Instantiates Player object (window.game.player)

*******************************************************************************/

// -----------------------------------------------------------------------------
function Player(x,y,moved) {
	this.posX = x || 0; // Current posX
	this.posY = y || 0; // Current posY
	this.prevX = 0; // Prev posX
	this.prevY = 0; // Prev posY
	this.moved = false;

	// Randomly generates player starting position
	this.startPos = function() {
		var xmax = window.game.map.col;
		var ymax = window.game.map.row;
		// Randomly generate starting position
		this.posX = Math.floor(Math.random() * xmax);
		this.posY = Math.floor(Math.random() * ymax);
	};

	// Set previous position to current position
	this.updatePrev = function() {
		window.game.player.prevX = parseInt(window.game.player.posX);
		window.game.player.prevY = parseInt(window.game.player.posY);
	};

	// Handles player action input
	this.playerMove = function(dir) {

		var end_time = Date.now();
		var respTime = end_time - window.game.loop.start_time;
		console.log('respTime: ',respTime);

		var xmax = window.game.map.col;
		var ymax = window.game.map.row;
		var player_pos = '#plat-'+window.game.player.posX+'-'+window.game.player.posY;

		/*==========================================================
			Send agent worker action to server
			action = {
				state_before: Game state before action,
				state_after: Game state after action,
				response: Key press,
				success: Bool (True if agent move successful)
				crossHash: hash
			}
		*/
		var action = {};
		action.state_before = JSON.parse(JSON.stringify(window.game));
		action.response = dir;
		action.respTime = respTime;
		action.success = null; // updated in registerResponse
		action.crossHash = window.game.player.crossHash;

		switch(dir) {
			case null: // No worker input
				console.log('Player move: null');

				action.state_after = window.game;
				window.game.loop.registerResponse(action);
				//window.game.round.no_resp = false;

				break;
			case 32: // Spacebar
				console.log('Player move: Stay');
				
				this.updatePrev();
				//$(player_pos+'>.chars>#stay').show().fadeOut();
				$('#stay').show().fadeOut('fast');

				action.state_after = window.game;
				window.game.loop.registerResponse(action);
				window.game.round.no_resp = false;

				break;
			case 37: // Left arrow
				console.log('Player move: Left');

				this.updatePrev();
				//$(player_pos+'>.chars>#left').show().fadeOut();
				$('#left').show().fadeOut('fast');
				if (window.game.player.posX > 0) {
					window.game.player.posX--;					
				}
				else {
					window.game.player.posX = window.game.map.col-1;
				}
				action.state_after = window.game;
				window.game.loop.registerResponse(action);
				window.game.round.no_resp = false;

				break;
			case 38: // Up arrow
				console.log('Player move: Up');

				this.updatePrev();
				//$(player_pos+'>.chars>#up').show().fadeOut();
				$('#up').show().fadeOut('fast');
				if (window.game.player.posY > 0) {
					window.game.player.posY--;
				}
				else {
					window.game.player.posY = window.game.map.row-1;
				}
				action.state_after = window.game;
				window.game.loop.registerResponse(action);
				window.game.round.no_resp = false;

				break;
			case 39: // Right arrow
				console.log('Player move: Right');
				this.updatePrev();
				//$(player_pos+'>.chars>#right').show().fadeOut();
				$('#right').show().fadeOut('fast');
				if (window.game.player.posX < window.game.map.col-1) {
					window.game.player.posX++;
				}
				else {
					window.game.player.posX = 0;
				}
				action.state_after = window.game;
				window.game.loop.registerResponse(action);
				window.game.round.no_resp = false;

				break;
			case 40: // Down arrow
				console.log('Player move: Down');
				this.updatePrev();
				//$(player_pos+'>.chars>#down').show().fadeOut();
				$('#down').show().fadeOut('fast');
				if (window.game.player.posY < window.game.map.row-1) {
					window.game.player.posY++;	
				}
				else {
					window.game.player.posY = 0;
				}
				action.state_after = window.game;
				window.game.loop.registerResponse(action);
				window.game.round.no_resp = false;
				
				break;
			default:
		}
	};

	// Check if player trying to move twice in same round
	this.playerInput = function(input) {
		if (this.moved) {
			console.log('Player already moved this round.');
		} else {
			this.moved = (input == 32) || (input >= 37 && input <= 40);
			this.playerMove(input);
		}
	};

	// Show player on map at current position
	this.renderPlayer = function() {
		// Render player avatar location
		var PLAYER = window.game.player;
		var plat_id = 'plat-'+PLAYER.posX+'-'+PLAYER.posY;
		var prev_id = 'plat-'+PLAYER.prevX+'-'+PLAYER.prevY;

		$('#'+prev_id+'>.chars>'+'#avatar').hide();
		$('#'+plat_id+'>.chars>'+'#avatar').show();
	};

}

// -----------------------------------------------------------------------------
$(document).ready(function() {
	console.log('player.js');
	window.game.player = new Player(0,0,false);
	window.game.player.startPos();
});

