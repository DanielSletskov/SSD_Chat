using System.Security.Cryptography;
using Microsoft.AspNetCore.Mvc;

namespace SSDChat_signalR.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EncryptionController : ControllerBase
{ 
// Shared static variables (persist during app lifetime)
    private static string _sharedKey;
    private static string _sharedIV;
    private static readonly object _lock = new object(); // For thread safety

    [HttpGet("getEncryptionConfig")]
    public IActionResult GetEncryptionConfig()
    {
        try
        {
            // Generate the shared key and IV only once
            if (_sharedKey == null || _sharedIV == null)
            {
                lock (_lock)
                {
                    if (_sharedKey == null || _sharedIV == null)
                    {
                        using (var aes = Aes.Create())
                        {
                            aes.GenerateKey();
                            aes.GenerateIV();

                            _sharedKey = Convert.ToBase64String(aes.Key);
                            _sharedIV = Convert.ToBase64String(aes.IV);
                        }
                    }
                }
            }

            return Ok(new
            {
                key = _sharedKey,
                iv = _sharedIV
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Failed to generate encryption configuration: {ex.Message}");
        }
    }
}