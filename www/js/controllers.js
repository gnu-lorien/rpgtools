angular.module('starter.controllers', [])

.controller('RollsCtrl', ['$scope', '$stateParams', 'Rolls', '$ionicModal',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, Rolls, $ionicModal) {
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

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
