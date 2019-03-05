
const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('./../libs/timeLib');
const response = require('./../libs/responseLib');
const logger = require('./../libs/loggerLib');
const validatInput = require('./../libs/paramsValidationLib');
const check = require('./../libs/checkLib');
const passwordLib = require('./../libs/generatePasswordLib');

const token = require('../libs/tokenLib');
const authModel = mongoose.model('Auth');

const userModel = mongoose.model('User');

let getAllUser = (req, res) => {
    userModel.find()
        .select('-__v -_id')
        .lean()
        .exec((err, result) => {
            if (err) {
                console.log(err)
                logger.error(err.message, 'User Controller: getAllUser', 10)
                let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                res.send(apiResponse)
            }
            else if (check.isEmpty(result)) {
                logger.error('null', 'User Controller: getAllUser', 10)
                let apiResponse = response.generate(true, 'No user found', 500, null)
                res.send(apiResponse)
            }
            else {
                let apiResponse = response.generate('false', 'All Details', 200, result)
                res.send(apiResponse);
            }
        })
}

let getSingleUser = (req, res) => {
    userModel.findOne({ 'userId': req.params.userId })
        .select('-password -__v -_id')
        .lean()
        .exec((err, result) => {
            if (err) {
                console.log(err)
                logger.error(err.message, 'User Controller: getSingleUser', 10)
                let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                res.send(apiResponse)
            }
            else if (check.isEmpty(result)) {
                logger.error(err.message, 'User Controller: getSingleUser', 10)
                let apiResponse = response.generate(true, 'No user found', 500, null)
                res.send(apiResponse)
            }
            else {
                let apiResponse = response.generate('false', 'All getSingleUser', 200, result)
                res.send(apiResponse);
            }
        })
}

let deleteUser = (req, res) => {
    userModel.remove({ 'userId': req.params.userId })
        .exec((err, result) => {
            if (err) {
                console.log(err)
                logger.error(err.message, 'User Controller: deleteUser', 10)
                let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                res.send(apiResponse)
            }
            else if (check.isEmpty(result)) {
                logger.error(err.message, 'User Controller: deleteUser', 10)
                let apiResponse = response.generate(true, 'No user found', 500, null)
                res.send(apiResponse)
            }
            else {
                let apiResponse = response.generate('false', 'All deleteUser', 200, result)
                res.send(apiResponse);
            }
        })
}

let editUser = (req, res) => {
    let options = req.body
    userModel.update({ 'userId': req.params.userId }, options, { multi: true })
        .exec((err, result) => {
            if (err) {
                console.log(err)
                logger.error(err.message, 'User Controller: editUser', 10)
                let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                res.send(apiResponse)
            }
            else if (check.isEmpty(result)) {
                logger.error(err.message, 'User Controller: editUser', 10)
                let apiResponse = response.generate(true, 'No user found', 500, null)
                res.send(apiResponse)
            }
            else {
                let apiResponse = response.generate('false', ' editUser', 200, result)
                res.send(apiResponse);
            }
        })
}

let signUpFunction = (req, res) => {


    let validateUserInput = () => {
        return new Promise((resolve, reject) => {
            if (req.body.email) {
                if (!validatInput.email(req.body.email)) {
                    let apiResponse = response.generate(true, 'Email does not meet Criteria', 400, null)
                    reject(apiResponse);
                }
                else if (check.isEmpty(req.body.password)) {
                    let apiResponse = response.generate(true, 'Password is missing', 400, null)
                    reject(apiResponse);
                }
                else {
                    resolve(req);
                }
            }
            else {
                logger.error('Field Missing During User Creation', 'userController: createUser()', 5)
                let apiResponse = response.generate(true, 'One or More Parameter(s) is missing', 400, null)
                reject(apiResponse);
            }
        })
    }// end validation

    let createUser = () => {
        return new Promise((resolve, reject) => {
            userModel.findOne({ 'email': req.body.email })
                .exec((err, retrievedDetails) => {
                    if (err) {
                        logger.error(err.message, 'userController:Create User', 500, null)
                        let apiResponse = response.generate(true, 'Failed to create', 500, null);
                        return apiResponse;
                    }
                    else if (check.isEmpty(retrievedDetails)) {
                        console.log(req.body);
                        let newUser = new userModel({
                            userId: shortid.generate(),
                            firstName: req.body.firstName,
                            lastName: req.body.lastName || '',
                            email: req.body.email.toLowerCase(),
                            mobileNumber: req.body.mobileNumber,
                            password: passwordLib.hashPassword(req.body.password),
                            createdOn: Date.now()
                        })

                        newUser.save((err, result) => {
                            if (err) {
                                console.log(err);
                                logger.error(err.message, 'UserController:create User', 10)
                                let apiResponse = response.generate(true, 'Failed to create new user', 500, null);
                                reject(apiResponse);
                            }
                            else {
                                let newObj = result.toObject();
                                resolve(newObj);
                            }
                        })
                    }
                    else {
                        logger.error('', 'userController: createUser', 10)
                        let apiResponse = response.generate(true, 'User already exists', 403, null)
                        reject(apiResponse)

                    }
                })
        })
    }//end create user

    validateUserInput(req,res)
    .then(createUser)
    .then((resolve)=>{
        delete resolve.password;
        let apiResponse=response.generate(false,'User created',200,resolve)
        res.send(apiResponse);

    })
    .catch((err)=>{
        console.log(err);
        res.send(err);
    })
}

