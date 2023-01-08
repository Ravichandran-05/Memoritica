require('dotenv').config()
const fs = require('fs')
const S3 = require('aws-sdk/clients/s3')


const bucketName = process.env.bucketName
const region = process.env.bucketRregion
const accessKeyId = process.env.accessKey
const secretAccessKey = process.env.secretAccessKey

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey
})

// uploads a file to s3
function uploadFile(file) {
  
  const fileStream = fs.createReadStream(file.path)
 console.log("its working")
 console.log(bucketName)
 console.log("its working 2")
  const uploadParams = {
    Bucket: bucketName,
    Body: fileStream,
    Key: file.filename,
    s3BucketEndpoint: false,
    endpoint: "https://memoritica.herokuapp.com/"
  }
  
  return s3.upload(uploadParams).promise()
}
exports.uploadFile = uploadFile


// downloads a file from s3
function getFileStream(fileKey) {
  const downloadParams = {
    Key: fileKey,
    Bucket: bucketName
  }

  return s3.getObject(downloadParams).createReadStream()
}
exports.getFileStream = getFileStream




