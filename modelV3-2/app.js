
/*==============================================================================
	Modules
*/
// Theirs
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var path = require('path');
var bodyParser = require('body-parser');
var session = require('express-session');
mongoose.connect('mongodb://127.0.0.1/LDv3-2-4bolts'); // Connect DB
var http = require('http').createServer(app).listen(6200);
var io = require('socket.io')(http);

// Ours
var db = require('./models/db.js');
var params = require('./models/params.js');
var future = require('./private/future.js');
var debug = require('./private/debug.js');
var subject = require('./private/subject.js');

/*==============================================================================
	Globals
*/
GAMES = {};

/*==============================================================================
	Setup
*/
app.use(express.static(path.join(__dirname,'public'))) // Set static path

app.set('view engine', 'ejs'); // Setup view engine
app.set('views', path.join(__dirname,'views'));

app.use(bodyParser.json()); // Body parser middleware
app.use(bodyParser.urlencoded({extend:false}));

/*==============================================================================
	Routes
*/
var express = require('express');
var router = express.Router();

var index = require('./controllers/index.js')(router);
app.use('/', index);

var login = require('./controllers/login.js')(router);
app.use('/login', login);

var hit = require('./controllers/hit.js')(router);
app.use('/hit', hit);

var worker = require('./controllers/worker.js')(router);
app.use('/worker', worker);

/*==============================================================================
	Io
*/
io.on('connection', function(socket) {
	console.log('-----A worker connected');

	/*--------------------------------------------------------------------------
	hitAccepted
		Received when mturk worker accepts HIT
	*/
	socket.on('hitAccepted', function(window_href) {
		console.log('Received hitAccepted.');

		// Find least params, construct redirect url
		params.findLeast(function(doc) {
			var round_t = doc.roundTime;
			var pf_t = doc.roundTime;
			var path_t = doc.pathType;
			var phase_t = 'train';

			var url_dest = window_href.replace('/hit?', '/worker?'); // Change to worker route
			url_dest = url_dest
					+'&roundTime='+round_t
					+'&pfTime='+pf_t
					+'&pathType='+path_t
					+'&phaseType='+phase_t
					+'&roundMax=20';

			socket.emit('redirectWorker', url_dest);
		});
	});

/*
		// Check if worker has done the task before
		db.findWorker(mturkId, function(worker) {

			// If yes, prevent the worker from doing it again
			if (worker.length > 0) {
				console.log('Worker id found in db')
				socket.emit('hideTask');
			}
			// If no worker found, show worker the task
			else {

				console.log('Received hitAccepted.');
				// Find least params, construct redirect url
				params.findLeast(function(doc) {
					var round_t = doc.roundTime;
					var pf_t = doc.roundTime;
					var path_t = doc.pathType;
					var phase_t = 'train';

					var url_dest = window_href.replace('/hit?', '/worker?'); // Change to worker route
					url_dest = url_dest
							+'&roundTime='+round_t
							+'&pfTime='+pf_t
							+'&pathType='+path_t
							+'&phaseType='+phase_t
							+'&roundMax=20';

					socket.emit('redirectWorker', url_dest);
				});
			}
		});
*/

	/*--------------------------------------------------------------------------
	registerWorker
		Received when client arrives to localhost:3000/
	*/
	socket.on('registerWorker', function(dat) {
		console.log('Received registerWorker.',dat);
		var dat = JSON.parse(dat);

		// SUBJ: function(_io,_clientId,_mturkId,_phaseType,_pathType,_pfTime,_roundTime)
		GAMES[socket.id] = new subject.SUBJ(
			io, 
			socket.id, 
			dat.mturkId,
			dat.phaseType,
			dat.pathType, 
			dat.pfTime, 
			dat.roundTime);
	});

	/*--------------------------------------------------------------------------
	queryGame
		Received when client arrives to localhost:3000/game
		Checks if game in progress. If not, request to start
	*/
	socket.on('queryGame', function(resp) {
		console.log('Received queryGame.')

		// TODO
		console.log('resp',resp);
		console.log('socket.id', socket.id);

		// Check if game exists
		if (GAMES[socket.id].GAME_EXISTS) {
			// show game
			socket.emit('showGame', JSON.stringify(GAMES[socket.id].GAME_STATE)); // Pass game state
		}
		else {
			// ask to make one
			socket.emit('showGame', "NO_GAME_EXISTS"); // No game exists
		}
	});

	/*--------------------------------------------------------------------------
	startPF
		Received when client starts game at localhost:3000/game
		Client sends json string of initial game state
		resp == JSON.stringify(window.game)
	*/
	socket.on('startRound', function(resp) {
		console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
		console.log('%                           START ROUND                           %');
		console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');

		console.log('=============Received startRound============');
		var gameState = JSON.parse(resp);

		// Save player position at startRound
		GAMES[socket.id].POSSIBLE_FUTURES.roundStartPos(
				gameState.player.posX,
				gameState.player.posY
		);

		console.log('================Init futures================');
		// Update SUBJ object
		GAMES[socket.id].GAME_EXISTS = true;
		GAMES[socket.id].GAME_STATE = gameState;

		console.log('================Send future================');
		GAMES[socket.id].POSSIBLE_FUTURES.sendFuture(_newRound=true);
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
		// console.log('worker action', action.response);

     	// Save to db
     	GAMES[socket.id].DB.updateSubj(action);

     	// Update current GAME_STATE to state resulting from action
     	GAMES[socket.id].GAME_STATE = JSON.parse(action).state_after;

     	console.log('==========Sending Another Future==========');
     	// Send another future
		GAMES[socket.id].POSSIBLE_FUTURES.sendFuture(_newRound=false);
	});

	/*--------------------------------------------------------------------------
	taskComplete
		When worker completes the task on the client side,
 		server disconnects the client socket
 	*/	
 	socket.on('taskComplete', function() {
 		console.log('Received taskCompleted');
 		io.sockets.connected[socket.id].disconnect();
	});


	/*--------------------------------------------------------------------------
	disconnect
		Received when worker closes window (disconnects)
	*/	
	socket.on('disconnect', function(){
		console.log('Worker disconnected');
 	});

});
