/*******************************************************************************/
/*******************************************************************************/
/*******************************************************************************/
/********                                                               ********/
/********                                                               ********/
/********                                                               ********/
/********                    SERVER-SIDE PF OBJECT                      ********/
/********                                                               ********/
/********                                                               ********/
/********                                                               ********/
/*******************************************************************************/
/*******************************************************************************/
/*******************************************************************************/

var debug = require('./debug.js');
var hash = require('object-hash');

module.exports = {

	/*--------------------------------------------------------------------------
	PF Object
		The PF object sends pfs to worker depending on pathType
		It calls the functions in predict.js to generate the pfs
	*/
	PF: function(_pathType, _io, _n, _g, _b) {
			this.io = _io;
			this.pathType = _pathType;

			this.n = _n; // num lookahead steps
			this.g = _g; // gxg map dimention
			this.b = _b; // num lightning bolts

			this.agent_pos = { posX: 1, posY: 1 };

			// this.visited = {};
			// this.startpos = { posX: null, posY: null };
			
			this.iter = 0; // Iterator for returning next cross position
			this.cross = []; // Array of cross positions [{cX:0,cY:0},...]
			this.memo = {}; // Object of hashed cross position responses

			var _this = this;


	/*==========================================================================
		Game logic functions
	===========================================================================*/

			// Send all workers a pf at round start
			this.send1stFuture = function() {
				console.log('Calling send1stFuture.');

				var clients = this.getCurrentClients();
				clients.forEach(function(clientId) {
					_this.sendFuture(clientId, _this.agent_pos);
				});
			};

			// Send one future to the worker
			this.sendFuture = function(_clientId, _agent_pos) {
				console.log('Calling sendFuture.');

				// Send pf game snapshot
				console.log('Sending to: '+SUBJECTS[_clientId].mturkId);
				var pf = _this.getNextFuture(_agent_pos); // Get next possible future										
				this.io.sockets.connected[_clientId].emit('gameSnapshot', JSON.stringify(pf));
			};

			// Gets next future depending on time step traversal
			this.getNextFuture = function(_agent_pos) {
				console.log('Calling getNextFuture.');
				console.log('this.iter',_this.iter);

				// Get next cross configuration
				var cross_pos = this.cross[this.iter];
				var cross_hash = hash(cross_pos);

				// Update iter for next pf
				this.incrementIter();

				// Get array of adver positions
				var adver_pos = this.transformCoords(_agent_pos,cross_pos);

				// Return game object based on adver configuration
				return this.zipGameObj(_agent_pos, adver_pos, cross_hash);
			};

			// Takes current player position in game object
			this.zipGameObj = function(_agent, _adver, _cross_hash) {
				var adver_strs = [];
				_adver.forEach(function(pos) {
					adver_strs.push(_this.pos2Str(pos.posX, pos.posY));
				});

				// Fill in dummy adversary positions
				adver_strs = this.fillAdversary(adver_strs);

				return {
					'agent_posX':_agent.posX,
					'agent_posY':_agent.posY,
					'adver_positions':adver_strs,
					'cross_hash':_cross_hash
				}
			};


	/*==========================================================================
		Pf Functions
	===========================================================================*/

			// Generate all combos of bolt positions within the 5-cell cross
			// Use obj-hash to index into MEMO object (save worker responses there)

			// {cX:x, cY:y}

			this.powerSetOf = function(arr) {
				console.log('Calling powerSetOf.');
				var item, ret = [[]], max = arr.length - 1;
				function fn(arrPrefix, start) {
					for(; ret.push(item = arrPrefix.concat([arr[start]])) && start < max;) {
						fn(item, ++start);
					}
				}
				if(max + 1) {
					fn([], 0);
				}
				return ret;
			};

			this.generateCombos = function() {
				console.log('Calling generateCombos.');
				var cross = [{cX:0,cY:0},
						{cX:0,cY:1},
						{cX:0,cY:-1},
						{cX:1,cY:0},
						{cX:-1,cY:0}];
				// console.log('cross',cross);
				var combos = this.powerSetOf(cross);
				for(idx = 0; idx < combos.length; idx++) {
					if (combos[idx].length == 5) {
						combos.splice(idx, 1);
					}
				}
				return combos;
			};

			this.incrementIter = function() {
				console.log('Incrementing iter.')
				this.iter = (this.iter+1) % this.cross.length;
			}

			this.initCross = function() {
				console.log('Initializing cross.')
				this.cross = this.generateCombos();
				debug.assert(this.cross != undefined, "this.cross undefined!");
				debug.assert(this.cross.length != 0, "this.cross.length = 0!");
			}

			this.initMemo = function() {
				if (this.cross.length != 0) {
					this.cross.forEach(function(c) {
						var key = hash(c);
						console.log(key + ':' + JSON.stringify(c) + ',');
						_this.memo[key] = [];
					});
				}
			};

			// Takes current agent position {posX:?, poxY:?}
			// Takes current adver positions [{cX:?,cY:?},...]
			// Returns array of adver positions superimposed
			this.transformCoords = function(_agentPos,_adverPos) {
				var xform = [];
				_adverPos.forEach( function(adver) {
					xform.push({
						'posX': ((_agentPos.posX + adver.cX).mod(_this.g)),
						'posY': ((_agentPos.posY + adver.cY).mod(_this.g))
					});
				});
				return xform;
			};

			// Takes X adversary positions within the 5-cell cross
			// Fills in (B-X) adversary at random positions
			this.fillAdversary = function(_adver_pos) {
				console.log('Calling fillAdversary',_adver_pos.length);
				var arr = _adver_pos;
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


	/*==========================================================================
		Helper functions
	===========================================================================*/

			this.getCurrentClients = function() {
				var room = _this.io.sockets.adapter.rooms['subjects'];
				if (room != undefined) { // If room exists already, get its clients
					return Object.keys(room.sockets);
				}
				return [];
			};


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


/*==============================================================================
==============================================================================*/
/*==============================================================================
==============================================================================*/

