/*******************************************************************************/
/*******************************************************************************/
/*******************************************************************************/
/********                                                               ********/
/********                                                               ********/
/********                                                               ********/
/********                           PF TRAIN                            ********/
/********                                                               ********/
/********                                                               ********/
/********                                                               ********/
/*******************************************************************************/
/*******************************************************************************/
/*******************************************************************************/

function PF_Train(_dat) {
	/*--------------------------------------------------------------------------
	Initialize Loop Globals
	*/
	this.pts_total = 0;
	this.resp_time = _dat.pfTime;
	this.start_time = null;
	var _this = this;

	/*==========================================================================
	Methods to Update Views
	*/
	this.updateTimer = {
		// Countdown existing round	
		start: function() {
			_this.start_time = Date.now();
			$('#count-bar').animate(
				{width:"10"},
				{
					start: function() {},

					// Executes function at each "step" of animation
					step: function(now, fx) {
						if(now <= 0.75*fx.start) {
							$('#count-bar').css('background-color','orange');
						}

						if(now <= 0.5*fx.start) {
							$('#count-bar').css('background-color','red');
						}

						// var pts = Math.floor($('#count-bar').width());
						// $('#pts-round').html(pts);
					},

					// Calls function once animation completes
					done: function() {
						console.log('Finished PF countdown.');
						//$('#struck-alert').show().delay(100).fadeOut();
						window.game.player.playerInput(null);
						window.game.loop.gameOver();
						window.game.loop.updateTimer.reset();

					},
					// Agent response time duration 
					duration: _this.resp_time
				},
			);
		},
		reset: function() {
			$('#count-bar').stop();
			$('#count-bar').css({width:"auto"});
			$('#count-bar').css('background-color','lightgreen');
		},
		stop: function() {
			$('#count-bar').stop();
		},
	};

	this.updatePlatform = {
		reset: function() {
			console.log('Resetting platform.')
			$('.chars > #avatar').css({display:"none"});
			$('.chars').parent().css('background-color','gainsboro');
		},
	};

	this.updateEnemy = {
		reset: function() {
			$('.bolt').css({display:"none"});
			$('.fog').css({display:"none"});
			window.game.enemy.clearPositions();
		},
		// Compares player position with all lightning positions
		// Return true if player is struck by lightning (failure!)
		checkLightning: function() {
			console.log('Checking lightning.')
			var player_pos = '#plat-'+window.game.player.posX+'-'+window.game.player.posY;
			var struck = false;
			$.each(window.game.enemy.positions, function(idx,pos) {
				if (player_pos == pos) {
					//alert("GAME OVER\nYou failed to move in time!");
					$('#struck-alert').show().delay(100).fadeOut();
					struck = true;
				}
			});
			return struck;
		}
	};

	this.updateGoal = {
		// Compare player position with goal position
		// Return true if player reaches goal (success!)
		checkGoal: function() {
			console.log('Checking goal.')
			var player_pos = '#plat-'+window.game.player.posX+'-'+window.game.player.posY;
			if (player_pos == window.game.map.goal) {
					alert("SUCCESS\nYou reached the goal!");
					//clearInterval(window.game.phase.loop);
					return true;
			}
			return false;
		}
	};

	/*==========================================================================
	Methods for Game Logistics 
	*/

	// Resets the map
	// Basically hides all character elements
	this.resetMap = function() {

		this.updateTimer.reset();
		this.updateEnemy.reset();
		this.updatePlatform.reset();
	};

	// Renders the map for current round
	// See "render" functions in corresponding objects
	this.renderMap = function() { 
		console.log('Rendering map.')

		// Render player avatar location
		window.game.player.renderPlayer();

		// Render fog locations
		window.game.obstacle.renderFog();

		// Render lightning bolt locations
		window.game.enemy.renderLightning();
	};

	// Calls checkLightning and checkGoal
	// If either returns true, then game over
	this.gameOver = function() {
		if (this.updateEnemy.checkLightning()) {
			return true;
		}
	};

	// Add points to total, send response to server
	// Called when user makes decision before time expires
	// "Freezes" the countdown bar
	this.registerResponse = function(data) {
		
		this.updateTimer.stop();
		var failure = window.game.loop.gameOver();

		if (failure || data.response == null) { 
			data.success = false;
			this.pts_total -= 100;
			$('#pts-total').html(this.pts_total);
			$('#pts-total').css('color','red');
			//$('#pts-total').animate({'color':'black'}, 'fast');
			
		} else {
			// Update action object
			data.success = true;
			//this.pts_total += Math.floor($('#count-bar').width());
			this.pts_total += 100;
			$('#pts-total').html(this.pts_total);
			$('#pts-total').css('color','lightgreen');
			//$('#pts-total').animate({'color':'black'}, 'fast');
		}

		// Send response to server
		console.log('WorkerResponse: ',data);
		
		// Update worker performance stats
		STATS.numResp++;
		if (data.success) STATS.numSucc++;
		STATS.respTimes.push(data.respTime);

		console.log('Worker Stats: ',STATS);

		_this.gameSnapshot(data);
	}

	// Begin new round
	this.startPF = function() {
		console.log('Starting new PF.');
		window.game.player.moved = false;
		window.game.loop.renderMap();
		window.game.loop.updateTimer.start();
	};

	/*------------------------------------------------------------------
	gameSnapshot
		Description
	*/
	this.gameSnapshot = function(action) {
		window.game.loop.resetMap();

		console.log('ACTION',action);

		window.game.enemy.positions = _this.getAdverPos();
		window.game.player.posX = action.state_after.player.posX;
		window.game.player.posY = action.state_after.player.posY;

		window.game.loop.startPF();
	};

	/*------------------------------------------------------------------
	getAdverPos
	*/
	// Get array size 4, of random, unique adversary positions
	this.getAdverPos = function() {
		var arr = [];
		while(arr.length < 4) {

			// Generate random position string
			var coord = _this.getRandomCoord();
			var platstr = _this.pos2Str(coord.posX,coord.posY);

			// Add to arr if not already in there
			if (arr.indexOf(platstr) == -1) {
				arr.push(platstr);
			}
		}
		return arr;
	};

	// Gets random coordinate based on map dimension
	this.getRandomCoord = function() {
		return {
			posX: Math.floor(Math.random() * 4),
			posY: Math.floor(Math.random() * 4)
		}
	};

	// Generate platform string
	this.pos2Str = function(posX, posY) {
		return "#plat-"+posX+"-"+posY;
	};

}