
var debug = require('./debug.js');
var hash = require('object-hash');

module.exports = {

	/*--------------------------------------------------------------------------
	PF Object
		The PF object sends pfs to worker depending on pathType
		It calls the functions in predict.js to generate the pfs
	*/
	PF: function(_pathType, _io, _clientId, _n, _g, _b) {
			this.io = _io;
			this.clientId = _clientId;
			this.pathType = _pathType;
			this.visited = {};
			this.startpos = { posX: null, posY: null };
			this.n = _n; // num lookahead steps
			this.g = _g; // gxg map dimention
			this.b = _b; // num lightning bolts
			this.maxNumPfs = getMaxNumPfs(this.g, this.b);


	/*==========================================================================
		Game logic functions
	===========================================================================*/

			// Save agent position at startRound
			this.roundStartPos = function(_posX, _posY) {
				if (this.startpos.posX == null && this.startpos.posY == null) {
					console.log('Init rountStart position.');
					this.startpos.posX = _posX;
					this.startpos.posY = _posY;
				}
			};

			// Send one future to the worker
			this.sendFuture = function(_newRound) {
				console.log(this.clientId+': sendFuture');

				// Send pf game snapshot
				var pf = this.getNextFuture(_newRound); // Get next possible future										
				this.io.sockets.connected[this.clientId].emit('gameSnapshot', JSON.stringify(pf));
			};

			// Gets next future depending on time step traversal
			this.getNextFuture = function(_newRound) {
				console.log('-----getNextFuture: '+this.pathType);

				var curr = GAMES[this.clientId].GAME_STATE;
				debug.assert((curr != undefined), 'curr is undefined!');

				switch(this.pathType){

					case 'open':
						var pos = this.open(curr);
						var pf = this.updateGameObj(curr,pos);
						break;

					case 'fixed':
						var pos = this.fixed(curr, _newRound);
						var pf = this.updateGameObj(curr,pos);
						break;

					case 'random':
						var pos = this.random(curr);
						var pf = this.updateGameObj(curr,pos);
						break;
				}
				debug.assert((pf != null), 'pf is null!');

				console.log('Returning pf');
				return pf;
			};

			// Updates game object with new positions
			this.updateGameObj = function(_currObj, _newPos) {
				_currObj.player.posX = _newPos['agentPos'].posX;
				_currObj.player.posY = _newPos['agentPos'].posY;
				_currObj.enemy.positions = _newPos['adverPos'];
				return _currObj;
			};


	/*==========================================================================
		Open, Fixed, Random functions
	===========================================================================*/

			/*------------------------------------------------------------------
			open
				Only update adversary position
				Agent position inherited from current GAME_STATE
			*/
			this.open = function (_currState) {
				var key = null;
				var pos = { 
					agentPos: {
						posX: _currState.player.posX,
						posY: _currState.player.posY
					}, 
					adverPos: [] };

				// Generate positions, check if visited
				var count = 0;
				do {
					count++;

					// Random adversary positions
					pos['adverPos'] = this.getAdverPos();

					// Get object hash
					key = hash(pos);
					debug.assert((key != null), 'key is null!');

				} while(this.alreadyVisited(key) && count < this.maxNumPfs);

				// Set state to visited
				this.visited[key] = true;
				return pos;
			};

			/*------------------------------------------------------------------
			fixed
				Update adversary position
				Agent position inherited from current GAME_STATE
				Snap agent position back if starting a new round
			*/
			this.fixed = function (_currState, _newRound) {
				var key = null;
				var pos = { 
					agentPos: {
						posX: _currState.player.posX,
						posY: _currState.player.posY
					}, 
					adverPos: [] };

				// Snap agent back if starting a new round
				// Update this.startpos for snapback next round
				if (_newRound) {
					pos['agentPos'] = this.snapbackAgent();
					this.startpos = pos['agentPos'];
				}

				// Generate positions, check if visited
				var count = 0;
				do {
					count++;

					// Random adversary positions
					pos['adverPos'] = this.getAdverPos();

					// Get object hash
					key = hash(pos);
					debug.assert((key != null), 'key is null!');

				} while(this.alreadyVisited(key) && count < this.maxNumPfs);

				// Set state to visited
				this.visited[key] = true;
				return pos;
			};

			/*------------------------------------------------------------------
			random
				Update player AND adversary positions

				Randomly generate agent/adversary possitions based on map dimension
				Check against the visited obj, if visited, generate again
			*/
			this.random = function (_currState) {			
				var key = null;
				var pos = { agentPos: null, adverPos: [] };

				// Generate positions, check if visited
				var count = 0;
				do {
					count++;

					// Random agent position
					pos['agentPos'] = this.getRandomCoord();

					// Random adversary positions
					pos['adverPos'] = this.getAdverPos();

					// Get object hash
					key = hash(pos);
					debug.assert((key != null), 'key is null!');

				} while(this.alreadyVisited(key) && count < this.maxNumPfs);

				// Set state to visited
				this.visited[key] = true;
				return pos;
			};

	/*==========================================================================
		Helper functions
	===========================================================================*/

			// Calculatet binomial coefficient
			function binomial(n, k) {
			    var coeff = 1;
			    for (var x = n-k+1; x <= n; x++) coeff *= x;
			    for (x = 1; x <= k; x++) coeff /= x;
			    console.log('Binomial: ',n,k,coeff);
			    return coeff;
			}

			// Calculates the theoretical upper bound on number of pfs
			// Given grid dimensions and number of bolts
			function getMaxNumPfs(g, b) {
				var num_agent_pos = Math.pow(g,2);
				var num_adver_pos = binomial(Math.pow(g,2),b);
				console.log('getMaxNumPfs: ',num_agent_pos * num_adver_pos);
				return num_agent_pos * num_adver_pos;
			}

			// Returns true if generated state is already visited
			this.alreadyVisited = function(key) {
				return (key in this.visited);
			};

			// Gets random coordinate based on map dimension
			this.getRandomCoord = function() {
				return {
					posX: Math.floor(Math.random() * this.g),
					posY: Math.floor(Math.random() * this.g)
				}
			};

			// Get array size b, of random, unique adversary positions
			this.getAdverPos = function() {
				var arr = [];
				while(arr.length < this.b) {

					// Generate random position string
					var coord = this.getRandomCoord();
					var platstr = this.pos2Str(coord.posX,coord.posY);

					// Add to arr if not already in there
					if (arr.indexOf(platstr) == -1) {
						arr.push(platstr);
					}
				}
				return arr;
			};

			// Snap agent back to valid position, if starting new round
			this.snapbackAgent = function() {

				// Generate neighbors
				var n = this.findNeighbors(
					this.startpos.posX,
					this.startpos.posY,
					this.g,
					this.g);

				// Return a random neighbor
				return n[Math.floor(Math.random() * n.length)];
			};

			// Generate platform string
			this.pos2Str = function(posX, posY) {
				return "#plat-"+posX+"-"+posY;
			};

			// Generate all valid neighboring positions
			this.findNeighbors = function(posX, posY, col, row) {
				var neighbors = [];
				var valid = [];
				
				neighbors.push({posX:posX-1,posY:posY});
				neighbors.push({posX:posX,posY:posY-1});
				neighbors.push({posX:posX,posY:posY});
				neighbors.push({posX:posX+1,posY:posY});
				neighbors.push({posX:posX,posY:posY+1});
				
				// Check map bounds
				neighbors.forEach(function (elem) {
					if (!(elem.posX < 0 || elem.posY < 0 || elem.posX > (col-1) || elem.posY > (row-1))) {
						valid.push(elem);
					}
				});
				return valid;
			};

		} // end PF
} // end module

