angular.module('starter.controllers', [])

.controller('RollsCtrl', ['$scope', '$stateParams', 'Rolls', '$ionicModal', 'Status', 'Position', '$sce', '$templateRequest',
// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, Rolls, $ionicModal, Status, Position, $sce, $templateRequest) {
  $scope.rolls = Rolls.rolls;
  $scope.roll = {};

  $scope.addNewRoll = function(roll) {
    Rolls.addNewRoll(roll);
    $scope.modal.hide();
  };

  $scope.rerollFailures = function(roll) {
    Rolls.rerollFailures(roll);
  };

  $scope.rollAgain = function(roll) {
    var newRoll = _.defaults({}, roll);
    Rolls.addNewRoll(newRoll);
  };

  $scope.newTemplateFromRoll = function(roll) {
    var newRoll = _.defaults({}, roll);
    _.assign($scope.roll, newRoll);
    $scope.modal.show();
  };

  $ionicModal.fromTemplateUrl("templates/new-roll.html", {
    scope: $scope,
    roll: $scope.roll
  }).then(function(modal) {
    $scope.modal = modal;
  })
}])

.controller('DashCtrl', function($scope) {})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.results = {
    chats: Chats.all()
  };
  $scope.fuse = new Fuse(Chats.all(), {
    shouldSort: false,
    keys: ["name", "lastText"]
  });
  $scope.searchopts = {
    needle: ""
  };

  $scope.clearNeedle = function() {
    $scope.searchopts.needle = "";
  };

  $scope.$watch('searchopts.needle', function(nval, oval) {
    if ("" == nval) {
      $scope.results.chats = Chats.all();
    } else if (nval != oval) {
      console.log(nval);
      $scope.results.chats = $scope.fuse.search(nval);
    }
  });

  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('StatusTraitsCtrl', function($scope, Status) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.results = {
    statustraits: Status.all()
  };
  $scope.fuse = new Fuse(Status.all(), {
    shouldSort: true,
    keys: ["name", "type"]
  });
  $scope.searchopts = {
    needle: ""
  };

  $scope.clearNeedle = function() {
    $scope.searchopts.needle = "";
  };

  $scope.$watch('searchopts.needle', function(nval, oval) {
    if ("" == nval) {
      $scope.results.statustraits = Status.all();
    } else if (nval != oval) {
      console.log(nval);
      $scope.results.statustraits = $scope.fuse.search(nval);
    }
  });

  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('StatusTraitCtrl', function($scope, $stateParams, Status) {
  $scope.status = Status.get($stateParams.id);
})

.controller('PositionsCtrl', function($scope, Position) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {Posiaoeuth

  $scope.results = {
    statustraits: Position.all()
  };
  $scope.fuse = new Fuse(Position.all(), {
    shouldSort: true,
    keys: ["name", "type", "abiding", "abiding_absent", "abiding_choose_one"]
  });
  $scope.searchopts = {
    needle: ""
  };

  $scope.clearNeedle = function() {
    $scope.searchopts.needle = "";
  };

  $scope.$watch('searchopts.needle', function(nval, oval) {
    if ("" == nval) {
      $scope.results.positions = Position.all();
    } else if (nval != oval) {
      console.log(nval);
      $scope.results.positions = $scope.fuse.search(nval);
    }
  });

  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('PositionCtrl', function($scope, $stateParams, Position, $sce, $templateRequest) {
  $scope.position = Position.get($stateParams.id);
  $scope.positionpage = "";

  var templateUrl = $sce.getTrustedResourceUrl("/positions/" + $scope.position.name + '.html');

  $templateRequest(templateUrl).then(function (template) {
    $scope.positionpage = template;
  }, function(error) {
    console.log(JSON.stringify(error));
  })
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
