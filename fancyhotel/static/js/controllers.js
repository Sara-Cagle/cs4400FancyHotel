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

.run(function($rootScope) {
    $rootScope.currentUser = '';
	$rootScope.userType = '';
	$rootScope.alreadyLoggedIn = function(){
		if($rootScope.currentUser != ''){
			console.log("you're already logged in.")
			return true;
		}
		console.log("you're not logged in yet.")
		return false;
	}

	$rootScope.getUserType = function(){
		var userType = $rootScope.currentUser.charAt(0);
		if(userType == 'M' || userType == 'm' ){
			$rootScope.userType = "manager";
		}
		else if(userType == 'C' || userType == 'c'){
			$rootScope.userType = "customer";
		}
		else{
			$rootScope.userType = "invalid user type";
		}
	}
})


.controller('registerController', function($rootScope, $scope, authFactory, $window) {
	$rootScope.alreadyLoggedIn();
	$scope.loggedInBool = $rootScope.alreadyLoggedIn();

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

	}
	
})

.controller('loginController', function($rootScope, $scope, authFactory, $window){
	$rootScope.alreadyLoggedIn();
	$scope.loggedInBool = $rootScope.alreadyLoggedIn();

	$scope.submit = function(){
		response = authFactory.Login({
			"username": $scope.username,
			"password": $scope.password
		});

		response.$promise.then(function(data){
			if(data["result"] == true){
				$rootScope.currentUser = $scope.username;
				$rootScope.getUserType();
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

.controller('portalController', function($rootScope){
	$rootScope.alreadyLoggedIn();
	$rootScope.currentUser;
	$rootScope.getUserType();
	//$rootScope.userType;


})

.controller('reportController', function($rootScope, $scope, reportFactory){
	$rootScope.currentUser;

	$scope.data = {};
	$scope.emptyTable = "";
	/*if($rootScope.userType!="manager"){
		console.log("You must be a manager to do this.");
		return;
	}*/
	response = reportFactory.ResReport(); 
	response.$promise.then(function(data){
		$scope.data=data;
	})

	if(Object.keys($scope.data).length==0){
		$scope.emptyTable="Sorry, no results were found!";
	}

	$scope.getPopularRoomCatReport = function(){
		if($rootScope.userType!="manager"){
			console.log("You must be a manager to do this.");
			return;
		}
		$scope.popularRooms = {};
	};
	//onclick of this from the portal, run this function
	$scope.getRevenueReport = function(){
		if($rootScope.userType!="manager"){
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
		templateUrl: 'static/views/selectionPage.html',
		controller: 'portalController'
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


