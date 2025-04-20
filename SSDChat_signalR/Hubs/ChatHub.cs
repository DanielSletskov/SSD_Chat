using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.SignalR;


namespace SSDChat_signalR.Hubs;
public class ChatHub : Hub
{
    
    private static int ConnectionCount = 0;
    private static int MaxUsers = 2;

    public override async Task OnConnectedAsync()
    {
        if (ConnectionCount >= MaxUsers)
        {
            Context.Abort();
            return;
        }
        ConnectionCount++;
    }

    public async Task SendMessage(string user, string message)
    {
        await Clients.All.SendAsync("ReceiveMessage", user, message);
    }
    
}

