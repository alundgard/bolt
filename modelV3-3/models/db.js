
var mongoose = require('mongoose');

var roundSchema = mongoose.Schema({

    roundNum: Number,
    roundID: Number,
    roundSuccess: Boolean,

    // Save current memo state at start of round
    memoStart: [{ 
        objID: [{type: Number}]
    }],

    // Save current agent pos at start of round
    agentStart: {
        posX: Number,
        posY: Number
    },

    // Save adver positions during execution
    adverEnd: [{type: String}],

    // Save pfs collected during round
    pfs: [{
        date: Date,
        agentPos: {
            posX: Number,
            posY: Number
        },
        adverPos: [{type: String}],
        success: Boolean,
        response: String,
        respTime: Number,
    }]
});


/*
var subjectSchema = mongoose.Schema({
	mturkId: String,
	clientId: String,
    phaseType: String,
	pathType: String,
	pfTime: Number,
	roundTime: Number,
    pfs:[{
    	roundNum: Number,
    	date: Date,
        agentPos: {
            posX: Number,
            posY: Number
        },
        adverPos: [{type: String}],
        success: Boolean,
        response: String,
        respTime: Number,
	}]
});

subjectSchema.methods.updateSubj = function(_action) {
    console.log('--------------Updating Subject DB--------------');

	var action = JSON.parse(_action);
 	var state_before = action.state_before;
	var state_after = action.state_after;
	var response = action.response;
	var respTime = action.respTime;
	var success = action.success;

	this.pfs.push({
		roundNum: state_before.round.round_num,
    	date: Date.now(),
        agentPos: {
            posX: state_before.player.posX,
            posY: state_before.player.posY
        },
        adverPos: state_before.enemy.positions,
        success: success,
        response: response,
        respTime: respTime
	});

    this.save();
}

subjectSchema.statics.findWorker = function(mturkId, callback) {
    // Search by mturkId
    this.find({ 'mturkId': mturkId }, function(err, worker) {
        callback(worker);
    });

}

var Subject = mongoose.model('Subject', subjectSchema);
module.exports = Subject;

*/