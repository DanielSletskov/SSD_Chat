// Configuration object to store cryptographic parameters
const cryptoConfig = {
    keySize: 32,  // Size in bytes (256 bits)
    dhParams: {
        primeHex: "FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD1" +
            "29024E088A67CC74020BBEA63B139B22514A08798E3404DD" +
            "EF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245" +
            "E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7ED" +
            "EE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3D" +
            "C2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F" +
            "83655D23DCA3AD961C62F356208552BB9ED529077096966D" +
            "670C354E4ABC9804F1746C08CA18217C32905E462E36CE3B" +
            "E39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9" +
            "DE2BCBF6955817183995497CEA956AE515D2261898FA0510" +
            "15728E5A8AACAA68FFFFFFFFFFFFFFFF",
        generatorHex: "2"
    },
    ivLength: 32,
    defaultUsername: "Anonymous",
    hubUrl: "/Hubs/ChatHub"
};

const connection = new signalR.HubConnectionBuilder()
    .withUrl(cryptoConfig.hubUrl)
    .build();

let privateKey;
let publicKey;
let sharedSecret;
let partnerPublicKey;

function updateStatus(message, isConnected = false) {
    const statusElement = document.getElementById("ConnectionStatus");
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = isConnected ? "connected" : "waiting";
    }
    console.log("Status:", message);
}

connection.on("ReceiveMessage", function (user, encryptedMsg) {
    const decrypted = DecryptMessage(encryptedMsg);
    const li = document.createElement("li");
    li.textContent = `${user}: ${decrypted}`;
    document.getElementById("ChatMessages").appendChild(li);
});

connection.on("ChatFull", function () {
    alert("This chat is full. Please try again later.");
});

connection.on("ReceivePublicKey", function (senderName, theirPublicKeyHex) {
    console.log(`Received public key from ${senderName}`);
    partnerPublicKey = theirPublicKeyHex;
    calculateSharedSecret();
    updateStatus(`Secure connection established with ${senderName}`, true);
    document.getElementById("SendMessageBtn").disabled = false;
});

document.addEventListener("DOMContentLoaded", function () {
    const sendButton = document.getElementById("SendMessageBtn");
    const messageInput = document.getElementById("Message");

    if (sendButton) {
        sendButton.disabled = true;
        sendButton.addEventListener("click", SendMessage);
    }

    if (messageInput) {
        messageInput.addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                SendMessage();
                event.preventDefault();
            }
        });
    }

    updateStatus("Initializing secure connection...");
    initializeDiffieHellman()
        .then(() => connection.start())
        .then(() => {
            console.log("Connected to SignalR Hub");
            updateStatus("Connected to server, waiting for secure key exchange...");
            const user = document.getElementById("SenderName").value || cryptoConfig.defaultUsername;
            connection.invoke("SharePublicKey", user, publicKey)
                .catch(err => console.error("Error sharing public key:", err.toString()));
        })
        .catch(err => {
            console.error("Connection failed:", err.toString());
            updateStatus("Connection failed: " + err.toString());
        });
});

function initializeDiffieHellman() {
    return new Promise((resolve) => {
        const prime = bigInt(cryptoConfig.dhParams.primeHex, 16);
        const generator = bigInt(cryptoConfig.dhParams.generatorHex, 16);

        // Generate a private key using the configured key size
        privateKey = bigInt(generateRandomHex(cryptoConfig.keySize), 16);

        // Calculate public key: g^private mod p
        publicKey = generator.modPow(privateKey, prime).toString(16);
        console.log("DH Private Key:", privateKey.toString(16));
        console.log("DH Public Key:", publicKey);
        resolve();
    });
}

function calculateSharedSecret() {
    const prime = bigInt(cryptoConfig.dhParams.primeHex, 16);
    const partnerKey = bigInt(partnerPublicKey, 16);

    const shared = partnerKey.modPow(privateKey, prime).toString(16);
    sharedSecret = shared;

    const derivedKey = CryptoJS.SHA256(shared).toString();
    const derivedIV = CryptoJS.SHA256(derivedKey).toString().substring(0, cryptoConfig.ivLength);

    sessionStorage.setItem("encryptionKey", derivedKey);
    sessionStorage.setItem("encryptionIV", derivedIV);

    console.log("Shared secret:", shared);
    console.log("Encryption Key:", derivedKey);
    console.log("IV:", derivedIV);
}

function getSessionKey() {
    const keyStr = sessionStorage.getItem("encryptionKey");
    return keyStr ? CryptoJS.enc.Hex.parse(keyStr) : null;
}

function SendMessage() {
    const user = document.getElementById("SenderName").value || cryptoConfig.defaultUsername;
    const message = document.getElementById("Message").value;

    if (!message.trim()) return;

    const encrypted = EncryptMessage(message);
    if (encrypted) {
        connection.invoke("SendMessage", user, encrypted)
            .catch(err => console.error("Error sending message:", err.toString()));

        const li = document.createElement("li");
      //  li.textContent = `${user} (You): ${message}`;
        li.className = "own-message";
        document.getElementById("ChatMessages").appendChild(li);
        document.getElementById("Message").value = "";
    }
}

function EncryptMessage(message) {
    try {
        const key = getSessionKey();
        const iv = CryptoJS.enc.Hex.parse(sessionStorage.getItem("encryptionIV"));
        const encrypted = CryptoJS.AES.encrypt(message, key, { iv: iv }).toString();
        return encrypted;
    } catch (err) {
        console.error("Encryption failed:", err);
        return null;
    }
}

function DecryptMessage(encryptedMessage) {
    console.log("Attempting to decrypt message");
    try {
        const keyStr = sessionStorage.getItem("encryptionKey");
        const ivStr = sessionStorage.getItem("encryptionIV");

        if (!keyStr || !ivStr) return "Error decrypting message: Missing key or IV.";

        const key = CryptoJS.enc.Hex.parse(keyStr);
        const iv = CryptoJS.enc.Hex.parse(ivStr);

        const decrypted = CryptoJS.AES.decrypt(encryptedMessage, key, { iv: iv });
        const plainText = decrypted.toString(CryptoJS.enc.Utf8);
        return plainText || "Error decrypting message: Empty result";
    } catch (err) {
        console.error("Decryption failed:", err);
        return "Error decrypting message: " + err.message;
    }
}

function generateRandomHex(byteLength) {
    const array = new Uint8Array(byteLength);
    window.crypto.getRandomValues(array);
    return Array.from(array)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}