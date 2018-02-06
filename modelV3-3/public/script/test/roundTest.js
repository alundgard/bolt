
/*******************************************************************************/
/*******************************************************************************/
/*******************************************************************************/
/********                                                               ********/
/********                                                               ********/
/********                                                               ********/
/********                           ROUND LOOP                          ********/
/********                                                               ********/
/********                                                               ********/
/********                                                               ********/
/*******************************************************************************/
/*******************************************************************************/
/*******************************************************************************/

function Round_Loop(_dat) {
	this.dat_copy = _dat;
	this.round_time = _dat.roundTime;
	this.round_num = 0;
	this.round_max = _dat.roundMax;
	this.path_type = _dat.pathType;
	this.phase_type = _dat.phaseType;
	this.no_resp = null;
	var _this = this;

	/*==========================================================================
	Methods to Update Views
	*/
	this.updateTimer = {
		// Countdown existing round	
		start: function() {
			console.log('Starting Round countdown.');
			$('#round-bar').animate(
				{width:"10"},
				{
					// Executes function at each "step" of animation
					step: function(now, fx) {
						if(now <= 0.75*fx.start) {
							$('#round-bar').css('background-color','orange');
						}
						if(now <= 0.5*fx.start) {
							$('#round-bar').css('background-color','red');
						}
						var pts = Math.floor($('#round-bar').width());
						$('#pts-round').html(pts);
					},

					// Calls function once animation completes
					done: function() {
						console.log('Finished round countdown.');

						// If there's no reponse submitted in a round, log null
						if(window.game.round.no_resp) {
							$('#struck-alert').show().delay(100).fadeOut();
							window.game.player.playerInput(null);
							console.log('sending null input');
						}
						_this.updateTimer.reset();
					},
					// Agent response time duration 
					duration: _this.round_time
				},
			);
		},
		reset: function() {
			$('#round-bar').stop();
			$('#round-bar').css({width:"auto"});
			$('#round-bar').css('background-color','lightgreen');
		},
		stop: function() {
			$('#round-bar').stop();
		}
	};

	this.startGame = function() {
			console.log('Starting new game.');
			window.game.loop = new PF_Loop(this.dat_copy); // Instantiate game loop object
	};

	// Begin new round
	this.startRound = function() {
		
		// window.game.round.round_num++;
		window.game.round.no_resp = true; // Reset in the beginning, no reponse taken yet 

		if (this.continueRound()) {

			console.log('Starting new round.');
			console.log("Round: ",_this.round_num);
			$('#round-num').html(_this.round_num);

			_this.updateTimer.start();

		} else {

			SOCKET.emit('taskComplete'); // Tell server to disconnect the client socket

			_this.updateTimer.stop();
			window.game.loop.updateTimer.stop();

			var score = $('#pts-total').text();
			console.log('Final score: ',score);

			alert('You scored '+score+' points on the test rounds! Please click the Submit HIT button. Thank you!');
			$('#submit_mturk').show();
			$('#task-complete').show();
		}
	};

	//
	this.continueRound = function() {
		// console.log('round_num',window.game.round.round_num);
		// console.log('round_max',this.round_max);
		return (window.game.round.round_num <= this.round_max);
	}
}