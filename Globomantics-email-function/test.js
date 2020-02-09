var handler = require("./index")

handler.handler({
    clientEmail:'pocinertili@gmail.com',
    emailSubject: 'AWS Step Functions Report',
    emailBody:'This report was generated using aws step functions and lambda functions',
    emailFile: "https://globomantics-data.s3.amazonaws.com/9ArFRH2iNdv6lyN.pdf"
},null,function(err,data){

    console.log('err', err)
    console.log('data', data)
})