let loginFunction=(req,res)=>{


    let findUser=()=>{
        return new Promise((resolve,reject)=>{
            if(req.body.email){
                console.log('Email present');
                console.log(req.body);
                userModel.findOne({'email':req.body.email})
                .exec((err,result)=>{
                    if(err){
                        console.log(err)
                        logger.error('Failed To Retrieve User Data', 'userController: findUser()', 10)
                        /* generate the error message and the api response message here */
                        let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                        reject(apiResponse)
                    }
                    else if(check.isEmpty(result)){
                        logger.error('No User Found', 'userController: findUser()', 7)
                        let apiResponse = response.generate(true, 'No User Details Found', 404, null)
                        reject(apiResponse)
                    }
                    else{
                        logger.info('User Found','userController: findUser()',10);
                        resolve(result);
                    }
                })
            }
            else{
                logger.error('No email found','UserController:Find User',10)
                let apiResponse = response.generate(true, 'No Email Details Found', 404, null)
                reject(apiResponse)
            }
        })
    }//end find user


    let validatePassword=(retrievedUserDetails)=>{
        console.log('validating password');
        return new Promise((resolve,reject)=>{
            passwordLib.comparePassword(req.body.password,retrievedUserDetails.password,(err,isMatch)=>{
                if(err){
                    console.log(err)
                    logger.error(err.message, 'userController: validatePassword()', 10)
                    let apiResponse = response.generate(true, 'Login Failed', 500, null)
                    reject(apiResponse)
                }
                else if(isMatch){

                    let retrievedUserDetailsObj=retrievedUserDetails.toObject();
                    delete retrievedUserDetailsObj.password
                    delete retrievedUserDetailsObj.__v
                    delete retrievedUserDetailsObj._id
                    delete retrievedUserDetailsObj.createdOn
                    delete retrievedUserDetailsObj.modifiedOn
                    resolve(retrievedUserDetailsObj);
                }
                else{
                    logger.info('Login Failed Due To Invalid Password', 'userController: validatePassword()', 10)
                    let apiResponse = response.generate(true, 'Wrong Password.Login Failed', 400, null)
                    reject(apiResponse)
                }
            })
        })
    }// end validate password

    let generateToken=(userDetails)=>{
        console.log('Generating token');
        console.log(userDetails);
        return new Promise((resolve,reject)=>{
            token.generateToken(userDetails,(err,tokenDetails)=>{
                if(err){
                    console.log('Error');
                    let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                    reject(apiResponse)
                }
                else{
                    tokenDetails.userId=userDetails.userId
                    tokenDetails.userDetails=userDetails
                    resolve(tokenDetails);
                }
            })
        })
    }//end generate token


    let saveToken=(tokenDetails)=>{
        console.log('Saving token');
        return new Promise((resolve,reject)=>{
            authModel.findOne({'userId':tokenDetails.userId},(err,retrievedTokenDetails)=>{

                if (err){
                    console.log(err.message, 'userController: saveToken', 10)
                    let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                    reject(apiResponse)
                }
                else if(check.isEmpty(retrievedTokenDetails)){
                    let newAuthToken= new authModel({
                        userId:tokenDetails.userId,
                        authToken:tokenDetails.token,
                        tokenSecret:tokenDetails.tokenSecret,
                        tokenGenerationTime:time.now()
                    })

                    newAuthToken.save((err,result)=>{
                        if(err){
                            logger.error(err.message, 'userController: saveToken', 10)
                            let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                            reject(apiResponse)
                        }
                        else{

                            let responseBody={
                                authToken:result.authToken,
                                userDetails:tokenDetails.userDetails
                            }
                            resolve(responseBody)
                        }
                    })
                }

                else{
                    retrievedTokenDetails.authToken=tokenDetails.token;
                    retrievedTokenDetails.tokenSecret=tokenDetails.tokenSecret
                    retrievedTokenDetails.tokenGenerationTime=time.now()
                    retrievedTokenDetails.save((err,newTokenDetails)=>{
                        if (err) {
                            logger.error(err.message, 'userController: saveToken', 10)
                            let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                            reject(apiResponse)
                        }
                        else {
                            let responseBody={
                                authToken:newTokenDetails.authToken,
                                userDetails:tokenDetails.userDetails
                            }
                            resolve(responseBody);}
                    })
                }
            })
        })
    }//end save token

    findUser(req,res)
    .then(validatePassword)
    .then(generateToken)
    .then(saveToken)
    .then((resolve)=>{
        let apiResponse=response.generate(false,'Login Successful',200,resolve)
        res.send(apiResponse)
    })
    .catch((err)=>{
        console.log(err);
        res.status(err.status)
        res.send(err)
    })
}//end login function


let logout=(req,res)=>{
    authModel.remove({userId:req.params.userId},(err,result)=>{
        if (err) {
            console.log(err)
            logger.error(err.message, 'user Controller: logout', 10)
            let apiResponse = response.generate(true, `error occurred: ${err.message}`, 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            let apiResponse = response.generate(true, 'Already Logged Out or Invalid UserId', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'Logged Out Successfully', 200, null)
            res.send(apiResponse)
        }
    })
}

module.exports={
    getAllUser:getAllUser,
    getSingleUser:getSingleUser,
    deleteUser:deleteUser,
    editUser:editUser,
    signUpFunction:signUpFunction,
    loginFunction:loginFunction,
    logout:logout
}