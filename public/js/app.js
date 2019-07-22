const app = angular.module('kdChatApp', []);

app.controller('AppCtrl', function ($scope, socket, $window)
{
	$scope.users = [];
	$scope.curtrentUser = '';
	socket.on('connect', function () { });

	socket.on('kd-updatechat', function (username, data) {
		var user = {};
		user.username = username;
		user.message = data;
		user.date = new Date().getTime();
		$scope.users.push(user);
	});

	socket.on('kd-roomcreated', function (data) {
		socket.emit('kd-adduser', data);
	});

	$scope.createRoom = function (data) {
		$scope.curtrentUser = data.username;
		socket.emit('kd-createroom', data);
	}

	$scope.joinRoom = function (data) {
		$scope.curtrentUser = data.username;
		socket.emit('kd-adduser', data);
	}

	$scope.SendMessage = function (message) {
		socket.emit('kd-sendchat', message);
		$scope.message = "";
		$window.document.getElementById('messageInput').focus();
	}
});

app.factory('socket', function ($rootScope)
{
	var socket = io.connect();
	return {
		on: function (eventName, callback) {
			socket.on(eventName, function () {
				var args = arguments;
				$rootScope.$apply(function () {
					callback.apply(socket, args);
				});
			});
		},
		emit: function (eventName, data, callback) {
			socket.emit(eventName, data, function () {
				var args = arguments;
				$rootScope.$apply(function () {
					if (callback) {
						callback.apply(socket, args);
					}
				});
			})
		}
	};
});

app.directive('scrollToBottom', function($timeout) {
    return {
        scope: {
            scrollToBottom: "="
        },
        restrict: 'A',
        link: function(scope, element, attr) {
            scope.$watchCollection('scrollToBottom', function(newVal) {
                if (newVal) {
                    $timeout(function() {
                        element[0].scrollTop =  element[0].scrollHeight;
                    }, 0);
                }

            });
        }
    };
});