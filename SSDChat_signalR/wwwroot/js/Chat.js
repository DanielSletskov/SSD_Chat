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
    console.log("Received message");
    const decrypted = DecryptMessage(encryptedMsg);
    const li = document.createElement("li");
    li.textContent = `${user}: ${decrypted}`;
    document.getElementById("ChatMessages").appendChild(li);
    connection.on("ChatFull", function () {
        alert("This chat is limited to two users only. Please try again later.");
    });
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

// Fetch encryption config and store in sessionStorage
async function initializeEncryption() {
    try {
        const response = await fetch('/api/Encryption/getEncryptionConfig');
        const encryptionConfig = await response.json();

        setSessionKey(encryptionConfig.key);
        setSessionIV(encryptionConfig.iv); // Optional if you're using dynamic IVs

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

function EncryptMessage(message) {
    const key = getSessionKey();
    if (!key) {
        console.error("Encryption key not found in sessionStorage.");
        return null;
    }

    const newIV = CryptoJS.lib.WordArray.random(16);

    const encrypted = CryptoJS.AES.encrypt(message, key, {
        iv: newIV,
        mode: CryptoJS.mode.CBC
    });

    const ivAndEncryptedMessage = newIV.concat(encrypted.ciphertext);
    return CryptoJS.enc.Base64.stringify(ivAndEncryptedMessage);
}

function DecryptMessage(ciphertext) {
    const key = getSessionKey();
    if (!key) {
        console.error("Encryption key not found in sessionStorage.");
        return null;
    }

    const ivAndEncryptedMessage = CryptoJS.enc.Base64.parse(ciphertext);

    const iv = CryptoJS.lib.WordArray.create(
        ivAndEncryptedMessage.words.slice(0, 4),
        16
    );

    const encryptedMessage = CryptoJS.lib.WordArray.create(
        ivAndEncryptedMessage.words.slice(4),
        ivAndEncryptedMessage.sigBytes - 16
    );

    const cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: encryptedMessage
    });

    const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
}