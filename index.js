const express = require("express");
const axios = require("axios");
const AWS = require("aws-sdk");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const app = express();
const port = 3000;

// Configure AWS SDK
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

app.use(express.json());
app.use(cors());

// Endpoint to generate presigned URL
app.post("/generate-presigned-url", async (req, res) => {
  const { fileName, fileType, folder } = req.body;
  const s3Params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `${folder}/${uuidv4()}-${fileName}`,
    Expires: 60 * 5, // URL expires in 5 minutes
    ContentType: fileType,
  };

  try {
    const presignedURL = await s3.getSignedUrlPromise("putObject", s3Params);
    res.status(200).send({ presignedURL });
    console.log(presignedURL);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

// Endpoint to download file and upload to S3
app.post("/upload-from-url", async (req, res) => {
  const { fileUrl, folder } = req.body;
  if (!fileUrl || !folder) {
    return res.status(400).send({ error: "fileUrl and folder are required" });
  }

  console.log(`Attempting to download file from URL: ${fileUrl}`);

  try {
    const response = await axios.get(fileUrl, { responseType: "stream" });

    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${folder}/${uuidv4()}-${fileUrl.split("/").pop()}`,
      Body: response.data,
      ContentType: response.headers["content-type"],
    };

    const uploadResult = await s3.upload(uploadParams).promise();
    res.status(200).send({ uploadResult });
    console.log("uploadResult", uploadResult);
  } catch (err) {
    console.error(`Error downloading or uploading file: ${err.message}`);
    res.status(500).send({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
