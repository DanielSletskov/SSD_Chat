using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.SignalR;


namespace SSDChat_signalR.Hubs;
public class ChatHub : Hub
{
    private static HashSet<string> ConnectedUsers = new HashSet<string>();
    private static int AllowedUsers = 2;
    public override async Task OnConnectedAsync()
    {
        if (ConnectedUsers.Count >= AllowedUsers)
        {
            Context.Abort();
            return;
        }
        ConnectedUsers.Add(Context.ConnectionId);
        await base.OnConnectedAsync();
    }
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        ConnectedUsers.Remove(Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }
    public async Task SendMessage(string user, string message)
    {
        await Clients.All.SendAsync("ReceiveMessage", user, message);
    }
    
}

