
/*******************************************************************************

first.js

Instantiates first round positions

*******************************************************************************/

$(document).ready(function() {
	console.log('Rendering positions.');

	// Generate fog locations
	window.game.obstacle.getPositions();

	// Generate lightning bolt locations
	window.game.enemy.getPositions();
});
