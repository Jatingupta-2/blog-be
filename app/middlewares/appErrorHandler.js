const response= require('./../libs/responseLib');

let errorHandler=(err,req,res,next)=>{
    console.log("Application error Handler");
    console.log(err);
    let apiResponse=response.generate(true,"Error at Global Level",500,null);
    res.send(apiResponse);
}

let notFoundHandler=(req,res,next)=>{
    console.log('Not Found Handler');
    let apiResponse=response.generate(true,"Route Not Found",404,null);
    res.status(404)
    .send(apiResponse);
}

module.exports={
    globalErrorHandler:errorHandler,
    globalNotFoundHandler:notFoundHandler
}