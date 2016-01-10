var request = require('request');
var querystring = require('querystring');
var config = require('./config.js').EatThisMuch;
var cookieJar = request.jar();

function apiRequest(interface, version, data, cb) {
	request.get({url: 'https://www.eatthismuch.com/api/v' + version + '/' + interface + '/?' + querystring.stringify(data), jar: cookieJar}, function(err, data){
		cb(err, JSON.parse(data.body));
	});
}

module.exports = {
	Login: function(cb) {

		request.get({url: 'https://www.eatthismuch.com/user/login/', jar: cookieJar}, function(err, data){
			if(err)
				return cb(err);

			var post = {
						csrfmiddlewaretoken: data.body.match(/name\=\'csrfmiddlewaretoken\' value\=\'(.+?)\'/)[1],
						username: config.username,
						password: config.password,
						next: ""
			};

			// Set up the request
			request.post({url: 'https://www.eatthismuch.com/user/login/', jar: cookieJar, form: post}, function(err, data){
				if(err)
					return cb(err);

				// Check if we are logged in successfully
				apiRequest('nutritionprofile', 1, {}, function(err, data){
					if(err)
						return cb(err);

					if(data == "")
						return cb("Failed to log in");

					cb(null);
				});
			});
		});
	},

	GetTodayMeals: function(cb){
		var Today = new Date();
		apiRequest('calendar', 1, {date__in: Today.getFullYear()+"-"+(Today.getMonth()+1)+"-"+Today.getDate()}, function(err, data){
			if(err)
				return cb(err);

			if(data == "")
				return cb("Not logged in");

			return cb(null, data["objects"][0].diet.meals);
		});
	}
}