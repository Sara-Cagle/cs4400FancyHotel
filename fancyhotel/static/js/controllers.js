var resourceModule = angular.module('resourceModule', ['ngResource']);

resourceModule.factory('authFactory', function($resource){
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

resourceModule.factory('reportFactory', function($resource){
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

resourceModule.factory('reservationFactory', function($resource){
	return $resource('/api', {}, {
		SearchRooms:{
			method: 'GET',
			url: '/api/searchRoom'
		},
		GetReservation:{
			method:'GET',
			url: '/api/reservation/:reservation_id'
		},
		UpdateReservationConfirm:{
			method: 'GET',
			url: '/api/reservation/:reservation_id/availability'
		},
		UpdateReservation:{
			method:'PUT',
			url: '/api/reservation/:reservation_id'
		},
		CancelReservation:{
			method:'GET',
			url: '/api/reservation/:reservation_id/cancel'
		}
	})
})





angular.module('FancyHotelApp', ['ngRoute', 'ngResource', 'resourceModule'])

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

.controller('portalController', function($rootScope, $scope){
	$rootScope.alreadyLoggedIn();
	$scope.loggedInBool = $rootScope.alreadyLoggedIn();
	$rootScope.currentUser;
	$rootScope.getUserType();
	$rootScope.userType;


})

.controller('reservationController', function($rootScope, $scope, reservationFactory){
	$scope.loggedInBool = $rootScope.alreadyLoggedIn();
	$scope.viewPart1 = true;
	$scope.viewPart2 = false;
	$scope.viewPart3 = false;
	$scope.currRes ='';
	$scope.availability={
		"avail": '',
		"message": ''
	};
	
	//api/blah/blah?username=Csara
	$scope.submit = function(){
		searchRoomsResponse = reservationFactory.SearchRooms(
		{
			"location": $scope.location,
			"checkIn": $scope.checkIn,
			"checkOut": $scope.checkOut
		});
	//handle promise
		searchRoomsResponse.$promise.then(function(data){});
	};

	$scope.findReservation = function(){
		getReservationResponse = reservationFactory.GetReservation({
			"reservation_id": $scope.resID,
			"username": $rootScope.currentUser
		});
	//handle promise
		getReservationResponse.$promise.then(function(data){
			if(data["result"] == true){
				$scope.viewPart2 = true;
				$scope.viewPart1 = false;
				$scope.currRes = data["data"];
			}
			else{
				//something about how the reservation doesn't exist
			}
		});
	};


	$scope.searchAvailability = function(){
		updateReservationConfirmResponse = reservationFactory.UpdateReservationConfirm({
			"reservation_id": $scope.resID,
			"checkIn": $scope.newCheckinDate,
			"checkOut": $scope.newCheckoutDate,
			"username":$rootScope.currentUser
		});
	//handle promise
		updateReservationConfirmResponse.$promise.then(function(data){
			if(data["result"]==true){ //rooms are available for booking
				$scope.viewPart3 = true;
				$scope.availability["message"] = "Your selected rooms are available for your newly selected dates. Would you like to confirm your updated reservation?"
				$scope.availability["avail"] = true;
			}
			else{
				$scope.availability["message"] = "Sorry, but your selected rooms are not available for your newly selected dates."
				$scope.availability["avail"] = false;
				//handle that there were no available rooms
			}
		});
	};

	$scope.updateReservation = function(){
		updateReservationResponse = reservationFactory.UpdateReservation(
		{
			"username":$rootScope.currentUser
		},
		{
			"reservation_id": $scope.resID,
			"checkIn": $scope.newCheckinDate,
			"checkOut": $scope.newCheckoutDate
		});
		//handle promise
		updateReservationResponse.$promise.then(function(data){});
	};

	$scope.cancelReservation = function(){
		cancelReservationResponse = reservationFactory.CancelReservation({
			"reservaton_id": $scope.reservationID,
			"username":$rootScope.currentUser
		});
	//handle promise
		cancelReservationResponse.$promise.then(function(data){});
	}

})


.controller('reportController', function($rootScope, $scope, reportFactory){
	$scope.loggedInBool = $rootScope.alreadyLoggedIn();
	//$rootScope.currentUser;

	$scope.resReport = {};
	$scope.popCatReport = {};
	$scope.revenueReport = {};
	$scope.emptyTable = "";


	reservationReportResponse = reportFactory.ResReport(); 
	reservationReportResponse.$promise.then(function(data){
		$scope.resReport=data;
	});

	popCatReportResponse = reportFactory.PopularRoomCatReport(); 
	reservationReportResponse.$promise.then(function(data){
		$scope.popCatReport=data;
	});

	revenueReportResponse = reportFactory.RevenueReport(); 
	reservationReportResponse.$promise.then(function(data){
		$scope.revenueReport=data;
	});

	/*if(Object.keys($scope.data).length==0){
		$scope.emptyTable="Sorry, no results were found!";
	}*/


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
		templateUrl: 'static/views/searchRoom.html',
		controller: 'reservationController'
	})
	.when('/reserve', {
		templateUrl: 'static/views/searchRoom.html',
		controller: 'reservationController'
	})
	.when('/update', {
		templateUrl: 'static/views/updateReservation.html',
		controller: 'reservationController'
	})
	.when('/cancel', {
		templateUrl: 'static/views/cancelReservation.html',
		controller: 'reservationController'
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
	})
	.when('/provideFeedback', {
		templateUrl: 'static/views/provideFeedback.html'
	})
	.when('/viewFeedback', {
		templateUrl: 'static/views/viewFeedback.html'
	});
})


