$( document ).ready(function() {
    init();
    navbar();
});

function init(){
    var authData = JSON.parse(localStorage.getItem("authData"));
    var titleId = localStorage.titleId
    var userId = localStorage.userId

    PlayFab.settings.titleId = titleId

    authenticate();

}


function authenticate(){

    var loginWithCustomIDRequest = {
        "TitleId" : localStorage.titleId,
        "CustomId" : localStorage.userId,
        "CreateAccount" : true
    };

    console.log("Logging into PlayFab...", loginWithCustomIDRequest);
    PlayFabClientSDK.LoginWithCustomID(loginWithCustomIDRequest, AuthenticationCallback);
}

function AuthenticationCallback(response, error){
    console.info(arguments)
    if(error)
    {
        OutputError(error);
    }
    else
    {
        var result = response.data;
        console.info(response)
        console.log("Login Successful. Welcome Player: " + result.PlayFabId);
        console.log("Your session ticket is: " + result.SessionTicket);

        localStorage.setItem("authData", JSON.stringify(result));
    }
    getLeaderboard("unicorns");
}


function getLeaderboard(value){
    var cmd = {
            "StatisticName": value,
            "MaxResultsCount": 10,
            "StartPosition":0
        }


    PlayFabClientSDK.GetLeaderboard(cmd,leaderBackCallback)
}

function leaderBackCallback(result) {
    $.each(result.data.Leaderboard , function(i, item) {
        var $tr = $('<tr>').append(
            $('<td>').text(item.Position+1),
            $('<td>').text(item.PlayFabId),
            $('<td>').text(item.StatValue)
        ).appendTo('#leaderboard');
        // console.log($tr.wrap('<p>').html());
    });

}

//callback func(result, error)

function OutputError(error)
{
    console.log(error);
}