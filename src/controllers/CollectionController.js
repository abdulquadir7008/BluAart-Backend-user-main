const Axios = require('axios')
const fs = require('fs');
const mime = require('mime-types');
const sanitizeHtml = require('sanitize-html');
const Config = require('../Config');
const Multer = require("fastify-multer")
const FormData = require('form-data');

const { Pool } = require('pg');
const pool = new Pool(Config.sqldb);
pool.connect();


const { storage, sanitizeObject, sanitizeArray } = require("../Helper");

const CollectionImageUpload = Multer({ storage: storage });
const CollectionImageUpdate = CollectionImageUpload.fields([
    { name: 'Thumb', maxCount: 1 },
    { name: 'Banner', maxCount: 1 }
]);

const uploadImageToServer = async (file, username, symbol, folderType) => {
  try {
    const formData = new FormData();
    const filename = `${file.filename}.${mime.extension(file.mimetype)}`;
    formData.append('Image', fs.createReadStream(file.path), filename);
    const folderlocation = `uploads/Collections/${username}/${symbol}/${folderType}`;
    formData.append('Location', folderlocation);
    const s3Store = await Axios.post(Config.Services.FileServiceApi, formData);
    return s3Store.data;
  } catch (error) {
    console.error('Error occurred during local upload:', error);
    return '';
  }
};

const getUserInfo = async (userId) => {
  const userInfoQuery = `SELECT * FROM "Users" WHERE _id = '${userId}'`;
  const userInfoResult = await pool.query(userInfoQuery);
  return userInfoResult.rows[0];
};

