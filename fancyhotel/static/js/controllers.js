angular.module('FancyHotelApp', ['ngRoute'])

/*.controller('contentController', [function($route, $routeParams) {
}])*/


/*.controller('navController', [function($route, $routeParams) {
	this.links =[
		{linkName: 'About',
		URL: '/about',
		},
		{linkName: 'Resume',
		URL: '/resume',
		},
		{linkName: 'Projects',
		URL: '/projects',
		}
	]
}])*/

.config(function($routeProvider) { //routing needs to be on a server in order to run
	$routeProvider
	.when('/',{
		templateUrl: 'static/views/login.html',
	})
	.when('/login', {
	templateUrl: 'static/views/login.html',
		/*controller: 'contentController',*/
	})
	.when('/register', {
	templateUrl: 'static/views/registerUser.html'//,
		/*controller: 'contentController',*/
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