using Microsoft.AspNetCore.SignalR;
namespace SSDChat_signalR;

public class ChatHub : Hub
{
    //Limit amount of people in chat
    private static int _connectionCount = 0;
    private static readonly object _lock = new();
    public async Task SendMessage(string user, string message)
    {
        await Clients.All.SendAsync("ReceiveMessage", user, message);
    }

    public override async Task OnConnectedAsync()
    {
        if (_connectionCount >= 2)
        {
            Context.Abort();
            
            return;
        }

        _connectionCount++;
    }
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        lock (_lock)
        {
            _connectionCount--;
        }

        await base.OnDisconnectedAsync(exception);
    }
}