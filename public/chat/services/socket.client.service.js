/**
 * Created by GB115151 on 22/07/2016.
 */
angular.module('chat').service('Socket', ['$location', '$timeout',
    function($location, $timeout) {
        // if (Authentication.user) {
        //    this.socket = io();
        // } else {
        //     $location.path('/');
        // }
        this.socket = io();

        this.on = function(eventName, callback) {
            if (this.socket) {
                this.socket.on(eventName, function(data) {
                    $timeout(function() {
                        callback(data);
                    });
                });
            }
        };
        this.emit = function(eventName, data) {
            if (this.socket) {
                this.socket.emit(eventName, data);
            }
        };
        this.removeListener = function(eventName) {
            if (this.socket) {
                this.socket.removeListener(eventName);
            }
        };
    }
]);