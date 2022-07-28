const AWS = require("aws-sdk");
var rekognition = new AWS.Rekognition({ region: "us-east-1" });

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

const createCollection = async (collectionName) => {
  try {
    console.log(`Creating collection: ${collectionName}`);
    const data = await rekogClient.send(
      new CreateCollectionCommand({ CollectionId: collectionName })
    );
    console.log("Collection ARN:");
    console.log(data.CollectionARN);
    console.log("Status Code:");
    console.log(String(data.StatusCode));
    console.log("Success.", data);
    return data;
  } catch (err) {
    console.log("Error", err.stack);
  }
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
  const collectionName = parsedData.collectionName;
  const imageName = filePath.split("/")[filePath.split("/").length - 1];

  let buf = Buffer.from(encodedImage, "base64");
  const data = {
    Key: imageName,
    Body: buf,
    ContentEncoding: "base64",
    ContentType: "image/jpeg",
  };

  console.log(data);
  s3.putObject(data, async (err, data) => {
    if (err) {
      console.log("Error uploading data: ", data);
      callback(err, null);
    } else {
      // console.log("success", data);

      // rekognition.createCollection(
      //   {
      //     CollectionId: collectionName,
      //   },

      //   (err, data) => {
      //     console.log({ responseData: data, error: err });
      //   }
      // );

      rekognition.listCollections((err, data) => {
        console.log({ listdata: data, error: err });
      });

      // console.log({
      //   collectionName,
      //   collectionList: collectionList,
      // });

      var params = {
        CollectionId: collectionName,
        ExternalImageId: "pratik",
        Image: {
          S3Object: {
            Bucket: bucketDetails.Bucket,
            Name: imageName,
          },
        },
      };
      rekognition.indexFaces(params, (err, data) => {
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

// module.exports.createCollection = () => {
// };
