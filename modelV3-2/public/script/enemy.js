
/*******************************************************************************

enemy.js

Instantiates any enemy/obstacle objects
Currently, instantiates the following:
		Lightning (window.game.enemy)
		Fog (window.game.obstacle)

*******************************************************************************/

// -----------------------------------------------------------------------------
function Lightning() {
	this.positions = [];

	this.clearPositions = function() {
		this.positions = [];
	};

	this.getPositions = function() {
		var xmax = window.game.map.col;
		var ymax = window.game.map.row;
		this.clearPositions();
		/*
			for (i=0; i<Math.floor(xmax*ymax/2); i++) {
				var x = Math.floor(Math.random() * xmax);
				var y = Math.floor(Math.random() * ymax);
				var plat_id = '#plat-'+x+'-'+y;
				if ($.inArray(plat_id, this.positions) === -1) {
					this.positions.push(plat_id);
				}
			}
		*/
		// Randomly generate 1 lightning
		var x = Math.floor(Math.random() * xmax);
		var y = Math.floor(Math.random() * ymax);
		var plat_id = '#plat-'+x+'-'+y;
		this.positions.push(plat_id);
	};

	this.renderLightning = function() {
		$.each(this.positions, function(idx,pos) {
	  		$(pos+'>.chars>'+'.bolt').show();
	  		//$(pos+'>.chars>'+'.bolt').fadeOut(2000)
	  		$(pos).css('background-color','gold');
		});
	};
};

// -----------------------------------------------------------------------------
function Fog() {
	this.positions = [];
	this.visited = [];

	this.getPositions = function() {
		this.clearPositions();
		var xmax = window.game.map.col;
		var ymax = window.game.map.row;
		var curx = window.game.player.posX;
		var cury = window.game.player.posY;
		this.visited.push('#plat-'+curx+'-'+cury); // current pos

		// Surrounding positions
		this.visited.push('#plat-'+(curx-1)+'-'+cury); // left
		this.visited.push('#plat-'+(curx+1)+'-'+cury); // right
		this.visited.push('#plat-'+curx+'-'+(cury+1)); // up
		this.visited.push('#plat-'+curx+'-'+(cury-1)); // down

		for (i=0; i<xmax; i++) {
			for(j=0; j<ymax; j++) {
				var plat_id = '#plat-'+i+'-'+j;
				if ($.inArray(plat_id, this.visited) === -1) {
					this.positions.push(plat_id);
				}
			}
		}
	};

	this.clearPositions = function() {
		this.positions = [];
	};

	this.renderFog = function() {
		this.getPositions();
		$.each(this.positions, function(idx,pos) {
	  		$(pos+'>.fog').show();
		});
	};
}

// -----------------------------------------------------------------------------
$(document).ready(function() {
	console.log('enemy.js');
	window.game.enemy = new Lightning();
	window.game.obstacle = new Fog();
});

