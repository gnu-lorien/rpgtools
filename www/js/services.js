angular.module('starter.services', [])

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'img/ben.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'img/max.png'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'img/adam.jpg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'img/perry.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'img/mike.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
})

.service('Rolls', function() {
    var self = this;
    self.rolls = [];

    self.all = function () {
        var rolls = window.localStorage['rolls'];
        if (rolls) {
            return angular.fromJson(rolls);
        }
        return [];
    };

    self.save = function (rolls) {
        window.localStorage['rolls'] = angular.toJson(rolls);
    };

    self.rollDie = function () {
        return 1 + Math.floor(Math.random() * 6);
    };

    self.rollDice = function (number) {
        return _(number)
            .range()
            .map(function (i) {
                return self.rollDie();
            })
            .value();
    };

    self.evaluateResult = function(roll) {
        roll.hits = _.filter(roll.result, function (r) {
            return r >= 5;
        });
        roll.glitches = _.filter(roll.result, function (r) {
            return r == 1;
        })
        roll.half = _.floor(roll.result.length / 2);
        roll.is_glitch = roll.glitches.length > roll.half;
        roll.is_critical_glitch = roll.is_glitch && roll.hits.length == 0;
        if (roll.hits.length > 10) {
            roll.difficulty = "a greater than extreme";
        } else if (roll.hits.length >= 8) {
            roll.difficulty = "an extreme";
        } else if (roll.hits.length >= 6) {
            roll.difficulty = "a very hard";
        } else if (roll.hits.length >= 4) {
            roll.difficulty = "a hrd";
        } else if (roll.hits.length >= 2) {
            roll.difficulty = "an average";
        } else if (roll.hits.length >= 1) {
            roll.difficulty = "an easy";
        }
        roll.dice_message = _.join(roll.result, ", ");
        if (roll.is_critical_glitch) {
            roll.message = "CRITICAL GLITCH";
        } else {
            roll.message = "" + roll.hits.length + " hits on " + roll.final_number + " dice";
            if (roll.difficulty) {
                roll.message += " beating " + roll.difficulty + " threshold"
            } else {
                roll.message += " resulting in failure"
            }
            if (roll.is_glitch) {
                roll.message = "Glitched with " + roll.message;
            }
        }
    };

    self.rerollFailures = function(roll) {
        roll.rerolledFailures = true;
        var failures = _.remove(roll.result, function (r) {
            return r < 5;
        });
        failures = self.rollDice(failures.length);
        roll.debug.push(_.map(failures));

        var next = _.concat([], failures);
        do {
            var sixes = _.filter(next, function (r) {
                return r == 6;
            });
            next = self.rollDice(sixes.length);
            failures = _.concat(failures, next);
            roll.debug.push(next);
        } while (next.length != 0);
        roll.result = _.concat(roll.result, failures);

        self.evaluateResult(roll);
        roll.message = "Rerolled to get " + roll.message;
    };

    self.addNewRoll = function(inputroll) {
        var roll = _.defaults({}, inputroll, {
            number: "6",
            reroll: false,
            description: "Default",
            id: _.uniqueId("rolls_")
        });
        roll.final_number = math.eval(roll.number);
        roll.result = self.rollDice(roll.final_number);
        roll.debug = [_.map(roll.result)];
        if (roll.reroll) {
            var next = _.concat([], roll.result);
            do {
                var sixes = _.filter(next, function (r) {
                    return r == 6;
                });
                next = self.rollDice(sixes.length);
                roll.result = _.concat(roll.result, next);
                roll.debug.push(next);
            } while (next.length != 0);
        }
        self.evaluateResult(roll);
        self.rolls.push(roll);
        return roll;
    }
});
