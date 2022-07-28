const AWS = require("aws-sdk");
var rekognition = new AWS.Rekognition();
var s3 = new AWS.S3({ params: { Bucket: process.env.BUCKET } });

module.exports.getAllFiles = async (event, context) => {
  let files = [];

  let params = {
    Bucket: process.env.BUCKET /* required */,
    Prefix: "upload",
  };

  let result = await s3.listObjectsV2(params).promise();

  let data = result.Contents;
  Object.keys(data).forEach((key, index) => {
    let fileObject = data[key];

    files.push(
      `https://${result.Name}.s3.us-east-2.amazonaws.com/${fileObject.Key}`
    );
  });

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        files: files,
        bucketName: `${result.Name}`,
        subFolder: `${result.Prefix}`,
      },
      null,
      2
    ),
  };
};

module.exports.uploadFile = (event, context, callback) => {
  let bucketDetails = {
    Bucket: process.env.BUCKET /* required */,
    Prefix: "upload",
  };
  console.log(JSON.parse(event.body));

  let parsedData = JSON.parse(event.body);

  let encodedImage = parsedData.Image;
  const filePath = parsedData.name;
  const imageName = filePath.split("/")[filePath.split("/").length - 1];

  let buf = Buffer.from(encodedImage, "base64");
  const data = {
    Key: imageName,
    Body: buf,
    ContentEncoding: "base64",
    ContentType: "image/jpeg",
  };

  console.log(data);
  s3.putObject(data, (err, data) => {
    if (err) {
      console.log("Error uploading data: ", data);
      callback(err, null);
    } else {
      console.log("success", data);
      // var params = {
      //   Image: {
      //     S3Object: {
      //       Bucket: bucketDetails.Bucket,
      //       Name: `${new Date()},${imageName}`,
      //     },
      //   },
      //   MaxLabels: 10,
      //   MinConfidence: 90,
      // };
      // rekognition.detectLabels(params, (err, data) => {
      //   if (err) {
      //     console.log("detectLabels", err, err.stack);
      //     callback(err);
      //   } else {
      //     console.log("detectLabels", data);
      //     callback(null, data);
      //   }
      // });
      var params = {
        CollectionId: "face-collection",
        DetectionAttributes: [],
        ExternalImageId: imageName,
        Image: {
          S3Object: {
            Bucket: bucketDetails.Bucket,
            Name: `${new Date()},${imageName}`,
          },
        },
      };
      rekognition.indexFaces(params, function (err, data) {
        if (err) {
          console.log("indexFaces", err, err.stack); // an error occurred
          callback(err);
        } else {
          console.log("indexFaces", data); // successful response
          callback(null, data);
        }
      });
    }
  });
};
