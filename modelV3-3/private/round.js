/*******************************************************************************/
/*******************************************************************************/
/*******************************************************************************/
/********                                                               ********/
/********                                                               ********/
/********                                                               ********/
/********                    SERVER-SIDE ROUND LOOP                     ********/
/********                                                               ********/
/********                                                               ********/
/********                                                               ********/
/*******************************************************************************/
/*******************************************************************************/
/*******************************************************************************/

var pf = require('./future.js');
var debug = require('./debug.js');
var agg = require('./aggregate.js');
var hash = require('object-hash');

var execs = require('../models/execs.js');
var preds = require('../models/preds.js');

module.exports = {

	Round_Loop: function(_io, _dat) {
		var _this = this;

		this.io = _io;
		this.dat_copy = _dat;
		this.game_id = _dat.gameId;
		this.round_time = _dat.roundTime;
		this.round_num = 0;
		this.round_max = _dat.roundMax;
		this.path_type = _dat.pathType;
		this.phase_type = _dat.phaseType;

		this.N = _dat.N; // Num time steps to look ahead
		this.A = _dat.A; // Num acts to execute per round
		this.G = _dat.G; // Grid dimension 
		this.B = _dat.B; // Num lightning bolts

		this.roundCountdown;

		/*--------------------------------------------------------------------------*/
		this.possible_futures = new pf.PF(this.path_type,
											this.io,
											this.N,
											this.G,
											this.B);
		this.possible_futures.initCross();
		this.possible_futures.initMemo();

		/*--------------------------------------------------------------------------*/
		this.DB_preds = new preds({
					gameId: this.game_id,
					pathType: this.path_type,
					pfTime: this.round_time,
					roundTime: this.round_time
					});
		this.DB_preds.save();

		this.DB_execs = new execs({ 
					gameId: this.game_id,
					pathType: this.path_type,
					pfTime: this.round_time,
					roundTime: this.round_time
					});
		this.DB_execs.save();

		/*--------------------------------------------------------------------------*/
		this.updateTimer = {
			start: function() {
				console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
				console.log('          Calling updateTimer.start()               ');
				console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');

				_this.executeEnd();

				_this.possible_futures.send1stFuture();

				// Stops the timer after _this.round_time milliseconds
				_this.roundCountdown = setTimeout(function() {
					
					_this.updateTimer.stop();

				}, _this.round_time);

			},
			reset: function() {
				console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
				console.log('          Calling updateTimer.reset()               ');
				console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');

				_this.startRound();

			},
			stop: function() {
				console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
				console.log('          Calling updateTimer.stop()                ');
				console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
				
				clearTimeout(_this.roundCountdown);
				_this.updateTimer.reset();
			}
		};

		this.continueRound = function(){
			return (_this.round_num <= _this.round_max);
		};

		this.startGame = function(){
			// Instatiate the PF object
		};

		this.startRound = function(){
			// If havent reached round_max yet, start another round.
			if (_this.continueRound()) {
				console.log('Starting new round.');
				console.log("Round: ",_this.round_num);

				_this.round_num++; // Increment round number each round
				this.io.sockets.in('subjects').emit('startRound', _this.round_num);	
				_this.updateTimer.start();

			}
			// Otherwise, end the server-side game
			else {

				console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
				console.log('%                                                  %');
				console.log('%                  GAME COMPLETE.                  %');
				console.log('%                                                  %');
				console.log('%                     CONGRATS!                    %');
				console.log('%                                                  %');
				console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');

				Object.keys(_this.io.sockets.sockets).forEach(function(s) {
					_this.io.sockets.sockets[s].disconnect(true);
				});

			}
		};

		this.executeEnd = function() {
			console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
			console.log('%                                                  %');
			console.log('%                 ROUND END EXECUTE                %');
			console.log('%                                                  %');
			console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
			
			var _start = new Date();

			// Randomly generate adversary position
			// Note: this amounts to selecting randomly from this.possible_futures.cross
   			var i = (_this.possible_futures.cross.length * Math.random() << 0);
			var cross_pos = _this.possible_futures.cross[i];
			var cross_hash = hash(cross_pos);

			// Get corresponding response from this.possible_futures.memo
			var memodat = _this.possible_futures.memo[cross_hash];
			var resps = [];
			memodat.forEach(function(d) {
				resps.push(d.response);
			});
			//console.log("Memo responses: ",resps);

			// Aggregate responses
			if (resps.length == 0) { var resp = null; }
			else {
				var resp = agg.majorityRules(resps);
			}

			var end = new Date();
			var time = end - _start;

			// Get result of player move
			var agent = {cX:0,cY:0};
			switch(resp) {
				case null: // No worker input
					console.log('Memo player move: null');
					// Randomly generate agent move
					agent = agent;
					break;
				case 32: // Spacebar
					console.log('Memo player move: Stay');
					agent = agent;
					break;
				case 37: // Left arrow
					console.log('Memo player move: Left');
					agent.cX--;
					break;
				case 38: // Up arrow
					console.log('Memo player move: Up');
					agent.cY--;
					break;
				case 39: // Right arrow
					console.log('Memo player move: Right');
					agent.cX++;
					break;
				case 40: // Down arrow
					console.log('Memo player move: Down');
					agent.cY++;
					break;
				default:
			}

			// Check if player move was successful
			var success = true;
			cross_pos.forEach(function(c) {
				if (c.cX == agent.cX && c.cY == agent.cY) success = false;
			});

			// Update this.possible_futures.agent_pos

			var curr = _this.possible_futures.agent_pos;
			curr.posX = ((curr.posX + agent.cX).mod(_this.G));
			curr.posY = ((curr.posY + agent.cY).mod(_this.G));
			_this.possible_futures.agent_pos = curr;

			console.log('curr:',curr);

			debug.assert((curr.posX >= 0 && curr.posX < ROUND.G), "Agent posX out of bounds: "+curr.posX);
			debug.assert((curr.posY >= 0 && curr.posX < ROUND.G), "Agent posY out of bounds: "+curr.posY);

			console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
			console.log('MEMO PLAYER MOVE --->',resp);
			console.log('AGENT POS --->',agent);
			console.log('SUCCESS? --->',success);
			console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');

			// Saving to DB
			var execution = {
		        date: new Date(),
		        roundNum: _this.round_num,

		        memoSnap: _this.possible_futures.memo,
		        agentPos: [{
		            posX: curr.posX,
		            posY: curr.posY
		        }],
		        adverPos: cross_pos,

		        response: resp,
		        respTime: time,
		        success: success
		    }
			_this.DB_execs.updateExec(execution);

		};
	}
}

