'use strict';
/* Controllers */
angular.module('app.controllers', [])
    .controller('GameTableController', ['$scope', '$window', '$timeout','$q','RPCService', function($scope, $window, $timeout,$q ,RPCService) {
        //todo: more elegant
        navbar();
        init();

        function init(){
            $scope.authData = JSON.parse(localStorage.getItem("authData"));
            $scope.titleId = localStorage.titleId
            $scope.userId = localStorage.userId
            $scope.deck = null

            $scope.round = 0;

            $scope.currentPlayer = {hand:{cards:[]}, virtualCurrency:{}, items:[],
                avatarUrl:localStorage.avatarUrl,
                name:$scope.userId
            }
            $scope.dealer = {hand:{cards:[]}, coins:0, items:[],
                avatarUrl: '/resources/images/cardsNchips.jpg',
                name:'The Dealer'
            }

            PlayFab.settings.titleId = $scope.titleId
            console.log($scope.authData)
            //PlayFabId; //SessionTicket;



            var loginWithCustomIDRequest = {
                "TitleId" : $scope.titleId,
                "CustomId" : $scope.userId,
                "CreateAccount" : true
            };

            console.info('loginWithCustomIDRequest',loginWithCustomIDRequest)
            // console.log("Logging into PlayFab...", loginWithCustomIDRequest);
            PlayFabClientSDK.LoginWithCustomID(loginWithCustomIDRequest, AuthenticationCallback);
            console.info("shoot!....")
            // PlayFab._internalSettings.sessionTicket = $scope.authData.SessionTicket
            // PlayFab.settings.titleId = $scope.authData.titleId
            function AuthenticationCallback(response, error){
                RPCService.getUserInventory($scope.currentPlayer).then(
                    function(response){ console.log("getUserInventory",response)}
                );
                console.log(response, error)
            }
        };

        $scope.playGame = function() {
            // var deferred = $q.defer();
            if (!$scope.deck || $scope.deck.remaining < 3) {
                newGame().then(playGamePost)
            } else {
                playGamePost();
            }
        };

        function playGamePost(){
            if($scope.currentPlayer.virtualCurrency.CN < $scope.betAmount ){
                return false;
            }

            $scope.currentPlayer.hand.cards = []
            $scope.dealer.hand.cards = []

            $scope.currentPlayer.hand.status = null
            $scope.dealer.hand.status = null

            RPCService.subtractUserVirtualCurrency($scope.currentPlayer, "CN", $scope.betAmount)
            RPCService.addUserVirtualCurrency($scope.currentPlayer, "XP", Math.floor($scope.betAmount * 1.5))

            // var deferred = $q.defer();
            RPCService.getUserData().then(
                function(response){
                    // console.log("getUserData", response)
                    $q.all([
                            RPCService.dispense($scope.deck, 2, $scope.currentPlayer )
                                .then(function () {hit($scope.currentPlayer)}) ,

                            RPCService.dispense($scope.deck, 2, $scope.dealer )
                                .then(function () {hit($scope.dealer)})
                        ]
                    ).then(function(){
                        $timeout(function(){ $scope.conclusion() }, 1000);
                    })
                });
        };

        function hit(player){
            console.log("player", player, player.hand.bestValue)
            if(player.hand.bestValue < 12){
                // $timeout(function(){ RPCService.dispense($scope.deck, 1, player); }, 1000);
                RPCService.dispense($scope.deck, 1, player);
                console.log("hit")
            }
        }

        $scope.conclusion = function(){
            var player = $scope.currentPlayer.hand.bestValue;
            var dealer = $scope.dealer.hand.bestValue

            $scope.currentPlayer.hand.status = "WON"
            $scope.dealer.hand.status = "WON"

            if(player > 21){
                $scope.currentPlayer.hand.status = "BUST"
            }
            if(dealer > 21){
                $scope.dealer.hand.status = "BUST"
            }

            if(dealer < 22 && dealer < 22) {

                if (player < dealer) {
                    $scope.currentPlayer.hand.status = "BUST"
                } else if (player > dealer) {
                    $scope.dealer.hand.status = "BUST"
                } else if (player === dealer) {
                    $scope.currentPlayer.hand.status = "EVEN"
                    $scope.dealer.hand.status = "EVEN"
                }
            }



            if($scope.currentPlayer.hand.bestValue == 21){
                RPCService.addUserVirtualCurrency($scope.currentPlayer, "CN", $scope.betAmount*3).then(   function(){ $scope.safeApply()} )
                RPCService.addUserVirtualCurrency($scope.currentPlayer, "UN", 1)
            }
            else if($scope.currentPlayer.hand.status == "WON") {
                RPCService.addUserVirtualCurrency($scope.currentPlayer, "CN", $scope.betAmount*2).then(   function(){ $scope.safeApply()} )
            }else if( $scope.dealer.hand.status == "EVEN"){
                RPCService.addUserVirtualCurrency($scope.currentPlayer, "CN", $scope.betAmount).then(   function(){ $scope.safeApply()} )
            }
            console.info(   $scope.currentPlayer.hand.status,
                $scope.dealer.hand.status )
            $scope.safeApply();

            RPCService.updateStats($scope.currentPlayer)
        }

        $scope.buyCoins = function(amount){
            amount = amount || 500;
            RPCService.addUserVirtualCurrency($scope.currentPlayer, "CN", amount)
                .then(function(response){
                    console.log(response)
                    // $scope.safeApply();
                });
        }



        function newGame() {
            var deferred = $q.defer();

            RPCService.joinGame().then(function (responseRaw) {
                var response = JSON.parse(responseRaw)
                console.log("deck",response)
                $scope.deck = response;
                $scope.deckId = response.deck_id;

                // console.log($scope.deckId)
                // $scope.isActiveGame = true;
                deferred.resolve();
            });
            return deferred.promise;
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

        $scope.getUnicornTimes=function(n){
            return new Array($scope.currentPlayer.virtualCurrency.UN);
        };


        $scope.fbConnect1 = function(){
            var cmd = {
                "AccessToken": "FaceAccessTokenID"
            }
            PlayFabClientSDK.LinkFacebookAccount(cmd,fbResult)
        };

        function fbResult(r){
            console.log(r)
        }


        $scope.fbConnect = function(){
            console.info("connect")
            FB.getLoginStatus(function(response) {
                if (response.status === 'connected') {
                    console.log('Logged in.'),response;
                }
                else {
                    FB.login(
                        function(r){console.info("post login",r)}
                    );
                }
            });
        }
    }]);
