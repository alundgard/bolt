
var mongoose = require('mongoose');

// Prediction phases

var predictionSchema = mongoose.Schema({

    gameId: String,
    pathType: String,
    pfTime: Number,
    roundTime: Number,

    pfs: [{
        date: Date,
        mturkId: String,
        roundNum: Number,

        response: String,
        respTime: Number,
        success: Boolean,

        agentPos: {
            posX: Number,
            posY: Number
        },
        adverPos: String

    }]
});

predictionSchema.methods.updatePred = function(_action) {
    console.log('--------------Updating Preds DB--------------');

    var state_before = _action.state_before;
    var state_after = _action.state_after;
    var response = _action.response;
    var respTime = _action.respTime;
    var success = _action.success;
    var mturkId = _action.mturkId;

    this.pfs.push({
        date: Date.now(),
        mturkId: mturkId,
        roundNum: state_before.round.round_num,

        response: response,
        respTime: respTime,
        success: success,

        agentPos: {
            posX: state_before.player.posX,
            posY: state_before.player.posY
        },
        adverPos: JSON.stringify(state_before.enemy.positions)
    });
    this.save();
}

var Prediction = mongoose.model('Prediction', predictionSchema);
module.exports = Prediction;
