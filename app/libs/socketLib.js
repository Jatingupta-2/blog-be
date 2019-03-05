const socketio = require('socket.io');
const mongoose= require('mongoose')
const shortid= require('shortid')
const logger= require('./loggerLib')
const events= require('events')
const  eventEmitter = new events.EventEmitter();

const tokenLib= require('./tokenLib');
const check = require('./checkLib')
const response= require('./responseLib');
const ChatModel= require('./../models/Chat');

const redisLib= require('./redisLib');

let setServer=(server)=>{
    let allOnlineUsers=[];
    let io=socketio.listen(server);
    let myIo= io.of('/');

    myIo.on('connection',(socket)=>{
        console.log('On connection-emitting verify user ');
        
        
        socket.emit('verifyUser','');
        
        
        socket.on('set-user',(authToken)=>{
            console.log('set-user called');

            tokenLib.verifyClaimWithoutSecret(authToken,(err,user)=>{
                if(err){
                    socket.emit('auth-error',{ status: 500, error: 'Please provide correct auth-Token' })
                }
                else{
                    console.log('Verified');
                    let currentUser=user.data;

                    socket.userId=currentUser.userId;
                    let fullName=`${currentUser.firstName} ${currentUser.lastName}`
                    let key = currentUser.userId;
                    let value = fullName;

                    let setOnlineUser=redisLib.setANewOnlineUserInHash("OnlineUsers",key,value,(err,result)=>{
                        if(err){
                            console.log(err)
                        }
                        else{
                            redisLib.getAllUsersInHash("OnlineUsers",(err,result)=>{
                                console.log('--- inside getAllUsersInAHas function ---');
                                if (err) {
                                    console.log(err)
                                } else {
                                    console.log(`${fullName} is online`);
                                    socket.room='Jatin';
                                    socket.join(socket.room);

                                    socket.to(socket.room).broadcast.emit('online-user-list',result);
                                }
                            })
                        }
                    })


                }
            })
        })//end set-user


        socket.on('disconnect',()=>{
            console.log('Disconneted');
            console.log(socket.userId);

            if(socket.userId){
                redisLib.deleteUserFromHash('OnlineUsers',socket.userId);
                redisLib.getAllUsersInHash('OnlineUsers',(err,result)=>{
                    if(err){
                        console.log(err)
                    }
                    else{
                        socket.leave(socket.room);
                        socket.to(socket.room).broadcast.emit('online-user-list',result);
                    }
                })
            }
        })// end disconnect



        socket.on('chat-msg',(data)=>{


            console.log('Socket chat-message called');
            console.log(data);

            eventEmitter.emit('save-chat',data);

            myIo.emit(data.receiverId,data);

        })//end chat-msg


        socket.on('typing',(fullName)=>{
            socket.to(socket.room).broadcast.emit('typing', fullName);
        })//end typing


        eventEmitter.on('save-chat',(data)=>{
            let newChat = new ChatModel({
                chatId: shortid.generate(),
                senderName: data.senderName,
                senderId: data.senderId,
                receiverName: data.receiverName || '',
                receiverId: data.receiverId || '',
                message: data.message,
                chatRoom: data.chatRoom || '',
                createdOn: data.createdOn
            });
            
                newChat.save((err,result)=>{
                    if(err){
                        console.log(`error occurred: ${err}`);
                        Console.log('Error is there . Be careful');
            }
            else if(result == undefined || result == null || result == ""){
                console.log("Chat Is Not Saved.");
            }
            else{
                              
                console.log("Chat Saved.");
            console.log(result);
            }
                })
        })
    })
}

module.exports={
    setServer:setServer
}