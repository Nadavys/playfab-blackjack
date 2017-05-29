$( document ).ready(function() {
    console.log( "ready!" );
    init();
    navbar();
});

function init(){
    console.log( $("#login"))
         $("#login").on( "click", authenticate);
}


function authenticate(event){
console.log(event)
    event.preventDefault();

    // save our local GUID and Title Id to make
    PlayFab.settings.titleId = localStorage.titleId = $("#titleId").val();
    localStorage.userId = $("#playerName").val();

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

        // NewlyCreated
        //     :
        //     true
        // PlayFabId
        //     :
        //     "C864DF996423D6F6"
        // SessionTicket
        //     :
        //     "C864DF996423D6F6---D7FA-8D49F2DD7EDC902-A2BDFD2AB10ABB4E.4B8D98D10F186FC6"

        //player avatar

        localStorage.avatarUrl = 'http://api.randomuser.me/portraits/'+((Math.round(Math.random() * 1)) ?'men': 'women')
        +'/'
            +(Math.floor((Math.random() * 90) + 1))+'.jpg'

        window.location.href = 'table.html';
    }
}
