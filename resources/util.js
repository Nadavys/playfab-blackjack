function GetInventory()
{
    console.log("Getting the player inventory...");
    PlayFabClientSDK.GetUserInventory({}, GetInventoryCallback);
}



function GetInventoryCallback(response, error)
{
    if(error)
    {
        OutputError(error);
    }
    else
    {
        var result = response.data;
        console.log("Inventory retrieved. You have " + result.Inventory.length + " items.");

        var stBalance = result.VirtualCurrency.hasOwnProperty("ST") ? result.VirtualCurrency["ST"] : 0;
        var rechargeDetails;
        var freeTicketDisplay = "Capped";

        if(result.VirtualCurrencyRechargeTimes.hasOwnProperty("ST"))
        {
            rechargeDetails = result.VirtualCurrencyRechargeTimes["ST"];
            if(stBalance < rechargeDetails.RechargeMax)
            {
                var nextFreeTicket = new Date(Date.now());
                nextFreeTicket.setSeconds(nextFreeTicket.getSeconds() + rechargeDetails.SecondsToRecharge);
                freeTicketDisplay = nextFreeTicket.toLocaleDateString() + " \n " +  nextFreeTicket.toLocaleTimeString('en-US');

                console.log("You have " + stBalance + " Spin Tickets.");
                console.log("Your next free ticket will arrive at: "+ freeTicketDisplay);

            }
            else
            {
                console.log("Tickets only regenerate to a maximum of " +rechargeDetails.RechargeMax + ", and you currently have "+ stBalance + ".");
            }
        }

        SetUI(stBalance, result.Inventory.length, freeTicketDisplay);
    }
}


function TryToSpin()
{
    console.log("Attempting to spin...");
    var PurchaseItemRequest = {
        "ItemId" : "PrizeWheel1",
        "VirtualCurrency" : "ST",
        "Price" : 1
    };
    PlayFabClientSDK.PurchaseItem(PurchaseItemRequest, TryToSpinCallback);
}

function TryToSpinCallback(request, error)
{
    if(error)
    {
        OutputError(error);
    }
    else
    {
        var result = request.data;
        console.log("Ticket Accepted! \nSPINNING...");
        console.log("SPIN RESULT: "+ result.Items[1].DisplayName);
        GetInventory();
    }
}





//callback func(result, error)

function OutputError(error)
{
    console.log(error);
}

function navbar(){
    console.log($);
    console.log($.ajax);
    console.log($.get);
    $.get('/resources/partials/navbar.html', function(template) {
        $('#navbar_placeholder').html(template)
    });
}
