
/*******************************************************************************

instruct.js

Controller functions for displaying instructions dynamically

*******************************************************************************/

function Instr_Control() {

	var _this = this;

	/*==========================================================================
		Controller functions
	===========================================================================*/

	this.appendMessages = function() {
		this.welcomeMsg();
		this.startMsg();
		this.arrowMsg();
		this.timerMsg();
		this.mapMsg();
		this.failMsg();
		this.successMsg();
		this.openMsg();
		this.fixedMsg();
		this.randomMsg();
		this.getReadyMsg();
	};

	this.append2Popup = function(_msg) {
		$('#popup-box').append(_msg);
	};

	this.append2Instr = function(_msg) {
		$('#instr-box').append(_msg);	
	};

	this.runInstructions = function() {
		console.log('Running runInstructions.');

		this.appendMessages();
		$('#welcome-msg').delay(500).fadeIn('slow');

		//----------------------------------------------------------------------
		// Button functionality

		$('#welcome-button').click(function() {
			$('#welcome-msg').fadeOut('fast');
			$('#arrow-msg').delay(200).fadeIn();
		});

		$('#arrow-button').click(function() {
			$('#arrow-msg').fadeOut('fast');
			$('#fail-msg').delay(200).fadeIn();
		});

		$('#fail-button').click(function() {
			$('#fail-msg').fadeOut('fast');
			$('#success-msg').delay(200).fadeIn();
		});

		$('#success-button').click(function() {
			$('#success-msg').fadeOut('fast');
			$('#timer-msg').delay(200).fadeIn();

			$(function() {
			    doAnimation();
			});

			function doAnimation() {
				$('#timer-anim').animate(
					{width:"10"},
					{
						// Executes function at each "step" of animation
						step: function(now, fx) {
							if(now <= 0.75*fx.start) {
								$('#timer-anim').css('background-color','orange');
							}
							if(now <= 0.5*fx.start) {
								$('#timer-anim').css('background-color','red');
							}
						},

						// Calls function once animation completes
						done: function() {
							$('#timer-anim').css('width','100%');
							$('#timer-anim').css('background-color','lightgreen');
							doAnimation();
						},
						duration: 4000
					},
				);
			}


		});

		$('#timer-button').click(function() {
			$('#timer-msg').fadeOut('fast');
			$('#map-msg').delay(200).fadeIn();
		});

		$('#map-button').click(function() {
			$('#map-msg').fadeOut('fast');
			$('#start-msg').delay(200).fadeIn();
		});

		$('#repeat-button').click(function() {
			$('#start-msg').fadeOut('fast');
			_this.runInstructions();
		});

		$('#start-button').click(function() {
			$('#start-msg').fadeOut();
			_this.getReady();

			// Start first round
			window.game.round = new Round_Train(DAT);
			setTimeout(function() { 
				window.game.round.startGame();
				window.game.round.startRound();
			}, 5000);
		});
	};

	this.getReady = function() {
		$('#ready-msg').delay(500).fadeIn();

		var t = 4;
		var int = setInterval(function () {
		    $("#ready-count").html(t);
		    t--;
		    if (t < 0) {
		    	$('#ready-count').html('Start!')
		    	$('#ready-msg').delay(500).fadeOut();
		    	$('#instr-txt').delay(500).fadeOut();
		    	clearInterval(int);
		    	GO = true;
		    };
		}, 1000);
	};

	this.initRound = function() {
		// window.game.round = new Round_Loop(DAT);
		// window.game.round.startGame(DAT.pfTime);
	};

	/*==========================================================================
		Message content
	===========================================================================*/

	this.welcomeMsg = function() {
		var msg = 
				"<div class='popup-msg' id='welcome-msg' style='display:none;'> \
				<p>Welcome to Lightning Dodger!</p>\
				<img style='height:50x;width:80px' src='img/bolt.png'>\
				<img style='height:50x;width:80px' src='img/avatar.png'>\
				<p>The goal of this game is to dodge the lighning bolts.</p>\
				<p>You will play as the Dodger character.</p>\
				<button id='welcome-button'>Continue</button>\
				</div>";
		this.append2Instr(msg);
	};

	this.arrowMsg = function() {
		var rand = "<p style='color:red;'>Note: When you submit an input, you will automatically move to a random position on the map.</p>";
		var button = "<button id='arrow-button'>Continue</button>";
		var msg = 
				"<div class='popup-msg' id='arrow-msg' style='display:none;'> \
				<p>Move the dodger with the up, down, left, right keys.</p>\
				<p>Press spacebar to stay in the same position.</p>\
				<img style='height:50x;width:50px' src='img/arrow-01.png'>\
				<img style='height:50x;width:50px' src='img/arrow-02.png'>\
				<img style='height:50x;width:50px' src='img/arrow-03.png'>\
				<img style='height:50x;width:50px' src='img/arrow-04.png'>\
				<img style='height:50x;width:50px' src='img/arrow-05.png'>\
				<p>You will see your input displayed in the Input box.</p>";

		if (DAT.pathType == 'random') { msg += rand; }
		msg += button;
		msg += '</div>';
		this.append2Instr(msg);
	};

	this.failMsg = function() {
		var msg = 
				"<div class='popup-msg' id='fail-msg' style='display:none;'> \
				<img src='img/wrong.png' style='height:100px;width:100px;'>\
				<p>This symbol means that you have either failed to dodge the lightning,\
				or you have failed to submit input before the end of the round.</p>\
				<p style='font-size:50px;color:red;margin:0px;'>-100</p>\
				<p>You lose 100 points.</p>\
				<p>Try to avoid making any mistakes!</p>\
				<button id='fail-button'>Continue</button>\
				</div>";
		this.append2Instr(msg);
	};

	this.successMsg = function() {
		var msg = 
				"<div class='popup-msg' id='success-msg' style='display:none;'> \
				<p>If you dodge the lightning successfully you gain 100 points!</p>\
				<p style='font-size:50px;color:lightgreen;margin:0px;'>+100</p>\
				<p>Try to get as many points as possible by dodging better and faster.</p>\
				<button id='success-button'>Continue</button>\
				</div>";
		this.append2Instr(msg);
	};

	this.timerMsg = function() {

		var fixed = "<p style='color:red;'>Note: At the beginning of each round, you will start at a different position.</p>";
		var button = "<button id='timer-button'>Continue</button>";
		// var msg =
		// 		"<div class='popup-msg' id='timer-msg' style='display:none;'>\
		// 		<p>The shrinking bar indicates the time remaining in the round.</p>\
		// 		<div style='width:290px;height:30px;background:lightgreen;border-radius:10px;border:1px solid gray;'></div>\
		// 		<br>\
		// 		<div style='width:140px;height:30px;background:orange;border-radius:10px;border:1px solid gray;'></div>\
		// 		<br>\
		// 		<div style='width:50px;height:30px;background:red;border-radius:10px;border:1px solid gray;'></div>\
		// 		<p>Time's up!</p>\
		// 		<p>Try to dodge as many lightning bolts as possible.</p>";

		var msg =
				"<div class='popup-msg' id='timer-msg' style='display:none;'>\
				<p>The shrinking bar indicates the time remaining in the round.</p>\
				<div id='timer-anim' style='width:290px;height:30px;background:lightgreen;border-radius:10px;border:1px solid gray;'></div>\
				<p>Try to avoid making any mistakes!</p>";

		if (DAT.pathType == 'fixed') { msg += fixed; }
		msg += button;
		msg += "</div>";
		this.append2Instr(msg);	
	};

	this.mapMsg = function() {

		var button = "<button id='map-button'>Continue</button>";
		var msg =
				"<div class='popup-msg' id='map-msg' style='display:none;'>\
				<p>Note: The map wraps around.</p>\
				<p>If you move off the edge, you will end up on the opposite side.</p>";
		msg += button;
		msg += "</div>";
		this.append2Instr(msg);	
	};

	this.startMsg = function() {
		var msg = 
				"<div class='popup-msg' id='start-msg' style='display:none;'> \
				<p>You will go through 3 practice rounds first.</p>\
				<p style='color:red'>Note: If you do very well on the practice, you will have the opportunity to do 20 test rounds for a bonus.</p>\
				<p>Are you ready to try the practice rounds?</p>\
				<button id='repeat-button'>Repeat Instructions</button>\
				<button id='start-button' style='display:none;'>I'm ready to start.</button>\
				</div>";
		this.append2Instr(msg);
	};

	this.getReadyMsg = function() {
		var msg =
				"<div class='popup-msg' id='ready-msg' style='display:none;'>\
				<p>Please place your hands on the arrow keys.</p>\
				<p>Don't forget that you can use the spacebar.</p>\
				<p>Get ready to start dodging lightning!</p>\
				<div id='ready-count' style='font-size:60px;'>5</div>\
				</div>";
		this.append2Instr(msg);	
	};

	//--------------------------------------------------------------------------
	this.openMsg = function() {
		var msg = 
				"<div class='popup-msg' id='open-msg'style='display:none;'> \
				Open instructions. Press any button to continue.\
				</div>";
		this.append2Popup(msg);
	};

	this.fixedMsg = function() {
		var msg = 
				"<div class='popup-msg' id='fixed-msg' style='display:none;'> \
				Fixed instructions. Press any button to continue.\
				</div>";
		this.append2Popup(msg);
	};

	this.randomMsg = function() {
		var msg = 
				"<div class='popup-msg' id='random-msg' style='display:none;'> \
				Random instructions. Press any button to continue.\
				</div>";
		this.append2Popup(msg);
	};

}