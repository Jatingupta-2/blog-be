const socket=io('http://localhost:3000');

const authToken='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RpZCI6Il9VbXNzbnVNRCIsImlhdCI6MTU1MTYzOTUzNTg1MiwiZXhwIjoxNTUxNzI1OTM1LCJzdWIiOiJhdXRoVG9rZW4iLCJpc3MiOiJqYXRpbiIsImRhdGEiOnsibW9iaWxlTnVtYmVyIjo5ODcsImVtYWlsIjoiamF0aW4zQGdtYWlsLmNvbSIsImxhc3ROYW1lIjoiIiwiZmlyc3ROYW1lIjoiSmF0aW4iLCJ1c2VySWQiOiJQZWp0V2ZkOXQifX0.zRzWlVlNgxKM21KDzsMC9Zec-3ny-Ay16K2RQjKv62k';
const userId='PejtWfd9t';


let chatMessage={
    createdOn:Date.now(),
    receiverId:'n8w-4P1JY',
    senderId:'PejtWfd9t',
    senderName:'Jatin'
}
let chatSocket=()=>{
    
    
    socket.on('verifyUser',(data)=>{
        console.log('Socket trying to verify user');
        socket.emit('set-user',authToken);
    })
    
    
    socket.on(userId,(data)=>{
        console.log('message received from '+data.senderName);
        console.log(data.message);
    })


    socket.on("online-user-list",(data)=>{
        console.log("Online user list is updated.Someone went online/Offline")
        console.log(data);
    })


    socket.on("typing",(data)=>{
        console.log(data+" is typing");
    })


    $("#send").on('click',function(){
        let messageText=$("#messageToSend").val()
        chatMessage.message=messageText;
        socket.emit("chat-msg",chatMessage)
    })

    $('#messageToSend').on('keypress',function(){
        socket.emit("typing","Jatin")
    })
}
chatSocket();