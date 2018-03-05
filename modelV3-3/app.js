
/*==============================================================================
	Modules
==============================================================================*/
// Theirs
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var path = require('path');
var bodyParser = require('body-parser');
var session = require('express-session');
mongoose.connect('mongodb://127.0.0.1/LDv3-3-4bolts'); // Connect DB
var http = require('http').createServer(app).listen(6200);
var io = require('socket.io')(http);

// Ours
var db = require('./models/db.js');
var params = require('./models/params.js');

var future = require('./private/future.js');
var debug = require('./private/debug.js');
var subject = require('./private/subject.js');
var round = require('./private/round.js');


/*==============================================================================
	Setup
==============================================================================*/
app.use(express.static(path.join(__dirname,'public'))) // Set static path

app.set('view engine', 'ejs'); // Setup view engine
app.set('views', path.join(__dirname,'views'));

app.use(bodyParser.json()); // Body parser middleware
app.use(bodyParser.urlencoded({extend:false}));


/*==============================================================================
	Routes
==============================================================================*/
var express = require('express');
var router = express.Router();

var index = require('./controllers/index.js')(router);
app.use('/', index);

var login = require('./controllers/login.js')(router);
app.use('/login', login);

var hit = require('./controllers/hit.js')(router);
app.use('/hit', hit);

var instr = require('./controllers/instr.js')(router);
app.use('/instr', instr);

var wait = require('./controllers/wait.js')(router);
app.use('/wait', wait);

var train = require('./controllers/train.js')(router);
app.use('/train', train);

var test = require('./controllers/test.js')(router);
app.use('/test', test);


/*==============================================================================
	Globals
==============================================================================*/

ROUND = {};
SUBJECTS = {}
MIN_NUM_CLIENTS = 1;

/*==============================================================================
	Helper / Debugging
==============================================================================*/

// Print list of currently connected clients to console
function getCurrentClients() {
	var room = io.sockets.adapter.rooms['subjects'];
	if (room != undefined) { // If room exists already, get its clients
		return Object.keys(room.sockets);
	}
	return [];
};

// Print list of currently connected clients to console
function printCurrentWorkers() {
	var room = io.sockets.adapter.rooms['subjects'];
	if (room != undefined) { // If room exists already, get its clients
		var clients = Object.keys(room.sockets); var mturkIds = [];
		clients.forEach( function(clientId) {
			mturkIds.push(SUBJECTS[clientId].mturkId);
		});
		console.log('====================================================');
		console.log('Currently connected mturk workers:\n', mturkIds);
		console.log('====================================================');
	}
};

// Creates a random string for identifying game instances in db
function makeGameId() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 15; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
};

// Fix JS mod negative behavior
Number.prototype.mod = function(n) {
    return ((this%n)+n)%n;
};

/*==============================================================================
	Game Logic
==============================================================================*/

// Wait for MIN_NUM_CLIENTS to arrive, then start ROUND
var waiting4Clients = setInterval(function() {
	var num_clients = getCurrentClients().length;
	console.log('...waiting...');
	if (num_clients >= MIN_NUM_CLIENTS) {

		console.log('Number clients connected: ',num_clients);

		console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
		console.log('%                                                  %');
		console.log('%             LET THE GAMES BEGIN!                 %');
		console.log('%                                                  %');
		console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');

		clearInterval(waiting4Clients);

		var gameId = makeGameId();
		var pathType = 'random';
		var phaseType = 'test';
		var pfTime = 2000;
		var roundTime = 2000;
		var roundMax = 20;

		var N = 2; // Num time steps to look ahead
		var A = 4; // Num acts to execute per round
		var G = 4; // Grid dimension
		var B = 4; // Num lightning bolts

		DAT = {'gameId':gameId,
				'phaseType':pathType,
				'pathType':pathType,
				'pfTime':pfTime,
				'roundTime':roundTime,
				'roundMax':roundMax,
				'N':N,
				'A':A,
				'G':G,
				'B':B
				};

		// Start initial client-side countdown, init ROUND
		io.sockets.in('subjects').emit('startCountdown',JSON.stringify(DAT));

		console.log('GAME ID: ',gameId);

		ROUND = new round.Round_Loop(io, DAT);
		setTimeout(function() {
			ROUND.startRound();
		}, 5000);
	}
}, 1000);


/*==============================================================================
	Io
==============================================================================*/
io.on('connection', function(socket) {
	console.log('-----A worker connected');

	/*--------------------------------------------------------------------------
	registerWorker
		Received when client arrives to localhost:3000/
	*/
	socket.on('registerWorker', function(_mturkId) {
		console.log('Received registerWorker.',_mturkId);

		// Add subject information to db collection 'subjects'
		SUBJECTS[socket.id] = new subject.SUBJ(
			io,
			socket.id, 
			_mturkId);

		// Add clientId to the socket.io room 'subjects'
		socket.join('subjects');

		printCurrentWorkers();

	});

	/*--------------------------------------------------------------------------
	workerResponse
		Adds worker response to DODGER_RESPONSES or CASTER_RESPONSES depending
		action = {
			state_before: Game state before action,
			state_after: Game state after action
			response: Key press
			success: Boolean
		}
	*/
	socket.on('workerResponse', function(action) {
     	console.log('==========Worker Response Received==========');
		
		var action = JSON.parse(action);
		action.mturkId = SUBJECTS[socket.id].mturkId;

		// Saving response to DB
		ROUND.DB_preds.updatePred(action);

		// Memoize response to memo
		if (action.response != null) {
			if (ROUND.possible_futures.memo[action.crossHash] != undefined) {
				ROUND.possible_futures.memo[action.crossHash].push({
					response:action.response,
					mturkID:action.mturkId,
					respTime:action.respTime,
					success:action.success
					});
			} else {
				console.log('%\n%\n%\n%\n%\n%\n%\n%\n%\n%\n%\n%\n%\n%\n%\n');
				console.log('%\n%\n%\n%\n%\n%\n%\n%\n%\n%\n%\n%\n%\n%\n%\n');
				console.log('%\n%\n%\n%\n%\n%\n%\n%\n%\n%\n%\n%\n%\n%\n%\n');
			}
		}

		// Send another pf
		var t = {
			posX: action.state_after.player.posX,
			posY: action.state_after.player.posY
		};

		var upper = ROUND.G;
		debug.assert((t.posX >= 0 && t.posX < ROUND.G), "Agent posX out of bounds: "+t.posX);
		debug.assert((t.posY >= 0 && t.posX < ROUND.G), "Agent posY out of bounds: "+t.posY);

		ROUND.possible_futures.sendFuture(socket.id, t);
	});

	/*--------------------------------------------------------------------------
	disconnect
		Received when worker closes window (disconnects)
	*/	
	socket.on('disconnect', function(){
		console.log('Worker disconnected!');
		printCurrentWorkers();
 	});

});

/*==============================================================================
==============================================================================*/
/*==============================================================================
==============================================================================*/
/*==============================================================================
==============================================================================*/

