
module.exports = {

	majorityRules: function (responses) {
		if (responses.length == 0) {
			var random = 32;
			return random;
		}
		else if (responses.length == 1) {
			return responses[0];
		}
		else {
			var mf = 1;
			var m = 0;
			var item = null;
			for (var i=0; i<responses.length; i++) {
				for (var j=i; j<responses.length; j++) {
					if (responses[i] == responses[j]) m++;
					if (mf<m) {
						mf=m;  
						item = responses[i];
					}
				}
				m = 0;
			}
		}
		if (item == null && responses.length > 0) {
			var rand = Math.floor(Math.random() * responses.length);
			item = responses[rand];
		}
		console.log('========MAJORITY RULES RESPONSES==========', item);
		return item;
	},

	//Returns a random response out of four choices
	randomResponse: function (responses) {
		var rand = Math.floor(Math.random() * responses.length);
		return responses[rand];
	}

}