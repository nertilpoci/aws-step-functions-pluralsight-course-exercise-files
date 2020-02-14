const AWS = require('aws-sdk');
const AmazonS3URI = require('amazon-s3-uri')
const Secrets = require('./secrets').secrets
const crypto = require('crypto');
const algorithm = 'aes-256-ctr';
let key = 'MySuperSecretKey';
key = crypto.createHash('sha256').update(String(key)).digest('base64').substr(0, 32);


var s3 = new AWS.S3(
    {
        accessKeyId: Secrets.SecretId,
        secretAccessKey: Secrets.SecretKey
    }
);
exports.StartActivity = async () => {
    
    let stepfunction = new AWS.StepFunctions({
        region: 'us-east-1',
        accessKeyId: Secrets.SecretId,
        secretAccessKey: Secrets.SecretKey
    });
    
    let activityArn = 'arn:aws:states:us-east-1:049827573258:activity:EncryptionActivity';


    while (true) {
        try {
            let taksData = await getActivityTask(stepfunction, activityArn);
            console.log(taksData)
            var payload = JSON.parse(taksData.input)

            const { bucket, key } = AmazonS3URI(payload.reportFile)

            getReportFile(bucket, key).then(data => {
                console.log('s3 data', data)
                var encrypted = encrypt(data);
                
                //send hearbeat
                stepfunction.sendTaskHeartbeat({taskToken: taksData.taskToken})

                uploadEncryptedFile(encrypted, bucket).then(encryptedUri => {
                    stepfunction.sendTaskSuccess(
                        {
                            output: JSON.stringify({
                                Payload: encryptedUri
                            }),
                            taskToken: taksData.taskToken
                        }, 
                        (err, data) => {
                            if (err) {
                                console.log('error', err);
                            } else {
                                console.log('success', data);
                            }
                        });

                }).catch(err => {
                    stepfunction.sendTaskFailure(
                        {
                            cause: JSON.stringify(err),
                            taskToken: this.taskToken
                        }, (err, data) => {
                            if (err) {
                                console.log('error', err);
                            } else {
                                console.log('success', data);
                            }
                        }

                    )
                })
            });
        }
        catch (err) {

        }
        await sleep(2000)
    }





}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function getActivityTask(stepfunction, activityArn) {
    return new Promise((resolve, reject) => {
        console.log('Getting Activity Task')
        stepfunction.getActivityTask({
            activityArn: activityArn
        }, (err, data) => {
            if (err) {
                console.log('Error Getting Task Data', err);
                if (err.code === 'RequestAbortedError') {
                    // In case of abort, close silently
                } else {
                    reject(err)
                }

                return;
            }
            console.log('Task Data', data)
            if (data.taskToken && typeof (data.taskToken) === 'string' && data.taskToken.length > 1) {
                resolve(data)
            }
            else {
                resolve(null)
            }
        });

    })
}

function encrypt(buffer) {
    // Create an initialization vector
    const iv = crypto.randomBytes(16);
    // Create a new cipher using the algorithm, key, and iv
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    // Create the new (encrypted) buffer
    const result = Buffer.concat([iv, cipher.update(buffer), cipher.final()]);
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


