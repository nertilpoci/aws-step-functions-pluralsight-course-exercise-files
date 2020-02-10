


const AWS = require('aws-sdk');
const AmazonS3URI = require('amazon-s3-uri')
const Secrets = require('./secrets').secrets
const fs = require('fs')
var nodemailer = require('nodemailer');

var s3 = new AWS.S3(
    {
        accessKeyId: Secrets.SecretId,
        secretAccessKey: Secrets.SecretKey
    }
);
exports.handler = (event, context, callback) => {

    try {
        const { region, bucket, key } = AmazonS3URI(event.emailFile)

        getReportFile(bucket, key).then(file => {


            SendEmail(event.clientEmail, event.emailSubject, event.emailBody,
                [{
                    filename: 'MonthlyReport.pdf',
                    content: file
                }
                ]
            ).then(result => {
                callback(null)
            })
        })

    }
    catch (err) {
        callback(err)
    }

}

async function getReportFile(bucket, key) {

    return new Promise((resolve, reject) => {
        try {
            const params = {
                Bucket: bucket,
                Key: key
            };
            s3.getObject(params, (err, data) => {
                resolve(data.Body)
            });
        }
        catch (err) {
            reject(err)
        }
    })

}

function SendEmail(email, subject, body, attachments) {
    return new Promise((resolve, reject) => {

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: Secrets.EmailUser,
                pass: Secrets.EmailPassword
            }
        });

        var mailOptions = {
            from: Secrets.EmailUser,
            to: email,
            subject: subject,
            text: body,
            attachments: attachments
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                reject(error)
            } else {
                console.log('Email sent: ' + info.response);
                resolve(info)
            }
        });
    })
}

