// Helper functions for sessionStorage
function setSessionKey(keyStr) {
    sessionStorage.setItem("encryptionKey", keyStr);
}
function getSessionKey() {
    const keyStr = sessionStorage.getItem("encryptionKey");
    return keyStr ? CryptoJS.enc.Base64.parse(keyStr) : null;
}

function setSessionIV(ivStr) {
    sessionStorage.setItem("encryptionIV", ivStr);
}

// SignalR connection setup
const connection = new signalR.HubConnectionBuilder()
    .withUrl("/Hubs/ChatHub")
    .build();

// SignalR receive handler
connection.on("ReceiveMessage", function (user, encryptedMsg) {
    const decrypted = DecryptMessage(encryptedMsg);
    const li = document.createElement("li");
    li.textContent = `${user}: ${decrypted}`;
    document.getElementById("ChatMessages").appendChild(li);
});

connection.on("ChatFull", function () {
    alert("This chat full. Please try again later.");
});

// On DOM load
document.addEventListener("DOMContentLoaded", function() {
    initializeEncryption()
        .then(() => connection.start())
        .catch(err => console.error(err.toString()));

    const sendButton = document.getElementById("SendMessageBtn");
    if (sendButton) {
        sendButton.addEventListener("click", SendMessage);
    }
});

// Generate a cryptographically strong random key
function generateRandomKey(length = 32) {
    const randomValues = new Uint8Array(length);
    window.crypto.getRandomValues(randomValues);
    return Array.from(randomValues)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
}

// KDF function to derive a stronger key
function deriveKey(baseKey, salt = "ChatSalt123") {
    // PBKDF2 with 1000 iterations and 256-bit key
    const key = CryptoJS.PBKDF2(
        baseKey,
        salt,
        {
            keySize: 256/32,  // 256 bits
            iterations: 1000,
            hasher: CryptoJS.algo.SHA256
        }
    );

    return CryptoJS.enc.Base64.stringify(key);
}

// Fetch encryption config and store in sessionStorage
async function initializeEncryption() {
    try {
        const response = await fetch('/api/Encryption/getEncryptionConfig');
        const encryptionConfig = await response.json();

        // Use KDF to derive a stronger key from the provided key
        const derivedKey = deriveKey(encryptionConfig.key);
        setSessionKey(derivedKey);
        setSessionIV(encryptionConfig.iv);

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
    document.getElementById("Message").value = "";
}

// Helper function for session storage - now using random key generation
function getOrCreateKey() {
    let key = sessionStorage.getItem("chatKey");
    if (!key) {
        // Generate a random base key
        const randomBaseKey = generateRandomKey();
        // Apply KDF to further strengthen the random key
        key = deriveKey(randomBaseKey);
        // Store the derived key
        sessionStorage.setItem("chatKey", key);
    }
    return key;
}

// Enhanced encryption
function EncryptMessage(message) {
    try {
        const key = getSessionKey();
        const iv = CryptoJS.enc.Base64.parse(sessionStorage.getItem("encryptionIV"));
        const encrypted = CryptoJS.AES.encrypt(message, key, { iv: iv }).toString();
        console.log(encrypted);
        return encrypted;
    } catch (err) {
        console.error("Encryption failed:", err);
        return null;
    }
}

function DecryptMessage(encryptedMessage) {
    console.log("encrypted message is:", encryptedMessage);
    try {
        const keyStr = sessionStorage.getItem("encryptionKey");
        const key = getSessionKey();
        const ivStr = sessionStorage.getItem("encryptionIV");
        const iv = CryptoJS.enc.Base64.parse(ivStr);
        // Decrypt in separate steps to identify where it fails
        const decryptedBytes = CryptoJS.AES.decrypt(encryptedMessage, key, { iv: iv });
        const decryptedStr = decryptedBytes.toString(CryptoJS.enc.Utf8);
        return decryptedStr;
        
    } catch (err) {
        console.error("Decryption failed:", err);
        return "Error decrypting message: " + err.message;
    }
}