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
These two windows can now safely chat with eachother.  
![image](https://github.com/user-attachments/assets/b86c52c0-a001-4c31-b31b-4384577a7275)

## What security measures are used in this chat  
  
1. AES Encryption - Using CryptoJS's AES implementation for encrypting messages
2. Session-based Key Storage - Storing the encryption key in the browser's sessionStorage
3. End-to-End Encryption - Messages are encrypted on the sender's device and only decrypted on the recipient's device
4. Transport Security - Assuming SignalR is running over HTTPS, which adds transport layer security

## End notes

I know the setup is the same but when I try to execute dotnet run without for moving to the specified location I get an error.  
