
var mongoose = require('mongoose');

// Execution phases

var executionSchema = mongoose.Schema({

    gameId: String,
    pathType: String,
    pfTime: Number,
    roundTime: Number,

    exs: [{
        date: Date,
        roundNum: Number,

        memoSnap: String,
        agentPos: String,
        adverPos: String,

        response: String,
        respTime: Number,
        success: Boolean
    }]
});

executionSchema.methods.updateExec = function(_exec) {
    console.log('--------------Updating Exec DB--------------');
    console.log('agentPos',_exec.agentPos);
    
	this.exs.push({
        date: _exec.date,
        roundNum: _exec.roundNum,

        memoSnap: JSON.stringify(_exec.memoSnap),
        agentPos: JSON.stringify(_exec.agentPos),
        adverPos: JSON.stringify(_exec.adverPos),

        response: _exec.response,
        respTime: _exec.respTime,
        success: _exec.success
    });
    this.save();
}

var Execution = mongoose.model('Execution', executionSchema);
module.exports = Execution;
