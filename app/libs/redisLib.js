const check= require('./checkLib');
const redis= require('redis');

let client=redis.createClient('redis://me:rPmbH1VzuqVRS3xWpN4Ac6560PsoLpuq@redis-13098.c11.us-east-1-2.ec2.cloud.redislabs.com:13098');

client.on('connect',()=>{
    console.log("connected to Redis");
})

let getAllUsersInHash=(hashName,callback)=>{
    client.hgetall(hashName,(err,result)=>{
        if(err){

            console.log('Error')
            callback(err,result);
        }
        else if(check.isEmpty(result)){

            console.log('Online user list is empty');
            console.log(result);
            callback(null,{})
        }
        else{

            console.log(result);
            callback(null,result);
        }
    })
}

let setANewOnlineUserInHash = (hashName,key,value,callback)=>{

    client.HMSET(hashName,[
        key,value
    ],(err,result)=>{
        if (err) {
            console.log(err);
            callback(err, null)
        } else {

            console.log("user has been set in the hash map");
            console.log(result)
            callback(null, result)
        }
    })
}

let deleteUserFromHash=(hashName,key)=>{
    client.HDEL(hashName,key);
    return  true;

}

module.exports={
    getAllUsersInHash:getAllUsersInHash,
    setANewOnlineUserInHash:setANewOnlineUserInHash,
    deleteUserFromHash:deleteUserFromHash
}