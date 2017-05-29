'use strict';

angular.module('app.services', [])
    .service('RPCService',[ '$http','$q', '$window',function($http,$q, $window){
        return{
            newGame: function() {

                var deferred = $q.defer();
                $http.get($window.BASE_URL + "/game/startNewGame/").success(function(data){
                    deferred.resolve(data.data);
                }).error(function(data){
                        alert("Something wrong happened")
                        //GlobalMessagesService.somethingReallyBadHappenedError();
                    });
                return deferred.promise;
            },
            joinGame: function() {

                var executeCloudScriptRequest = {
                    "FunctionName" : "newGame"
                };


                var deferred = $q.defer();


                PlayFabClientSDK.ExecuteCloudScript(executeCloudScriptRequest,  function(d){ deferred.resolve(d.data.FunctionResult.responseContent)} );

                // $http.get($window.BASE_URL + "/game/joinGame/" ).success(function(data){
                //     deferred.resolve(data.data);
                // }).error(function(data){
                //         alert("Something wrong happened")
                //         //GlobalMessagesService.somethingReallyBadHappenedError();
                //     });
                return deferred.promise;
            },
            getUserData: function(){
                var cmd = {
                    "keys" : []
                };
                var deferred = $q.defer();
                PlayFabClientSDK.GetUserData(cmd,  function(d){ deferred.resolve(d.data.Data)} );
                return deferred.promise;

            },
            dispense: function(deck, count, player){
                var deferred = $q.defer();
                console.log("deck",deck)
                var count = count || 2;
                var url = 'https://deckofcardsapi.com/api/deck/'+deck.deck_id+'/draw/?count='+count
                deck.remaining -= count;
                $http.get(url).then(
                    function (data) {
                        if (player) {
                            player.hand.cards = [].concat( player.hand.cards, data.data.cards)
                            player.hand.bestValue = getBestValue(player.hand.cards)
                        }
                        deferred.resolve(data.data);
                    });

                function getBestValue(cards){
                    var value = 0;
                    angular.forEach(cards, function(card) {
                        switch (card.value){
                            case "QUEEN":
                            case "KING":
                            case "JACK":
                                value += 10;
                                break;
                            case "ACE":
                                value += 10;
                                break;
                            default:
                                value += parseInt(card.value)
                        }
                    });
                    return value;
                }

                return deferred.promise;
            },
            getUserInventory: function(player){
                var deferred = $q.defer();
                PlayFabClientSDK.GetUserInventory({},  function(d){
                    console.log("d.data.VirtualCurrency",d.data.VirtualCurrency)
                    player.virtualCurrency = d.data.VirtualCurrency;
                    deferred.resolve(d.data)} );
                return deferred.promise;
            },
            subtractUserVirtualCurrency: function(player, virtualCurrency, amount){
                var deferred = $q.defer();

                var cmd = {
                    "VirtualCurrency": virtualCurrency,
                    "Amount": amount
                }

                PlayFabClientSDK.SubtractUserVirtualCurrency(cmd,  function(d){

                    player.virtualCurrency[virtualCurrency] -= amount;
                    deferred.resolve(d.data)} );
                return deferred.promise;
            },
            addUserVirtualCurrency: function(player, virtualCurrency, amount){
                var deferred = $q.defer();

                var cmd = {
                    "VirtualCurrency": virtualCurrency,
                    "Amount": amount
                }

                PlayFabClientSDK.AddUserVirtualCurrency(cmd,  function(d){
                    player.virtualCurrency[virtualCurrency] += amount;
                    deferred.resolve(d.data)} );

                return deferred.promise;
            },
            updateStats: function(player){
                var cmd = {
                    "Statistics": [
                        {
                            "StatisticName": "coins",
                            "Value": player.virtualCurrency.CN
                        },
                        {
                            "StatisticName": "XP",
                            "Value": player.virtualCurrency.XP
                        },
                        {
                            "StatisticName": "unicorns",
                            "Value": player.virtualCurrency.UN
                        }
                    ]
                };

                PlayFabClientSDK.UpdatePlayerStatistics(cmd);

            }
        }
    }]);

//GetUserInventory