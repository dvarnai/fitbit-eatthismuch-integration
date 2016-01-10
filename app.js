var config = require('./config.js');
var EatThisMuch = require('./EatThisMuch');
var FitBit = require('./FitBit');

var Tracked = {};

function LogFoods(cb) {
	var Today = new Date();
	Today = Today.getFullYear()+"-"+(Today.getMonth()+1)+"-"+Today.getDate();
	if(typeof Tracked[Today] == 'undefined')
		Tracked[Today] = {};

	EatThisMuch.GetTodayMeals(function(err, meals){
		if(err)
			return console.log(err);

		for(var i = 0; i < meals.length; ++i) {
			var eaten = meals[i].eaten;
			for(var a = 0; a < meals[i].foods.length; ++a) {
				var food = meals[i].foods[a];
				var amount = food.amount;
				var name = food.food.food_name;
				var calories = Math.round(food.food.serving_calories*amount);

				var nutrition = {totalFat: food.food.serving_fats*amount,
								totalCarbohydrate: food.food.serving_carbs*amount,
								protein: food.food.serving_proteins*amount
				};

				if(eaten && !Tracked[Today][i]) {

					FitBit.LogFood(name, amount, i+1, Today, calories, nutrition, function(idx, err){
						if(err)
							return console.log(err);
						Tracked[Today][idx] = true;
					}.bind(null, i));
				}
			}
		}

		cb(null);
	});
}

// Login to ETM
EatThisMuch.Login(function(err){
	if(err)
		return console.log(err);

	console.log("Logged in to EatThisMuch");

	// Login to FitBit
	FitBit.Login(function(err) {
		if(err)
			return console.log(err);

		console.log("Logged in to FitBit");

		setInterval(function(){

			FitBit.Refresh(function(){
				LogFoods(function(err){
					if(err)
						return console.log(err);
				});
			});
			
		}, 10*1000);
	});
});
