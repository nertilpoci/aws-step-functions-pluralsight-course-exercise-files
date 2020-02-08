var handler = require("./index")

console.log('handler',handler)
handler.handler(null,null,function(err,data){

    console.log('err', err)
    console.log('data', data)
})