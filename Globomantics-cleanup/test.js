var handler = require("./index")

handler.handler({
     "files":
      {
          "file1": "https://globomantics-data.s3.amazonaws.com/42Z7Nlg4LSdiOlA-encrypted.pdf",
          "file2": "https://globomantics-data.s3.amazonaws.com/ubKmrG1bvbUyRAT.pdf",
          "file3": "https://globomantics-data.s3.amazonaws.com/x9TaxU9DQd0bqPw-encrypted.pdf"
      }
},null,function(err,data){

    console.log('err', err)
    console.log('data', data)
})