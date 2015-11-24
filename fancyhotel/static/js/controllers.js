var registerModule = angular.module('registerModule', ['ngResource']);

registerModule.factory('authFactory', function($resource){
	return $resource('/api', {}, {
		Register: {
			method: 'POST',
			url: '/api/register'
		},
		Login: {
			method: 'POST',
			url: '/api/login'
		}
	})
})



angular.module('FancyHotelApp', ['ngRoute', 'ngResource', 'registerModule'])


.controller('registerController', function($scope, authFactory) {

	$scope.submit = function() {
		response = authFactory.Register({
			"username": $scope.username,
			"email": $scope.email,
			"password": $scope.password,
			"firstName": $scope.firstName,
			"lastName": $scope.lastName

		});

		//deal with promise response.$promise.then

	}
	
})

.controller('loginController', function($rootScope, $scope, authFactory, $window){
	$scope.submit = function(){
		response = authFactory.Login({
			"username": $scope.username,
			"password": $scope.password
		});

		response.$promise.then(function(data){
			if(data["result"] == true){
				$rootScope.currentUser = $scope.username;
				console.log("login success!");
				console.log("redirecting...");
				$window.location.href='#/portal';

			}
			else{
				console.log("login failed");
			//do something else, they failed to log in.
			}
		});
	}

})



.config(function($routeProvider) { //routing needs to be on a server in order to run
	$routeProvider
	.when('/',{
		templateUrl: 'static/views/login.html',
	})
	.when('/login', {
		templateUrl: 'static/views/login.html',
		controller: 'loginController'
	})
	.when('/register', {
		templateUrl: 'static/views/registerUser.html',
		controller: 'registerController'
	})
	.when('/portal', { //the page that the user can pick their task on
		templateUrl: 'static/views/selectionPage.html'//,
		/*controller: 'contentController'*/
	})
	.when('/searchroom', {
		templateUrl: 'static/views/searchRoom.html'//,
		/*controller: 'contentController'*/
	})
	.when('/reserve', {
		templateUrl: 'static/views/makeReservation.html'//,
		/*controller: 'contentController'*/
	})
	.when('/payment', {
		templateUrl: 'static/views/payment.html'//,
		/*controller: 'contentController'*/
	})
	.when('/confirmation', {
		templateUrl: 'static/views/reservationConfirmation.html'//,
		/*controller: 'contentController'*/
	})
	.when('/projects', {
		templateUrl: 'static/views/project.html'//,
		/*controller: 'contentController'*/
	});
})


