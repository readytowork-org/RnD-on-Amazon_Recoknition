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

module.exports.uploadFile = async (event, context) => {
  let request = event.body;
  let jsonData = JSON.parse(request);
  let base64String = jsonData.base64String;
  let buffer = Buffer.from(base64String, "base64");
  let fileMime = fileType(buffer);

  if (fileMime == null) {
    return context.fail("The string supplied is not a file type.");
  }

  let file = getFile(fileMime, buffer);
  //Extract file info in getFile
  //File.params would have
  //{'params': params,uploadFile': uploadFile};
  let params = file.params;

  await s3.putObject(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        url: `${file.uploadFile.full_path}`,
      },
      null,
      2
    ),
  };
};
