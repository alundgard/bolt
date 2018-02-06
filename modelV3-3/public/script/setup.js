
/*******************************************************************************

setup.js

Self-invoking global namespace (window.game)

Instantiates Map object (window.game.map)
Sets map dimenions based on url parameters

*******************************************************************************/

// -----------------------------------------------------------------------------
(function() {
	window.game = {}; // Create global namespace
}());

// -----------------------------------------------------------------------------
function Map(col,row) {
	this.col = (col == "") ? 4 : col; // Set col to 4 by default
	this.row = (row == "") ? 4 : row; // Set row to 4 by default
	this.goal = null;
	this.allplats = [];

	this.genPlatform = function() {
		for (i=0; i<this.row; i++) {
			var row_id = 'row-'+i;
			var row_str = '<div class="row" id='+row_id+'></div>';
			$('#plat-box').append(row_str);
			for (j=0; j<this.col; j++) {
				var plat_id = 'plat-'+j+'-'+i; // plat-x.y coord
				this.allplats.push('#'+plat_id);
				var col_str = 
				'<div class="col platform" id='+plat_id+'>'+
					'<div class="chars">'+
						'<img id="avatar" style="display:none;" src="img/avatar.png">'+
						'<img id="goal" style="display:none;" src="img/goal.png">'+
						'<img class="bolt" style="display:none;" src="img/bolt.png">'+
						'<img class="arrow" id="up" style="display:none;" src="img/arrow-01.png">'+
						'<img class="arrow" id="right" style="display:none;" src="img/arrow-02.png">'+
						'<img class="arrow" id="down" style="display:none;" src="img/arrow-03.png">'+
						'<img class="arrow" id="left" style="display:none;" src="img/arrow-04.png">'+
						'<img class="arrow" id="stay" style="display:none;" src="img/arrow-05.png">'+
					'</div>'+
				'</div>';
				$('#'+row_id).append(col_str);
			}
		}
	};

	// Randomly generate goal (flag) position
	this.genGoal = function() {
		// var x = Math.floor(Math.random() * this.col);
		// var y = Math.floor(Math.random() * this.row);
		var x = -1;
		var y = -1;

		this.goal = '#plat-'+x+'-'+y;
	};

	this.renderGoal = function() {
		$(this.goal+'>.chars>#goal').show();
	}

	this.genPlatform(); // execute
	this.genGoal(); // execute
}

// -----------------------------------------------------------------------------
$(document).ready(function() {
	console.log('setup.js');
	var xplat = gup('cols'); // Num platforms (x axis)
	var yplat = gup('rows'); // Num platforms (y axis)
	window.game.map = new Map(xplat,yplat);
});