const findCollectionByNameAndId = async (name, collectionId) => {
  const query = 'SELECT * FROM "Collections" WHERE "Name" = $1 AND _id != $2;';
  const values = [name, collectionId];

  try {
    const result = await pool.query(query, values);
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
};

/* To Create Collection */

const CreateCollection = (fastify) => async (req, res) => {
  try {
    let { Name, Description, Royalties, Currency } = req.body;
    let s3Thumb = '';
    let s3Banner = '';

    if (req.user.Role === 'Buyer') {
      return res.code(200).send({
        status: false,
        message: `Not Allowed For ${req.user.Role} Role`,
      });
    }

    Name = sanitizeHtml(Name);
    Description = sanitizeHtml(Description);
    Currency = sanitizeHtml(Currency);

    Name = Name.trim();
    const Symbol = Name.replace(' ', '_');

    const collectionNameQuery = `SELECT * FROM "Collections" WHERE "Name" = '${Name}'`;
    const collectionNameResult = await pool.query(collectionNameQuery);
    const CollectionName = collectionNameResult.rows[0];

    if (CollectionName) {
      return res.code(200).send({
        status: false,
        message: 'Collection Name Already Exist',
      });
    }

    const UserInfo = await getUserInfo(req.user.UserId);

    if (!req.files.Thumb) {
      return res.code(200).send({
        status: false,
        message: 'Thumb is Required',
      });
    }

    if (!req.files.Banner) {
      return res.code(200).send({
        status: false,
        message: 'Banner is Required',
      });
    }

    s3Thumb = await uploadImageToServer(req.files.Thumb[0], UserInfo.UserName, Symbol, 'Thumb');
    s3Banner = await uploadImageToServer(req.files.Banner[0], UserInfo.UserName, Symbol, 'Banner');
    console.log("UserId", req.user.UserId)
    const CollectionCreate = await Axios.post(
      `${Config.Services.CollectionService}/AddCollection`,
      {
        Name,
        Description,
        Banner: s3Banner.s3CImage,
        Thumb: s3Thumb.s3CImage,
        BannerOrg: s3Banner.s3Image,
        ThumbOrg: s3Thumb.s3Image,
        Royalties,
        AuthorId: req.user.UserId,
        Currency,
      }
    );
    if(CollectionCreate.status === 200){
      return res.code(200).send({
        status: CollectionCreate.data.status,
        message: CollectionCreate.data.info,
      });
    }else{
      return res.code(200).send({
        status: CollectionCreate.data.status,
        message: CollectionCreate.data.message,
      });
    }
    
  } catch (error) {
    console.error('Error-/createcollection', error);
    return res.code(500).send({
      status: false,
      message: 'Error Occurred',
      error: 'error',
    });
  }
};

// Update a collection

const UpdateCollection = (fastify) => async (req, res) => {
  try {
    const { Name, Description, Royalties, CollectionId } = req.body;
    const { UserId, Email, Role } = req.user;

    if (Role === 'Buyer') {
      return res.code(200).send({
        status: false,
        message: `Not Allowed For ${Role} Role`,
      });
    }

    // Sanitize input values
    const sanitizedName = Name ? sanitizeHtml(Name) : '';
    const sanitizedDescription = Description ? sanitizeHtml(Description) : '';
    const sanitizedRoyalties = Royalties ? sanitizeHtml(Royalties) : '';

    const collectionDataQuery = `SELECT * FROM "Collections" WHERE _id = '${CollectionId}'`;
    const collectionDataResult = await pool.query(collectionDataQuery);
    const CollectionData = collectionDataResult.rows[0];

    if (!CollectionData) {
      return res.code(200).send({
        status: false,
        message: 'Collection Not Found',
      });
    }

    const nameExists = await findCollectionByNameAndId(sanitizedName, CollectionId);

    if (!nameExists) {
      const UserInfo = await getUserInfo(req.user.UserId);

      let ThumbPath = CollectionData.Thumb;
      let BannerPath = CollectionData.Banner;
      let ThumbOrgPath = CollectionData.ThumbOrg;
      let BannerOrgPath = CollectionData.BannerOrg;

      let s3Thumb = '';
      let s3Banner = '';

      if (req.files.Thumb) {
        s3Thumb = await uploadImageToServer(req.files.Thumb[0], UserInfo.UserName, CollectionData.ContractSymbol, 'Thumb');
        ThumbPath = s3Thumb.s3CImage;
        ThumbOrgPath = s3Thumb.s3Image;
      }

      if (req.files.Banner) {
        s3Banner = await uploadImageToServer(req.files.Banner[0], UserInfo.UserName, CollectionData.ContractSymbol, 'Banner');
        BannerPath = s3Banner.s3CImage;
        BannerOrgPath = s3Banner.s3Image;
      }

      const CollectionUpdate = await Axios.post(
        `${Config.Services.CollectionService}/EditCollection`,
        {
          Name: sanitizedName,
          Description: sanitizedDescription,
          Banner: BannerPath,
          Thumb: ThumbPath,
          ThumbOrg: ThumbOrgPath,
          BannerOrg: BannerOrgPath,
          Royalties: sanitizedRoyalties,
          CollectionId,
          UserId,
          Role,
          Email,
        }
      );

      return res.code(200).send({
        status: CollectionUpdate.data.status,
        message: CollectionUpdate.data.message,
      });
    } else {
      return res.code(200).send({
        status: false,
        message: 'Collection Name Already Exists',
      });
    }
  } catch (error) {
    console.error('Error-/updatecollection', error);
    return res.code(500).send({
      status: false,
      message: 'Error Occurred',
      error: 'error',
    });
  }
};

// Get collection data
const CollectionGetData = (fastify) => async (req, res) => {
  try {

    if (req.user.Role == "Buyer") {
      return res.code(200).send({
        status: false,
        message: "Not Allowed For " + req.user.Role + " Role",
      });
    }

    let CollectionData = await Axios.post(
      Config.Services.CollectionService + "/GetCollectionData",
      {
        AuthorId: req.user.UserId,
      }
    );

    // Sanitize collection data
    let sanitizedData = CollectionData.data.data.map((item) => sanitizeObject(item));

    return res.code(200).send({
      status: CollectionData.data.status,
      message: CollectionData.data.message,
      data: sanitizedData,
    });
  } catch (error) {
    console.log("error-/createcollection", error);
    return res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const UserCollectionGetData = (fastify) => async (req, res) => {
  try {
   
    let { AuthorId } = req.body;

    let CollectionData = await Axios.post(
      Config.Services.CollectionService + "/GetUserCollectionData",
      {
        AuthorId: AuthorId,
      }
    );
    
    // Sanitize collection data


    return res.code(200).send({
      status: CollectionData.data.status,
      message: CollectionData.data.message,
      collectiondata: CollectionData.data.collectiondata,
      userdata: CollectionData.data.userdata
    });
  } catch (error) {
    console.log("error-/createcollection", error);
    return res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

// Get all collection data
const CollectionAllGetData = (fastify) => async (req, res) => {
  try {

    let { Role } = req.body;

    let CollectionData = await Axios.post(
      Config.Services.CollectionService + "/GetCollectionAllData",
      {
         "Role": Role
      }
    );

    // Sanitize collection data
    let sanitizedData = CollectionData.data.data.map((item) => sanitizeObject(item));

    return res.code(200).send({
      status: CollectionData.data.status,
      message: CollectionData.data.message,
      data: sanitizedData,
    });
  } catch (error) {
    console.log("error-/createcollection", error);
    return res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

// Get collection information
const CollectionGetInfo = (fastify) => async (req, res) => {
  try {
    let CollectionData = await Axios.post(
      Config.Services.CollectionService + "/GetCollectionInfo",
      {
        CollectionId: req.body.CollectionId,
      }
    );

    // Sanitize collection data
    let sanitizedData = sanitizeArray(CollectionData.data.data);

    return res.code(200).send({
      status: CollectionData.data.status,
      message: CollectionData.data.message,
      data: sanitizedData,
    });
  } catch (error) {
    console.log("error-/createcollection", error);
    return res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};



module.exports = {
    CreateCollection,
    UpdateCollection,
    CollectionGetData,
    CollectionAllGetData,
    CollectionGetInfo,
    UserCollectionGetData,
    CollectionImageUpdate
}