const pinataSDK = require("@pinata/sdk");
const path = require("path");
const fs = require("fs");
require("dotenv").config();
//Working with pinata.
const pinataApiKey = process.env.PINATA_API_KEY;
const pinataApiSecret = process.env.PINATA_API_SECRET;

const pinata = new pinataSDK(pinataApiKey, pinataApiSecret);

// this function will get our images folder path - we are installing path package for the path
const storeImage = async (imagesFilePath) => {
  //this will resolve to the folder will all our images are
  const fillImagePath = path.resolve(imagesFilePath);

  // this function will read the directory resolved from fillIagePath
  const imageFiles = fs.readdirSync(fillImagePath);

  const responses = [];

  console.log("Uploading to IPFS.....");
  for (index in imageFiles) {
    const readStreamForFile = fs.createReadStream(
      `${fillImagePath}/${imageFiles[index]}`
    );
    const options = {
      pinataMetadata: {
        name: imageFiles[index],
      },
    };

    try {
      const pinataResponse = await pinata.pinFileToIPFS(
        readStreamForFile,
        options
      );
      responses.push(pinataResponse);
    } catch (error) {
      console.log(error);
    }
    // console.log(imageFiles);
  }
  return { responses, imageFiles };
};

const storeTokenURIMetadata = async (metaData) => {
  const options = {
    pinataMetadata: {
      name: metaData.name,
    },
  };
  try {
    const response = pinata.pinJSONToIPFS(metaData, options);
    return response;
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  storeImage,
  storeTokenURIMetadata,
};
