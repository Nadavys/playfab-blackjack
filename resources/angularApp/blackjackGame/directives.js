'use strict';

/* Directives */

angular.module('app.directives', ['app.services'])

    .directive('hand', [ '$window',function($window) {
        return {
            transclude: true,
            restrict: 'A',
            scope: {
                hand: '=hand'
            },
            templateUrl: '/resources/partials/directives/hand.tpl.html',

            link: function($scope, $element, $attrs){

                $scope.$watch('hand', function(newVal) {
                    $scope.hand = newVal;
                });
            },
            controller: function($scope){
                $scope.safeApply = function(fn) {
                    var phase = this.$root.$$phase;
                    if(phase == '$apply' || phase == '$digest') {
                        if(fn && (typeof(fn) === 'function')) {
                            fn();
                        }
                    } else {
                        this.$apply(fn);
                    }
                };
            }
        }
    }])

    .directive('gameplayer', [ '$window', 'RPCService',function($window, RPCService) {
        return {
            transclude: true,
            restrict: 'AE',
            scope: {
                player: '=player' ,
                game: '=game',
                currentPlayerId: '=currentPlayerId'
            },
            templateUrl: '/resources/partials/directives/player.tpl.html',

            link: function($scope, $element, $attrs){
                $scope.BASE_URL = $window.BASE_URL;

                $scope.$watch('player', function(newVal) {
                    $scope.player = newVal;
                });

                $scope.$watch('game', function(newVal) {
                    $scope.game = newVal;
                });

            },
            controller: function($scope){

                $scope.cmdPlayerMove = function(action){

                    $scope.isPlayerMoveRequired = false
                    RPCService.playerMove(action)
                }


                $scope.safeApply = function(fn) {
                    var phase = this.$root.$$phase;
                    if(phase == '$apply' || phase == '$digest') {
                        if(fn && (typeof(fn) === 'function')) {
                            fn();
                        }
                    } else {
                        this.$apply(fn);
                    }
                };
            }
        }
    }]);
