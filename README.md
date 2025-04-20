# Solution to sercure chat

## Scope  
(coppied from project discription)  
Your solution should allow two-people to communicate with each other without the risk of eavesdropping. Group chats, where more than two people send/receive messages at a time, is out scope.

Bonus if your application allows for near real-time communication. It can be achieved with WebSocket, socket.io, SignalR, TCP-socket, using a message queue or so on.

I don’t expect the UI to look fancy. A simple unstyled HTML page, plain GUI or CLI/TUI is fine. The only requirement regarding UI is that it should be obvious how to use it.

## User scenario
Two agents uses the chat for discussing confidential infiltration tactics in a secure web area.  

## Setup for solution

1. After downloading the project go into your prefered IDE.   
2. In the IDE locate the terminal and go to the folder **SSDChat_SignalR**
3. And when the folder is located run the commman  **dotnet run**
4. This commnand will give a localhost url which is used to host the chat.

## App in use 
After the connection is setup use any browser to display the chat.  
Then connect to the same URL in a new tab.  
![image](https://github.com/user-attachments/assets/aee75776-db21-4014-b35a-350d16ef519c)  
These two windows can now safely chat with eachother.  
![image](https://github.com/user-attachments/assets/9c1db473-a994-4322-8ded-f863cec27790)  
  

## What security measures are used in this chat  
  
1. AES Encryption
Each message is encrypted and decrypted using AES encryption in CBC mode(chipher block chaining) to ensure cipher text uniqueness with the use of IV(Initialization Vector). 

2. Dynamic/random IVs
By using a random IV generator for each message and by the IV being prepended to the ciphertext so a receiver can extract and use it for decryption strengens overall message-encryption.
 
3. Sessions-baed Keys and IV storage
By using session-based keys it limit possible exposure for XSS attacks.

4. Secure key Fetching
By fetching encryption key from a secure endpoint and by keeping key delivery spearate from code execution it lessen possible risks.

5. Fallback Loggin setup 
By setting places when is the application fail it will give a specifiv respone it will ease future reperation of any errors.  

6. Controlled Signalr hub connection
By setting up he chat hub son only a limited amount of people can access and with no harcoded credentials it chech any risk for possible abuse.  

## End notes  
There are still more which could be done for a better system.  
The usabile is limited with the lack of chat history




