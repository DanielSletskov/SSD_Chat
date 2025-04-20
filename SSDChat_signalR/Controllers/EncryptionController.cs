using System.Security.Cryptography;
using Microsoft.AspNetCore.Mvc;

namespace SSDChat_signalR.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EncryptionController : ControllerBase
{ 
    [HttpGet("getEncryptionConfig")] 
    public IActionResult GetEncryptionConfig() 
    {
        try 
        { 
            // Generate encryption key and IV (in production, consider more secure methods)
            using (var aes = Aes.Create()) 
            { 
                aes.GenerateKey(); 
                aes.GenerateIV();
                
                return Ok(new 
                { 
                    key = Convert.ToBase64String(aes.Key), 
                    iv = Convert.ToBase64String(aes.IV) 
                }); 
            } 
        }
        catch (Exception ex) 
        {
                return StatusCode(500, $"Failed to generate encryption configuration: {ex.Message}"); 
        } 
    }
}