var request = require('request');
var config = require('./config.js').FitBit;
var querystring = require('querystring');
var readline = require('readline');
var OAuth2 = require('oauth').OAuth2;

var fitbit = new OAuth2(
		config.clientid,
		config.secret,
		"https://api.fitbit.com/",
		null,
		"oauth2/token",
		null
);

var authToken = new Buffer(config.clientid+":"+config.secret).toString('base64');
var accessToken, refreshToken, userId;

module.exports = {
	Login: function(cb) {

		console.log("Visit https://www.fitbit.com/oauth2/authorize?response_type=code&client_id="+config.clientid+"&scope=nutrition");

		rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});

		rl.question('Code? ', (answer) => {
		 
		 	var code = answer;
		 	rl.close();

		 	fitbit.setAuthMethod("Basic");
			fitbit.getOAuthAccessToken(authToken, code, {'grant_type':'authorization_code'}, function(err, access_token, refresh_token, res) {

				if(err)
					return cb(err);

				accessToken = access_token;
				refreshToken = refresh_token;
				userId = res.user_id;

				cb(null);
			});
			
		});
	},

	Refresh: function(cb) {
		fitbit.getOAuthAccessToken(authToken, refreshToken, {'grant_type':'refresh_token'}, function(err, access_token, refresh_token, res) {

				if(err)
					return cb(err);

				accessToken = access_token;
				refreshToken = refresh_token;
				userId = res.user_id;

				cb(null);
		});
	},

	LogFood: function(foodName, amount, mealTypeId, date, calories, nutrition, cb) {
		var data = {
			date: date,
			foodName: foodName,
			mealTypeId: mealTypeId,
			unitId: 1,
			amount: amount,
			calories: calories,
		};
		for(var key in nutrition) {
			data[key] = nutrition[key];
		}

		fitbit._request('POST', "https://api.fitbit.com/1/user/"+userId+"/foods/log.json", {"Authorization": "Bearer " + accessToken, "Content-Type": "application/x-www-form-urlencoded"}, querystring.stringify(data), accessToken, function(err, res){
			return cb(err);
		});
	}
}