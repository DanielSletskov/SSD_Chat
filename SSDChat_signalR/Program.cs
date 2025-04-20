using SSDChat_signalR.Hubs;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddRazorPages();
builder.Services.AddSignalR();
builder.Services.AddControllers();

var app = builder.Build();
app.UseStaticFiles();
app.UseRouting();
app.MapRazorPages();
app.MapControllers();  
app.MapHub<ChatHub>("Hubs/ChatHub");
app.Run();