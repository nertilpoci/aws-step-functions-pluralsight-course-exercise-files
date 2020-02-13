var handler = require("./index")

handler.StartActivity({
    reportFile: "https://globomantics-data.s3.amazonaws.com/9ArFRH2iNdv6lyN.pdf"
},null,function(err,data){

    console.log('err', err)
    console.log('data', data)
})