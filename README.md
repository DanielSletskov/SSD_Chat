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
3. In the IDE locate the terminal and go to the folder **SSDChat_SignalR**  
4. And when the folder is located run the commman  **dotnet run**  
5. This commnand will give a localhost url which is used to host the chat.  
  
## App in use  
After the connection is setup use any browser to display the chat.  
Then connect to the same URL in a new tab.  
These two windows can now safely chat with eachother.  
There was added a test in the upper right corner which turn gren when the two users are connected and can safly chat.   
  
![image](https://github.com/user-attachments/assets/c4a6d3a8-0bc9-44c0-b692-adbe3010d0e9)
  
## What security measures are used in this chat  
It was chosen to use a razor webapplication for the 
  
1. Diffie-Hellman key Exhange  
  Purpose: Serure exchange of shared secret over a possible untrusted channel   
2. AES Encryption with SHA-256 derivedkey  
  Purpose: Encrypts message before sending.  
3. Use of crypto.getRandomalues  
  Purpose: Generates a secure random amount of numbers for key generation.  
4. Initialization Vector (IV): The encryption uses IVs stored in session storage for AES encryption.
  Purpose: Enhances the quality of the encryption.   
5. SignalR chathub access limitation: The application limits the number of users allowed in a hub (2 in this instance)
  Purpose: Limts how many is allowed in the chathub.  
6. Session storage for keys: Encryption keys and IVs are stored in the browser's sessionStorage, which persists only for the current session and is cleared when the browser closes.
  Purpose:  Keeps the encryption materiaal påer-session in the browser memmory.   
8. SignalR event handling.
  Purpose: Makes a safe public key exchange to garanty a secure before messages can be send.  

