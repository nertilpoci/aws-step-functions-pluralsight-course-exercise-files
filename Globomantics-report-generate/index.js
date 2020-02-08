var pdf = require('pdf-lib')
const PDFDocument = pdf.PDFDocument;
const StandardFonts = pdf.StandardFonts;
const rgb = pdf.rgb;
const AWS = require('aws-sdk');
const fs = require('fs')
const Secrets = require('../secrets').secrets



var s3 = new AWS.S3({
    accessKeyId: Secrets.SecretId,
    secretAccessKey: Secrets.SecretKey
});
var BUCKET_NAME = "globomantics-data";
exports.handler =  (event, context, callback) => {

    try {

     createPdf().then(res=>{
        const fileUploadParams = {
            Bucket: BUCKET_NAME,
            Key: randomId(15) + '.pdf',
            Body: new Buffer(res)
        };
        s3.upload(fileUploadParams, function (err, data) {
            if (err) {
                callback(err)
            }
            else {
                callback(null, data.Location)
            }
        });
        })
       
    }
    catch (err) {
        callback(err)
    }
};
async function createPdf() {
    const pdfDoc = await PDFDocument.create()

    // Embed the Times Roman font
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)

    // Add a blank page to the document
    const page = pdfDoc.addPage()

    // Get the width and height of the page
    const { width, height } = page.getSize()

    // Draw a string of text toward the top of the page
    const fontSize = 30
    page.drawText('This is an unencrypted report', {
        x: 50,
        y: height - 4 * fontSize,
        size: fontSize,
        font: timesRomanFont,
        color: rgb(0, 0.53, 0.71),
    })
    return await pdfDoc.save()


}
function base64_decode(base64str, file) {
    // create buffer object from base64 encoded string, it is important to tell the constructor that the string is base64 encoded
    var bitmap = new Buffer(base64str, 'base64');
    // write buffer to file
    fs.createWriteStream(file, bitmap);
    console.log('******** File created from base64 encoded string ********');
}
function randomId(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
