const AWS = require('aws-sdk');
const AmazonS3URI = require('amazon-s3-uri')
const Secrets = require('./secrets').secrets
const fs = require('fs')

var s3 = new AWS.S3(
    // {
    //     accessKeyId: Secrets.SecretId,
    //     secretAccessKey: Secrets.SecretKey
    // }
);
exports.handler = (event, context, callback) => {

    try {
        if (!event.files) {
            callback(null)
            return;
        }

        let files = null;
        var isArray = Array.isArray(event.files);
        if (!isArray) {
            files = Object.keys(event.files).map((key) => {
                return event.files[key]
            });
        }
        else {
            files = event.files;
        }
        console.log('files', files)

        const params = {
            Bucket: '',
            Delete: {
                Objects: [],
                }
        };
        files.forEach(file => {
            const { region, bucket, key } = AmazonS3URI(file)
            params.Bucket=bucket;
            params.Delete.Objects.push({
                Key: key
            })
        });
        
        
        s3.deleteObjects(params, (err, data) => {
            if(err) callback(err)
            else callback(null,data)
        
       });

    }
    catch (err) {
        callback(err)
    }

}


