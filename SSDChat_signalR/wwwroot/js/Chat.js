// Global encryption variables
let key = "";
let iv = "";

// SignalR connection setup
const connection = new signalR.HubConnectionBuilder()
    .withUrl("/Hubs/ChatHub")
    .build();

// Set up SignalR message handler
connection.on("ReceiveMessage", function (user, encryptedMsg) {
    console.log("Received message");
    console.log(encryptedMsg);
    console.log(DecryptMessage(encryptedMsg));
    const decrypted = DecryptMessage(encryptedMsg);
    const li = document.createElement("li");
    li.textContent = `${user}: ${decrypted}`;
    document.getElementById("ChatMessages").appendChild(li);
});

// Initialize encryption and start connection
document.addEventListener("DOMContentLoaded", function() {
    initializeEncryption()
        .then(() => connection.start())
        .catch(err => console.error(err.toString()));

    // Add event listener to send button if it exists
    const sendButton = document.getElementById("SendMessageBtn");
    if (sendButton) {
        sendButton.addEventListener("click", SendMessage);
    }
});

// Function to get encryption config from C# backend
async function initializeEncryption() {
    try {
        // Fix the endpoint URL - should point to an action method, not just the controller
        const response = await fetch('/api/Encryption/getEncryptionConfig');

        // Parse the JSON response
        const encryptionConfig = await response.json();

        // Set the global encryption variables
        key = CryptoJS.enc.Base64.parse(encryptionConfig.key);
        iv = CryptoJS.enc.Base64.parse(encryptionConfig.iv);
        
        return true;
    } catch (error) {
        console.error("Failed to initialize encryption:", error);
        throw error;
    }
}

function SendMessage() {
    const user = document.getElementById("SenderName").value;
    const message = document.getElementById("Message").value;
    const encrypted = EncryptMessage(message);
    connection.invoke("SendMessage", user, encrypted).catch(err => console.error(err.toString()));

    // Clear message input
    document.getElementById("Message").value = "";
}

function EncryptMessage(message) {
    // Generate a new random IV for each message
    const newIV = CryptoJS.lib.WordArray.random(16);

    // Encrypt with the new IV
    const encrypted = CryptoJS.AES.encrypt(message, key, {
        iv: newIV,
        mode: CryptoJS.mode.CBC
    });

    // Combine IV and encrypted message and return as base64
    const ivAndEncryptedMessage = newIV.concat(encrypted.ciphertext);
    return CryptoJS.enc.Base64.stringify(ivAndEncryptedMessage);
}

function DecryptMessage(ciphertext) {
    // Decode the base64 string
    const ivAndEncryptedMessage = CryptoJS.enc.Base64.parse(ciphertext);
    // Extract the IV (first 16 bytes)
    const iv = CryptoJS.lib.WordArray.create(
        ivAndEncryptedMessage.words.slice(0, 4),
        16
    );

    // Extract the encrypted message (remaining bytes)
    const encryptedMessage = CryptoJS.lib.WordArray.create(
        ivAndEncryptedMessage.words.slice(4),
        ivAndEncryptedMessage.sigBytes - 16
    );

    // Create cipherParams object for decryption
    const cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: encryptedMessage
    });

    // Decrypt with the extracted IV
    const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
}
