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

var portalModule = angular.module('portalModule', ['ngResource']);

portalModule.factory('reportFactory', function($resource){
	return $resource('/api', {}, {
			ResReport: {
				method: 'GET',
				url: '/api/reports/reservation'
			},
			PopularRoomCatReport: {
				method: 'GET',
				url: '/api/reports/popularRoom'
			},
			RevenueReport: {
				method: 'GET',
				url: '/api/reports/revenue'
			}
	})
})




angular.module('FancyHotelApp', ['ngRoute', 'ngResource', 'registerModule', 'portalModule', 'ngResource'])


.controller('registerController', function($scope, authFactory, $window) {

	$scope.myRegex = /C[a-zA-Z0-9]{4}/;

	$scope.submit = function() {
		response = authFactory.Register({
			"username": $scope.username,
			"email": $scope.email,
			"password": $scope.password,
			"firstName": $scope.firstName,
			"lastName": $scope.lastName
		});

		response.$promise.then(function(data)
		{
			if(data["result"] == true){
				console.log("account created, being redirected to login screen for official login");
				$window.location.href='#/login';
			}
			else{
				console.log("account registration failed");
			}
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

.controller('portalController', function($rootScope, $window){
	$rootScope.currentUser;
	
	//onclick of this from the portal, run this function


})

.controller('reportController', function($rootScope, $scope, reportFactory){
	$rootScope.currentUser;
	//var userType = $rootScope.currentUser.charAt(0); 
	$scope.data = {};
	$scope.emptyTable = "";
	/*if(userType!='M'){
		console.log("You must be a manager to do this.");
		return;
	}*/
	response = reportFactory.ResReport(); 
	response.$promise.then(function(data){
		$scope.data=data;
	})
	if($scope.data = {}){
		$scope.emptyTable="Sorry, no results were found!";
	}

	$scope.getPopularRoomCatReport = function(){
		if(userType!='M'){
			console.log("You must be a manager to do this.");
			return;
		}
		$scope.popularRooms = {};
	};
	//onclick of this from the portal, run this function
	$scope.getRevenueReport = function(){
		if(userType!='M'){
			console.log("You must be a manager to do this.");
			return;
		}
		$scope.revenue= {};
	};

})


.config(function($routeProvider) { //routing needs to be on a server in order to run
	$routeProvider
	.when('/',{
		templateUrl: 'static/views/welcome.html',
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
	})
	.when('/resReport', {
		templateUrl: 'static/views/reservationReport.html',
		controller: 'reportController'
	})
	.when('/popCatReport', {
		templateUrl: 'static/views/popularRoomCatReport.html',
		controller: 'reportController'
	})
	.when('/revenueReport', {
		templateUrl: 'static/views/revenueReport.html',
		controller: 'reportController'
	});
})


