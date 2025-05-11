using System.Collections.Concurrent;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace SSDChat_signalR.Hubs;


public class ChatHub : Hub
{
    private static readonly ConcurrentDictionary<string, string> ConnectionToUser = new();
    private static readonly ConcurrentDictionary<string, string> ConnectionToPublicKey = new();

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        ConnectionToUser.TryRemove(Context.ConnectionId, out _);
        ConnectionToPublicKey.TryRemove(Context.ConnectionId, out _);
        return base.OnDisconnectedAsync(exception);
    }

    public async Task SharePublicKey(string user, string publicKeyHex)
    {
        ConnectionToUser[Context.ConnectionId] = user;
        ConnectionToPublicKey[Context.ConnectionId] = publicKeyHex;

        if (ConnectionToPublicKey.Count > 2)
        {
            // Only allow two participants
            await Clients.Caller.SendAsync("ChatFull");
            return;
        }

        // Broadcast this user's public key to the other
        foreach (var connection in ConnectionToPublicKey)
        {
            if (connection.Key != Context.ConnectionId)
            {
                var partnerUser = ConnectionToUser[Context.ConnectionId];
                await Clients.Client(connection.Key).SendAsync("ReceivePublicKey", partnerUser, publicKeyHex);

                var otherUser = ConnectionToUser[connection.Key];
                var otherPublicKey = connection.Value;
                await Clients.Caller.SendAsync("ReceivePublicKey", otherUser, otherPublicKey);
            }
        }
    }
    public async Task SendMessage(string user, string encryptedMessage)
    {
        foreach (var connection in ConnectionToUser)
        {
            await Clients.Client(connection.Key).SendAsync("ReceiveMessage", user, encryptedMessage);
        }
    }
}