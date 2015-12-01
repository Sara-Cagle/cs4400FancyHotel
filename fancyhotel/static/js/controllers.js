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
		MakeReservation: {
			method: 'POST',
			url: '/api/reservation/create'	
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

resourceModule.factory('reviewFactory', function($resource){
	return $resource('/api', {}, {
		AddReview:{
			method: 'POST',
			url: '/api/review'
		},
		GetReviews:{
			method: 'GET',
			url: '/api/review',
			isArray: true
		}
	})
})

resourceModule.factory('paymentFactory', function($resource){
	return $resource('/api', {}, {
		GetCreditCards:{
			method: 'GET',
			url: '/api/payment',
			isArray: true
		},
		AddCreditCard:{
			method: 'POST',
			url: '/api/payment'
		},
		DeleteCreditCard:{
			method: 'DELETE',
			url: '/api/payment'
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

	$rootScope.getCost = function(){
		var cost = 0;

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
.controller('reservationController', function($rootScope, $scope, reservationFactory, paymentFactory){
	$scope.creditCards; //the number for USING a card
	$scope.creditCardNumber; //the number for ADDING a card
	$scope.cardToDelete; //card you're trying to delete

	



	var now = new Date();
	var nowplustwo = new Date();
	nowplustwo.setDate(now.getDate() + 2);
	$("#startDatePicker").datetimepicker(
		{
			format: 'YYYY-MM-DD',
			minDate: now,
			date: now
		}
	);
	$("#endDatePicker").datetimepicker(
		{
			format: 'YYYY-MM-DD',
			date: nowplustwo
		}
	);
	
	$('#startDatePicker').on("dp.change", function (e) {
		$('#endDatePicker').data("DateTimePicker").minDate(e.date);
	});

	$('#endDatePicker').on("dp.change", function (e) {
		$('#startDatePicker').data("DateTimePicker").maxDate(e.date);
	});
					
	$scope.loggedInBool = $rootScope.alreadyLoggedIn();
	$scope.viewPart1 = true; //these views are for the update page
	$scope.viewPart2 = false;
	$scope.viewPart3 = false;
	$scope.currRes =''; //this is for the update page
	$scope.newCost = 0;

	$scope.availability={ //this is availability of rooms for an update reservation
		"avail": '',
		"message": ''
	};
	$scope.roomsAvailable = []; //this is rooms available for a new search on rooms, not an upate
	$scope.error = '';
	$scope.hideForm = false;
	$scope.selectedRooms = {};
	
	//api/blah/blah?username=Csara
	$scope.submit = function(){
		$scope.checkIn = $("#startDatePicker").data("date");
        $scope.checkOut = $("#endDatePicker").data("date");
		
		searchRoomsResponse = reservationFactory.SearchRooms(
		{
			"location": $scope.location,
			"checkIn": $scope.checkIn,
			"checkOut": $scope.checkOut
		});
	//handle promise
		searchRoomsResponse.$promise.then(function(data){
			if(data["result"] == true){
				$scope.roomsAvailable = data["response"];
				$scope.hideForm = true; //hides the form and replaces it with the available rooms
			}
			else{
				$scope.error="Sorry, there are no available rooms for this period of time.";
			}

			getCardsResponse = paymentFactory.GetCreditCards({
				"username": $rootScope.currentUser
			});
			getCardsResponse.$promise.then(function(data){
				$scope.creditCards = data; //data is an array
			});

		});
	};
	
	$scope.bookRooms = function(){
		var rooms = []
		for(var key in $scope.selectedRooms)
		{
			if($scope.selectedRooms[key])
			{
				$scope.roomsAvailable.forEach(
					function(room)
					{
						if(room.location + room.room_number === key)
						{
							rooms.push({
								"room_number": room.room_number,
								"location": room.location,
								"extra_bed_or_not": 0 //something here
							});
						}	
					}
				);
			}
		}
		
		//rooms
		console.log(rooms);
		var make_response = reservationFactory.MakeReservation(
			{
				"username": $rootScope.currentUser,
				"checkIn": $scope.checkIn,
				"checkOut": $scope.checkOut,
				"card_number": "1234567812345678", //need to fill in with card info
				"rooms": rooms
			}
		);
		make_response.$promise.then(function(data)
		{
			console.log(data);	
		});
	}

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
				$scope.calculateNewCost();
			}
			else{
				$scope.availability["message"] = "Sorry, but your selected rooms are not available for your newly selected dates."
				$scope.availability["avail"] = false;
				//handle that there were no available rooms
			}
		});
	};

	$scope.calculateNewCost = function(){
		var numOfDays = $scope.newCheckoutDate - $scope.newCheckinDate; //gives us difference in miliseconds
		numOfDays = numOfDays%86400000; //turn it into days
		var cost = 0;
		for(i=0; i<$scope.currRes.rooms.length; i++ ){
			cost += $scope.currRes.rooms[i].cost*numOfDays;
			if($scope.currRes.rooms[i].extra_bed_or_not==1){
				cost += $scope.currRes.rooms[i].extra_bed_price*numOfDays;
			}
		}

		$scope.newCost = cost;
		//return cost;
		//calculate the new cost of the rooms here
		//for rooms in reservation
		//(time2-time1)*cost of the room + if extra bed is true, (time2-time1)*cost of extra bed
		//sum them all up
	}

	$scope.updateReservation = function(){
		updateReservationResponse = reservationFactory.UpdateReservation(
		{
			"username":$rootScope.currentUser,
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

	/*$scope.cardNumber;
	$scope.creditCards;

	getCardsResponse = paymentFactory.GetCreditCards({
		"username": $rootScope.currentUser
	});
	getCardsResponse.$promise.then(function(data){
		$scope.creditCards = data; //data is an array
	});*/

})


.controller('reportController', function($rootScope, $scope, reportFactory){
	$scope.loggedInBool = $rootScope.alreadyLoggedIn();
	$scope.creditCards;
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


.controller('paymentController', function($rootScope, $scope, paymentFactory){

	$("#expirationDatePicker").datetimepicker(
	{
		format: 'YYYY-MM-DD',
		minDate: new Date()
	});
	
	$scope.loggedInBool = $rootScope.alreadyLoggedIn();
	$scope.creditCards; //the number for USING a card
	$scope.creditCardNumber; //the number for ADDING a card
	$scope.cardToDelete; //card you're trying to delete

	getCardsResponse = paymentFactory.GetCreditCards({
		"username": $rootScope.currentUser
	});
	getCardsResponse.$promise.then(function(data){
		$scope.creditCards = data; //data is an array
	});

	$scope.addCard = function(){
		$scope.expirationDate = $("#expirationDatePicker").data("date");
		addCreditCardResponse = paymentFactory.AddCreditCard({
			"username":$rootScope.currentUser,
			"card_number": $scope.creditCardNumber,
			"cvv": $scope.cvv,
			"expiration_date": $scope.expirationDate,
			"name": $scope.cardName //name of the owner of the card, not necesarilly the username
		});
		addCreditCardResponse.$promise.then(function(data){
			
			getCardsResponse = paymentFactory.GetCreditCards({
				"username": $rootScope.currentUser
			});

			getCardsResponse.$promise.then(function(cardData){
				$scope.creditCards = cardData; //data is an array
			});
		});
	}


	$scope.deleteCard = function(){
		deleteCreditCardResponse = paymentFactory.DeleteCreditCard({
			"username": $rootScope.currentUser,
			"card_number": $scope.cardToDelete
		});
		deleteCreditCardResponse.$promise.then(function(data){});
	}


})

.controller('reviewController', function($rootScope, $scope, reviewFactory){
	$scope.loggedInBool = $rootScope.alreadyLoggedIn();
	$scope.comment = ''; //just in case the user doesn't give one, so in our'd DB, we won't have null, instead we'll have ''
	$scope.viewPart2= false;
	$scope.reviews;
	$scope.emptyTable = '';

	$scope.addReview = function(){
		addReviewResponse = reviewFactory.AddReview({
			"location": $scope.location, 
			"comment": $scope.comment,
			"rating": $scope.rating, 
			"username": $rootScope.currentUser
		});
	//handle promise
		addReviewResponse.$promise.then(function(data){});
	}

	$scope.getReviews = function(){
		getReviewsResponse = reviewFactory.GetReviews({
			"location": $scope.location
		});
		getReviewsResponse.$promise.then(function(data){
			$scope.viewPart2 = true;
			$scope.reviews = data; //this is an array
			if(reviews.length==0){
				$scope.emptyTable="Sorry, there are no reviews for this location!";
			}


		});
	}

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
		templateUrl: 'static/views/payment.html',
		controller: 'paymentController'
	})
	.when('/confirmation', {
		templateUrl: 'static/views/reservationConfirmation.html'//,
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
		templateUrl: 'static/views/writeReview.html',
		controller: 'reviewController'
	})
	.when('/viewFeedback', {
		templateUrl: 'static/views/viewFeedback.html',
		controller: 'reviewController'
	});
})


