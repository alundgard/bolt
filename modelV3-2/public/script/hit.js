
$(document).ready(function() {
	console.log('hit.js');
	 
	/*=================================================================*/
	// Redirect if HIT accepted 

	var mturk = gup('workerId');
  	var aid = gup("assignmentId");

  	// if assigntmentId is a URL parameter
  	if(aid == "" || aid == "ASSIGNMENT_ID_NOT_AVAILABLE") {			
		
		console.log('HIT NOT accepted.');
		$('#mturk-accepted').hide();
		$('#mturk-not-accepted').show();
	}
	else {
	    console.log('HIT accepted.');
	    $('#mturk-accepted').show();
	    $('#mturk-not-accepted').hide();

		SOCKET = io();

		/*------------------------------------------------------------------
		hitAccepted
			Sent to server when worker accepts hit
		*/
		SOCKET.emit('hitAccepted', window.location.href);

		/*------------------------------------------------------------------
		redirectWorker
			Received when server acks worker accept HIT
		*/
		SOCKET.on('redirectWorker', function(destination) {
			console.log('Received redirectWorker.');
			console.log('Redirecting to: ', destination);
			window.location.href = destination;
		});

		/*------------------------------------------------------------------
		hideTask
			Received when server finds the worker in db
		*/
		SOCKET.on('hideTask', function(destination) {
			console.log('Received hideTask.');
			console.log('You have already completed the task once, please return the HIT, thank you.')
			$('#hideTask').show();
		});
    }
});

