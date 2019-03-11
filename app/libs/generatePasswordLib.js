const bcrypt= require('bcryptjs');
const saltRounds=10;

let logger=require('./loggerLib');

let hashPassword=(myPlainPassword)=>{
let salt=bcrypt.genSaltSync(saltRounds);
let hash=bcrypt.hashSync(myPlainPassword,salt);
return hash;
}

let comparePassword= (oldPassword,hashPassword,cb)=>{
    bcrypt.compare(oldPassword,hashPassword,(err,res)=>{
        if(err){
            logger.error(err.message,'Comparison Error',5)
            cb(err,null)
        }else{
            cb(null,res);
        }
    })
}

let comparePasswordSync=(myPlainPassword,hash)=>{
    return bcrypt.compareSync(myPlainPassword,hash);
}

module.exports={
    hashPassword:hashPassword,
    comparePassword:comparePassword,
    comparePasswordSync:comparePasswordSync
}