
/*******************************************************************************/
/*******************************************************************************/
/*******************************************************************************/
/********                                                               ********/
/********                                                               ********/
/********                                                               ********/
/********                           ROUND TRAIN                         ********/
/********                                                               ********/
/********                                                               ********/
/********                                                               ********/
/*******************************************************************************/
/*******************************************************************************/
/*******************************************************************************/

function Round_Train(_dat) {
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
							console.log('Sending null input');
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
			_this.startRound();
		},
		stop: function() {
			$('#round-bar').stop();
		}
	};

	this.startGame = function() {
			console.log('Starting new game.');
			window.game.loop = new PF_Train(this.dat_copy); // Instantiate game loop object
			
			var FIRST = {
				'state_after': {
					'player': {
						'posX':1,
						'posY':1
					}
				}
			};
			window.game.loop.gameSnapshot(FIRST);
	};

	// Begin new round
	this.startRound = function() {
		
		_this.round_num++;
		window.game.round.no_resp = true; // Reset in the beginning, no reponse taken yet 

		if (this.continueRound()) {

			console.log('Starting new round.');
			console.log("Round: ",_this.round_num);
			$('#round-num').html(_this.round_num);

			_this.updateTimer.start();

		} else {

			_this.updateTimer.stop();
			window.game.loop.updateTimer.stop();

			var score = $('#pts-total').text();
			console.log('Final score: ',parseInt(score));

			if (this.performanceSufficient()) {
				console.log('Worker performance SUFFICIENT. Redirecting to task.');

				var url = "https://legionpowered.net/LegionToolsv2/tutorialDone.html";
				alert('You scored '+score+' points on the practice rounds! You will now be redirected to a brief waiting page before the testing rounds begin.');
				window.location = url;

			} else {
				console.log('Worker performance INSUFFICIENT. Do not redirect to task.');
				
				alert('You scored '+score+' points on the practice rounds! Please click the Submit HIT button. Thank you!');
				$('#submit_mturk').show();
				$('#task-complete').show();
			}
		}
	};

	//
	this.continueRound = function() {
		// console.log('round_num',window.game.round.round_num);
		// console.log('round_max',this.round_max);
		return (window.game.round.round_num <= this.round_max);
	}

	// Expects the global object
	// STATS = {
	// 	numResp:0,
	// 	numSucc:0,
	// 	respTimes:[]
	// }
	this.performanceSufficient = function() {
		var avgSucc = STATS.numSucc / STATS.numResp;
		var sum = 0;
		for(var i=0; i<STATS.respTimes.length; i++) {
			sum += STATS.respTimes[i];
		} 
		var avgSpeed = sum / STATS.respTimes.length;
		console.log('Player ACCURACY: ', avgSucc);
		console.log('Player AVG SPEED: ', avgSpeed);

		if (avgSucc >= 0.9 && avgSpeed >= 300) {
			return true;
		}
		return false;
	}
}