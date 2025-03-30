using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using System.Threading.Tasks;

namespace ChatSignalR;

public class ChatHub: Hub
{
private static ConcurrentDictionary<string, string> ConnectedUsers = new();

private const int MaxUsers = 2;
public async Task SendMessage(string user, string message)
{ 
    await Clients.All.SendAsync("ReceiveMessage", user, message);
}
public override async Task OnConnectedAsync()
{
    // Check if user is already connected
    if (ConnectedUsers.Values.Contains(Context.User.Identity.Name))
    {
        await Clients.Caller.SendAsync("ReceiveMessage", "System", "You are already in the chat.");
        Context.Abort();
        return;
    }

    // Check total number of users
    if (ConnectedUsers.Count >= MaxUsers)
    {
        await Clients.Caller.SendAsync("ReceiveMessage", "System", "Chat room is full. Try again later.");
        Context.Abort();
        return;
    }

    // Add user by their username instead of connection ID
    string username = Context.User.Identity.Name;
    ConnectedUsers.TryAdd(Context.ConnectionId, username);

    await Clients.All.SendAsync("ReceiveMessage", "System", $"{username} joined the chat.");
    await base.OnConnectedAsync();
}

public override async Task OnDisconnectedAsync(Exception exception)
{
    string connectionId = Context.ConnectionId;
    if (ConnectedUsers.TryRemove(connectionId, out string username))
    {
        await Clients.All.SendAsync("ReceiveMessage", "System", $"{username} left the chat.");
    }
    await base.OnDisconnectedAsync(exception);
}

}
