
const AWS = require('aws-sdk');
const AmazonS3URI = require('amazon-s3-uri')
const Secrets = require('./secrets').secrets
const fs = require('fs')
const crypto = require('crypto');
const algorithm = 'aes-256-ctr';
let key = 'MySuperSecretKey';
key = crypto.createHash('sha256').update(String(key)).digest('base64').substr(0, 32);


var s3 = new AWS.S3(
//     {
//     accessKeyId: Secrets.SecretId,
//     secretAccessKey: Secrets.SecretKey
// }
);
exports.handler = (event, context, callback) => {

        try {
            const { region, bucket, key } = AmazonS3URI(event.reportFile)

            getReportFile(bucket, key).then(data => {
                console.log('s3 data', data)
                var encrypted = encrypt(data);
                uploadEncryptedFile(encrypted, bucket).then(encryptedUri => {
                    callback(null, encryptedUri)
                })
            });
        }
        catch (err) {
            callback(err)
        }

}

        function encrypt (buffer) {
            // Create an initialization vector
            const iv = crypto.randomBytes(16);
            // Create a new cipher using the algorithm, key, and iv
            const cipher = crypto.createCipheriv(algorithm, key, iv);
            // Create the new (encrypted) buffer
            const result = Buffer.concat([iv, cipher.update(buffer), cipher.final()]);
            return result;
        }
        function decrypt (encrypted) {
            // Get the iv: the first 16 bytes
            const iv = encrypted.slice(0, 16);
            // Get the rest
            encrypted = encrypted.slice(16);
            // Create a decipher
            const decipher = crypto.createDecipheriv(algorithm, key, iv);
            // Actually decrypt it
            const result = Buffer.concat([decipher.update(encrypted), decipher.final()]);
            return result;
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

        function uploadEncryptedFile(input, bucket) {
            return new Promise((resolve, reject) => {
                const fileUploadParams = {
                    Bucket: bucket,
                    Key: randomId(15) + '-encrypted.pdf',
                    Body: new Buffer(input)
                };
                s3.upload(fileUploadParams, function (err, data) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        resolve(data.Location)
                    }
                });
            })
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
