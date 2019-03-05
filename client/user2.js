const socket=io('http://localhost:3000');

const authToken='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RpZCI6Imd0bWV0UmpCdCIsImlhdCI6MTU1MTYzOTU3NzU0NiwiZXhwIjoxNTUxNzI1OTc3LCJzdWIiOiJhdXRoVG9rZW4iLCJpc3MiOiJqYXRpbiIsImRhdGEiOnsibW9iaWxlTnVtYmVyIjo5ODcsImVtYWlsIjoicmFuZG9tMUBnbWFpbC5jb20iLCJsYXN0TmFtZSI6IiIsImZpcnN0TmFtZSI6InJhbmRvbSIsInVzZXJJZCI6Im44dy00UDFKWSJ9fQ.NbCMLE7QqYBVuqBTFtGpvDSI201Z7jFI2m4mpI2ATxQ'
const userId='n8w-4P1JY';


let chatMessage={
    createdOn:Date.now(),
    receiverId:'PejtWfd9t',
    senderId:'n8w-4P1JY',
    senderName:'Random'
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
        socket.emit("typing","random")
    })
}
chatSocket();