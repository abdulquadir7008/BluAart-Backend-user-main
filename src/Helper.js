const Crypto = require('crypto')
const Geoip = require('geoip-lite');
const sanitizeHtml = require('sanitize-html');
const FormData = require('form-data');
const RequestIp = require("request-ip");
const AdmZip = require('adm-zip');
const path = require('path');
let Algorithm = "aes-192-cbc";
let Password = "Exchange MEAN";
const Key = Crypto.scryptSync(Password, 'salt', 24);
const Iv = Buffer.alloc(16, 0);
const Config = require('./Config');
const { Pool } = require('pg');
const pool = new Pool(Config.sqldb);
const fs = require('fs')
const Multer = require("fastify-multer")

const sharp = require('sharp');
const mime = require('mime-types');

let PasswordValidator = require("password-validator");
let PasswordSchema = new PasswordValidator();

const Axios = require('axios')

const { S3Client, PutObjectCommand, ListObjectsCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const { Console } = require('console');

const s3 = new S3Client({
  signatureVersion: 'v4',
  region: Config.S3.Region,  // Replace with your actual region
  credentials: {
    accessKeyId: Config.S3.AccessKey,
    secretAccessKey: Config.S3.SecretKey
  }
});


PasswordSchema
  .is()
  .min(10)
  .has()
  .letters()
  .has()
  .digits()


const CollectionThumbStorage = Multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/Media/Images/Collections/Thumb');
  },
  filename: (req, file, cb) => {
    const extension = file.originalname.split('.').pop();
    const timestamp = Date.now();

    if (file.fieldname == "Thumb") {
      cb(null, `Thumb_${timestamp}.${extension}`);
    } else {
      cb(null, "");
    }

  },
});

const CollectionMediaStorage = Multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/Media/Images/Collections/Media');
  },
  filename: (req, file, cb) => {
    const extension = file.originalname.split('.').pop();
    const timestamp = Date.now();

    if (file.fieldname == "Media") {
      cb(null, `Media_${timestamp}.${extension}`);
    } else {
      cb(null, "");
    }
  },
});

const storage = Multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
});

const bulkstorage = Multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const FileFilter = function (req, file, cb) {
  // Check file extension
  const allowedExtensions = ['.jpg', 'jpeg', '.png', '.jpeg', '.pdf'];
  const fileExtension = file.originalname.slice(-4);

  if (!allowedExtensions.includes(fileExtension)) {
    return cb(new Error('Invalid file extension'));
  }

  // Check file size
  const allowedSize = 1024 * 1024 * 1; // 1MB
  if (file.size > allowedSize) {
    return cb(new Error('File size exceeds the limit'));
  }

  cb(null, true);
};

const LocalUpload = async function (File, Location, Mode) {
  if (Mode == "N") {
    const extension = mime.extension(File.mimetype);
    let LocalPic = Location + `/${File.filename + '.' + extension}`;
    fs.renameSync(File.path, LocalPic);
    LocalPic = Config.Services.FileService + LocalPic
    LocalPic = LocalPic.replace("/uploads", "");
    return LocalPic;
  } else if (Mode == "C") {
    const response = await Axios.get(File, { responseType: 'arraybuffer' });
    const imageData = Buffer.from(response.data, 'binary');
    const compressedImageData = await sharp(imageData).jpeg({ quality: 50 }).toBuffer();
    const timestamp = Date.now();
    const compressedImageFilename = `${timestamp}.jpeg`;
    const compressedImagePath = `${Location}/${compressedImageFilename}`;
    fs.writeFileSync(compressedImagePath, compressedImageData);
    let LocalPic = Config.Services.FileService + compressedImagePath
    LocalPic = LocalPic.replace("/uploads", "");
    return LocalPic;
  }
}

const uploadFileToIPFS = async (file) => {
  const formData = new FormData();
  formData.append('file', fs.createReadStream(file));
  const headers = {
    Authorization: `Bearer ${Config.Pinata.Jwt}`,
    'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
    pinata_api_key: Config.Pinata.Key,
    pinata_secret_api_key: Config.Pinata.Secret,
  };
  const response = await Axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
    headers: headers,
  });

  return response.data.IpfsHash;
};

const IPFSUpload = async function (File) {
  const IpfsUrl = await uploadFileToIPFS(File.path);
  return IpfsUrl;
}

const videoFileFilter = function (req, file, cb) {
  // Check file extension
  const allowedExtensions = ['.jpg', 'jpeg', '.png', '.mp4', '.jpeg', '.pdf'];
  const fileExtension = file.originalname.slice(-4);
  if (!allowedExtensions.includes(fileExtension)) {
    return cb(new Error('Invalid file extension'));
  }
  // Check file size
  const allowedSize = 1024 * 1024 * 1; // 1MB
  if (file.size > allowedSize) {
    return cb(new Error('File size exceeds the limit'));
  }
  cb(null, true);
};

const GetItemInfo = async (ItemId) => {

  await updateEditionPrice(ItemId);

  const CurInfo = await pool.query('SELECT * FROM "ArtItems" WHERE _id = $1', [ItemId]).then(result => result.rows[0]);
  const currencyVar = CurInfo.Currency === "MATIC" ? "MATIC" : "ETHER";
  
  // const ExchangeInfo = await pool.query('SELECT * FROM "Exchange" WHERE "BaseCurrency" = $1', [CurInfo.Currency]).then(result => result.rows[0]);

  //console.log("ExchangeInfo", ExchangeInfo)

  let PriceData = await GetConvertPrice(CurInfo)

  console.log("PriceData", PriceData)

  let Info = await pool.query(`Select "ArtItems"._id::text, 
  jsonb_build_object('_id',"ArtItems"._id::text, 
  'Title',"ArtItems"."Title",
  'AuthorId',"ArtItems"."AuthorId"::text,
  'ApproveStatus', "ArtItems"."ApproveStatus",
  'IPFSStatus', "ArtItems"."IPFSStatus",
  'Category' , "Categories"."Title",
  'Color', "ArtItems"."Color",
  'Currency', "ArtItems"."Currency",
  'S3Meta', "ArtItems"."S3Meta",
  'Description', "ArtItems"."Description",
  'DigitalPrice', '${PriceData.DigitalPrice}',
  'DigitalPrices',jsonb_build_object(
    '${currencyVar}', ${PriceData.DigitalPrice},
    'EURO', ${PriceData.DigitalEURPrice},
    'GBP', ${PriceData.DigitalGBPPrice},
    'SGD', ${PriceData.DigitalSGDPrice},
    'USD', ${PriceData.DigitalUSDPrice}
  ),
  'Dimension' ,  "ArtItems"."Dimension",
  'Edition',  "ArtItems"."Edition",
  'Framed', "ArtItems"."Framed",
  'Height' , "ArtItems"."Height",
  'Keywords', '',
  'Subject',  array_to_string(array_agg(DISTINCT "Medium"."Title"), ','),
  'Material',  array_to_string(array_agg(DISTINCT "Materials"."Title"), ','),
  'Media', "ArtItems"."Media",
  'MediaIPFS', "ArtItems"."IPFSMedia",
  'Orientation', "ArtItems"."Orientation",
  'Packaging',  "ArtItems"."Packaging",
  'Panel', "ArtItems"."Panel",
  'PhysicalPrice', '${PriceData.PhysicalPrice}',
  'PhysicalPrices', jsonb_build_object(
    '${currencyVar}', ${PriceData.PhysicalPrice},
    'EURO', ${PriceData.PhysicalEURPrice},
    'GBP', ${PriceData.PhysicalGBPPrice},
    'SGD', ${PriceData.PhysicalSGDPrice},
    'USD', ${PriceData.PhysicalUSDPrice}
  ),
  'PriceDisplay', "ArtItems"."PriceDisplay",
  'ProductCategory' , "ArtProductCategory"."Title",
  'ProductMaterial',  "ArtProductMaterial"."Title",
  'PublishStatus',  "ArtItems"."PublishStatus",
  'Status',  "ArtItems"."Status",
  'Style',  array_to_string(array_agg(DISTINCT "Style"."Title"), ','),
  'Thumb',  "ArtItems"."Thumb",
  'ThumbIPFS',  "ArtItems"."IPFSThumb",
  'Title',  "ArtItems"."Title",
  'TokenId',  "ArtItems"."TokenId",
  'Type',  "ArtItems"."Type",
  'Unique',  "ArtItems"."Unique",
  'UpdatedAt',  "ArtItems"."updatedAt",
  'Width',  "ArtItems"."Width",
  'Price' , ROUND(COALESCE(${PriceData.PhysicalPrice}, ${PriceData.DigitalPrice}), 4)
  ) AS "ItemInfo",
  jsonb_build_object(
    'ContractAddress' , "Collections"."ContractAddress",
    'IPFSHash' , "Collections"."IPFSCid",
    'Royalties', "Collections"."Royalties"
  ) AS "CollectionInfo",  
  jsonb_build_object(
    'BlockExplorer', "Networks"."BlockExplorer",
    'ChainName', "Networks"."ChainName",
    'FactoryContract',"Networks"."FactoryContract"
  ) AS "NetworkInfo",
  jsonb_build_object(
    'Country' , "Users"."Country",
    'ProfileName' , "Users"."ProfileName",
    'ProfilePicture' , "Users"."ProfilePicture",
    'UserName' , "Users"."UserName",
    'WalletAddress' , "Users"."WalletAddress"
  ) AS "UserInfo",
  jsonb_build_object(
    'Id', "Users"._id::text,
    'WalletAddress' , "Users"."WalletAddress"
  ) AS "OwnerInfo",
  jsonb_build_object(
    'Price' , "Bids"."Price",
    'Status', "Bids"."Status",
    'SellerInfo', jsonb_build_object(
      'Id', "BidUsers"._id::text,
      'Country' , "BidUsers"."Country",
      'ProfileName' , "BidUsers"."ProfileName",
      'ProfilePicture' , "BidUsers"."ProfilePicture",
      'UserName' , "BidUsers"."UserName",
       'WalletAddress' , "BidUsers"."WalletAddress"
    )
  ) AS "BidInfo",
  jsonb_build_object(
    'Price' , "Offers"."Price",
    'Status', "Offers"."Status",
    'SenderInfo', jsonb_build_object(
      'Country' , "OfferUsers"."Country",
      'ProfileName' , "OfferUsers"."ProfileName",
      'ProfilePicture' , "OfferUsers"."ProfilePicture",
      'UserName' , "OfferUsers"."UserName",
       'WalletAddress' , "OfferUsers"."WalletAddress"
    )
  ) AS "OfferInfo",
  jsonb_build_object(
    'Price' , "PreOffers"."Price",
    'Status', "PreOffers"."Status",
    'SenderInfo', jsonb_build_object(
      'Country' , "PreOfferUsers"."Country",
      'ProfileName' , "PreOfferUsers"."ProfileName",
      'ProfilePicture' , "PreOfferUsers"."ProfilePicture",
      'UserName' , "PreOfferUsers"."UserName",
       'WalletAddress' , "PreOfferUsers"."WalletAddress"
    )
  ) AS "PreOfferInfo"
  from "ArtItems" 
  LEFT JOIN "Categories" ON "Categories"._id = "ArtItems"."Category"
  LEFT JOIN "ArtProductCategory" ON "ArtProductCategory"._id = "ArtItems"."ProductCategory"
  LEFT JOIN "ArtProductMaterial" ON "ArtProductMaterial"._id = "ArtItems"."ProductMaterial" 
  LEFT JOIN "Style" ON "Style"._id = ANY("ArtItems"."Style")
  LEFT JOIN "Medium" ON "Medium"._id = ANY("ArtItems"."Subject")
  LEFT JOIN "Materials" ON "Materials"._id = ANY("ArtItems"."Material")
  LEFT JOIN "Collections"   ON "Collections"._id = "ArtItems"."CollectionId"
  LEFT JOIN "Networks"  ON "Networks"."Currency" = "ArtItems"."Currency"
  LEFT JOIN "Users" ON "Users"._id = "ArtItems"."AuthorId"
  LEFT JOIN "Bids" ON "Bids"."ItemId" = "ArtItems"._id
  LEFT JOIN "Users" AS "BidUsers" ON "BidUsers"._id = "Bids"."Sender"
  LEFT JOIN "Offers"  ON "Offers"."ItemId" = "ArtItems"._id AND "Offers"."Status"='Accepted'
  LEFT JOIN "Users" AS "OfferUsers" ON "OfferUsers"._id = "Offers"."Sender"
  LEFT JOIN "PreOffers"  ON "PreOffers"."ItemId" = "ArtItems"._id AND "PreOffers"."Status"='Accepted'
  LEFT JOIN "Users" AS "PreOfferUsers" ON "PreOfferUsers"._id = "PreOffers"."Sender"
  WHERE "ArtItems"._id = '${ItemId}' GROUP BY "ArtItems"._id,"Categories"._id, "ArtProductCategory"._id, "ArtProductMaterial"._id, "Collections"._id,  "Networks"._id,"Users"._id,"Bids"._id,"Offers"._id, "PreOffers"._id, "OfferUsers"._id, "BidUsers"._id, "PreOfferUsers"._id  LIMIT 1`);
  
  console.log("Info.rows", Info.rows)
  console.log("Info.rows[0]", Info.rows[0].ItemInfo.PhysicalPrices)
  return Info.rows;
};

const updateEditionPrice = async (Artworkid) => {
  const EditionInfoQuery = 'SELECT * FROM "Editions" WHERE "ItemId" = $1';
  const EditionInfoValues = [Artworkid];
  const EditionInfoResult = await pool.query(EditionInfoQuery, EditionInfoValues);
  const editionInfo = EditionInfoResult.rows;

  let ItemInfoQuery = 'SELECT * FROM "ArtItems" WHERE "_id" = $1';
  const ItemInfoValues = [Artworkid];
  let ItemInfoResult = await pool.query(ItemInfoQuery, ItemInfoValues);
  const itemInfo = ItemInfoResult.rows[0];
  console.log("itemInfo", itemInfo)
  const ExchangeInfoQuery = 'SELECT * FROM "Exchange" WHERE "BaseCurrency" = $1';
  const ExchangeInfoValues = [itemInfo.Currency];
  const exdata = await pool.query(ExchangeInfoQuery, ExchangeInfoValues);
  const exchangeData = exdata.rows[0];

  const updateArtItemQuery = 'UPDATE "ArtItems" SET "PhysicalPrice" = $2, "DigitalPrice" = $3 WHERE "_id" = $1';
  const updateEditionQuery = 'UPDATE "Editions" SET "Price" = $2 WHERE "_id" = $1';

  let pprice, dprice;

  if (itemInfo.ReceiveCurrency === "ETH" || itemInfo.ReceiveCurrency === "MATIC") {
    pprice = itemInfo.ReceivedPhysicalPrice;
    dprice = itemInfo.ReceivedDigitalPrice;
  } else {
    const rate = exchangeData[itemInfo.ReceiveCurrency];
    pprice = (itemInfo.ReceivedPhysicalPrice / rate).toFixed(4);
    dprice = (itemInfo.ReceivedDigitalPrice / rate).toFixed(4);
  }

  for (const edition of editionInfo) {
    await pool.query(updateEditionQuery, [edition._id, edition.PhysicalArt ? pprice : dprice]);
  }

  await pool.query(updateArtItemQuery, [Artworkid, pprice, dprice]);
}

const GetConvertPrice = async (CurInfo) => {

  const Artworkid = CurInfo._id;

  let CPhysicalPrice = CurInfo.ReceivedPhysicalPrice || CurInfo.PhysicalPrice;
  let CDigitalPrice = CurInfo.ReceivedDigitalPrice || CurInfo.DigitalPrice;


  const isETHorMATIC = CurInfo.ReceiveCurrency === "ETH" || CurInfo.ReceiveCurrency === "MATIC";
  const currencyId = CurInfo.Currency === "MATIC" ? "matic-network" : "ethereum";

  let Upd_Data = "";


  const responsematic = await pool.query('SELECT * FROM "Exchange" WHERE "BaseCurrency" = $1', ['MATIC']).then(result => result.rows[0]);

    if (!responsematic) {
      console.log("No MATIC Exchange Data Available");
      return;
    }

    // Read exchange rate data from the Exchange table for ETH
    const responseeth = await pool.query('SELECT * FROM "Exchange" WHERE "BaseCurrency" = $1', ['ETH']).then(result => result.rows[0]);

    if (!responseeth) {
      console.log("No ETH Exchange Data Available");
      return;
    }

  if (!isETHorMATIC && CurInfo.ReceiveCurrency) {    

    const response = CurInfo.Currency === "MATIC" ? responsematic : responseeth;
    const ethereumPrice = response;
    //console.log("ifethereumPrice", ethereumPrice)
    CPhysicalPrice = parseFloat(CurInfo.ReceivedPhysicalPrice) / parseFloat(ethereumPrice[CurInfo.ReceiveCurrency]);

    CDigitalPrice = parseFloat(CurInfo.ReceivedDigitalPrice) / parseFloat(ethereumPrice[CurInfo.ReceiveCurrency]);
    //console.log("CDigitalPrice", CDigitalPrice, CPhysicalPrice)

    return {
      PhysicalPrice: CPhysicalPrice,
      DigitalPrice: CDigitalPrice,
      PhysicalGBPPrice: CPhysicalPrice * ethereumPrice.GBP,
      PhysicalUSDPrice: CPhysicalPrice * ethereumPrice.USD,
      PhysicalEURPrice: CPhysicalPrice * ethereumPrice.EUR,
      PhysicalSGDPrice: CPhysicalPrice * ethereumPrice.SGD,
      DigitalGBPPrice: CDigitalPrice * ethereumPrice.GBP,
      DigitalUSDPrice: CDigitalPrice * ethereumPrice.USD,
      DigitalEURPrice: CDigitalPrice * ethereumPrice.EUR,
      DigitalSGDPrice: CDigitalPrice * ethereumPrice.SGD,

    };
  } else {

    const response = CurInfo.Currency === "MATIC" ? responsematic : responseeth;
    const ethereumPrice = response;

    console.log("ethereumPrice", ethereumPrice)

    return {
      PhysicalPrice: CPhysicalPrice,
      DigitalPrice: CDigitalPrice,
      PhysicalGBPPrice: CPhysicalPrice * ethereumPrice.GBP,
      PhysicalUSDPrice: CPhysicalPrice * ethereumPrice.USD,
      PhysicalEURPrice: CPhysicalPrice * ethereumPrice.EUR,
      PhysicalSGDPrice: CPhysicalPrice * ethereumPrice.SGD,
      DigitalGBPPrice: CDigitalPrice * ethereumPrice.GBP,
      DigitalUSDPrice: CDigitalPrice * ethereumPrice.USD,
      DigitalEURPrice: CDigitalPrice * ethereumPrice.EUR,
      DigitalSGDPrice: CDigitalPrice * ethereumPrice.SGD,
    };
  }
}

const GetItemOwnerListInfo = async (ItemId, Edition) => {
  
  let Info = await pool.query(
    `Select 
    json_build_object(
      '_id', "Histories"."_id",
      'ItemId', "Histories"."ItemId",
      'CollectionId', "Histories"."CollectionId",
      'Price', "Histories"."Price",
      'TransactionHash', "Histories"."TransactionHash",
      'HistoryType', "Histories"."HistoryType",
      'createdAt', "Histories"."createdAt",
      'updatedAt', "Histories"."updatedAt"
    ) AS  "HistoryInfo",
    json_build_object(
      'UserName', "FromUser"."UserName",
      'ProfilePicture', "FromUser"."ProfilePicture",
      'ProfileName', "FromUser"."ProfileName"
    ) AS "FromInfo",
    json_build_object(
      'UserName', "ToUser"."UserName",
      'ProfilePicture', "ToUser"."ProfilePicture",
      'ProfileName', "ToUser"."ProfileName",
      'ProfilePicture', "ToUser"."ProfilePicture"
    ) AS "ToInfo",
    jsonb_build_object( 
      'Name', "Collections"."Name",
      'Currency', "Collections"."Currency"
    ) AS "CollectionInfo"
    from "Histories" 
    INNER JOIN "Users" AS "FromUser" ON "Histories"."FromId" = "FromUser"._id
    INNER JOIN "Users" AS "ToUser" ON "Histories"."ToId" = "ToUser"._id 
    INNER JOIN "Collections"  ON "Histories"."CollectionId" = "Collections"._id
    where "Histories"."ItemId" = '${ItemId}' AND "HistoryType" = 'Transfer' AND "Edition" = '${Edition}' ORDER BY "Histories"."_id" DESC `
  )
  
  return Info.rows;

};

const GetItemHistoryListInfo = async (ItemId, Edition) => {
  let Info = await pool.query(
    `Select jsonb_build_object(
      '_id', "Histories"._id,
     'ItemId', "Histories"."ItemId",
     'Edition', "Histories"."Edition",
     'CollectionId', "Histories"."CollectionId",
     'Price', "Histories"."Price",
     'TransactionHash', "Histories"."TransactionHash",
     'HistoryType', "Histories"."HistoryType",
     'createdAt', "Histories"."createdAt",
     'updatedAt', "Histories"."updatedAt"
    ) AS "HistoryInfo",
    jsonb_build_object(
      'UserName', "FromUser"."UserName",
      'ProfilePicture', "FromUser"."ProfilePicture",
      'ProfileName', "FromUser"."ProfileName"
    ) AS  "FromInfo" ,
    jsonb_build_object(
      'UserName', "ToUser"."UserName",
      'ProfilePicture', "ToUser"."ProfilePicture",
      'ProfileName', "ToUser"."ProfileName"
    ) AS  "ToInfo" ,
    jsonb_build_object(
      'Name', "Collections"."Name",
      'Currency', "Collections"."Currency"
    ) AS "CollectionInfo"
    from "Histories" 
    INNER JOIN "Users" AS "FromUser" ON  "Histories"."FromId" = "FromUser"._id
    INNER JOIN "Users" AS "ToUser" ON  "Histories"."ToId" = "ToUser"._id
    INNER JOIN "Collections" AS "Collections" ON  "Histories"."CollectionId" = "Collections"._id
    where "HistoryType"  IN ('Minted', 'Transfer', 'Listed') AND 
    "Histories"."ItemId" = '${ItemId}' ORDER BY "Histories"._id DESC`
  )
  
  return Info.rows;

};

const GetItemOfferListInfo = async (ItemId, Edition) => {

  let combinedInfo = {};
  
  let OfferInfo = await pool.query(
    `Select  
    json_build_object(
      '_id', "Offers"."_id"::text,
      'ItemId', "Offers"."ItemId"::text,
      'Sender', "Sender"._id::text,
      'Receiver', "Receiver"._id::text,
      'Price', "Offers"."Price",
      'Message', "Offers"."Message",
      'Status', "Offers"."Status",
      'createdAt', "Offers"."createdAt",
      'updatedAt', "Offers"."updatedAt"
    ) AS "OfferInfo",
    json_build_object(
      'UserId', "Sender"._id::text,
      'UserName', "Sender"."UserName",
      'ProfilePicture', "Sender"."ProfilePicture",
      'Country', "Sender"."Country",
      'ProfileName', "Sender"."ProfileName",
      'WalletAddress', "Sender"."WalletAddress"
    ) AS "SenderInfo"
    from "Offers" 
    INNER JOIN "Users" AS "Sender" ON "Offers"."Sender" = "Sender"._id
    INNER JOIN "Users" AS "Receiver" ON "Offers"."Receiver" = "Receiver"._id
    where "ItemId"= '${ItemId}' AND "Edition" = '${Edition}'`
  )

  let BidInfo = await pool.query(
    `Select 
      jsonb_build_object(
        '_id', "Users"._id,
        'ItemId', "Bids"."ItemId",
        'Sender', "Bids"."Sender",
        'Receiver', "Bids"."Receiver",
        'Price', "Bids"."Price",
        'Edition', "Bids"."Edition",
        'Status', "Bids"."Status",
        'createdAt', "Bids"."createdAt",
        'updatedAt', "Bids"."updatedAt"
      ) AS "BidInfo" ,
      jsonb_build_object(
        'UserId', "Users"._id,
        'UserName', "Users"."UserName",
        'ProfilePicture', "Users"."ProfilePicture",
        'Country', "Users"."Country",
        'ProfileName',"Users"."ProfileName",
        'WalletAddress',"Users"."WalletAddress"
      ) AS "SenderInfo"      
      from "Bids" 
      INNER JOIN "Users" ON "Bids"."Sender" = "Users"._id
      where "ItemId" = '${ItemId}' AND "Edition" = '${Edition}'`
  )

  combinedInfo.OfferInfo = OfferInfo.rows;
  combinedInfo.BidInfo = BidInfo.rows;

  return combinedInfo;
};

const ItemMediaFileFilter = function (req, file, cb) {
  // Check file extension
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.mp4', '.svg', '.gif', '.webm', '.mp3', '.wav', '.ogg', 'jpeg', '.pdf'];
  const fileExtension = file.originalname.slice(-4);
  if (!allowedExtensions.includes(fileExtension)) {
    return cb(new Error('Invalid file extension'));
  }
  // Check file size
  const allowedSize = 1024 * 1024 * 10; // 10MB
  if (file.size > allowedSize) {
    return cb(new Error('File size exceeds the limit'));
  }
  cb(null, true);
};

exports.Encrypt = (value) => {
  const Cipher = Crypto.createCipheriv(Algorithm, Key, Iv);
  let Encrypted = Cipher.update(value, 'utf8', 'hex') + Cipher.final('hex');
  return Encrypted;
};

exports.Decrypt = (value) => {
  const Decipher = Crypto.createDecipheriv(Algorithm, Key, Iv);
  let Decrypted = Decipher.update(value, 'hex', 'utf8') + Decipher.final('utf8');
  return Decrypted
};

exports.sanitizeObject = (obj) => {
  const sanitizedObj = {};
  for (let key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (typeof obj[key] === 'string') {
        sanitizedObj[key] = sanitizeHtml(obj[key]);
      } else {
        sanitizedObj[key] = obj[key];
      }
    }
  }
  return sanitizedObj;
};

exports.sanitizeArray = (arr) => {
  const sanitizedArr = arr.map((item) => {
    return this.sanitizeObject(item);
  });
  return sanitizedArr;
};



exports.Schema = PasswordSchema
exports.CollectionThumbStorage = CollectionThumbStorage
exports.CollectionMediaStorage = CollectionMediaStorage
exports.storage = storage;
exports.bulkstorage = bulkstorage;
exports.videoFileFilter = videoFileFilter;
exports.FileFilter = FileFilter;
exports.ItemMediaFileFilter = ItemMediaFileFilter;
exports.LocalUpload = LocalUpload;
exports.IPFSUpload = IPFSUpload;
exports.GetItemInfo = GetItemInfo;
exports.GetItemOwnerListInfo = GetItemOwnerListInfo;
exports.GetItemOfferListInfo = GetItemOfferListInfo;
exports.GetItemHistoryListInfo = GetItemHistoryListInfo;

exports.ActivityUpdate = async (req, user, action, status, reason) => {
  let Ip = RequestIp.getClientIp(req);
  if (String(Ip).slice(0, 7) == "::ffff:") {
    Ip = String(Ip).slice(7);
  }

  let query = `INSERT INTO "Activities" ( "Email","Action","Status","Reason","Ip","Device") Values ($1,$2,$3,$4,$5,$6)`
  let values = [user, action, status, reason, Ip, req.headers["user-agent"]]
  await pool.query(query, values);
  return true;
};

exports.SocketCall = async (fastify, ItemId, AuthorId, UserId, Message) => {

  const io = fastify.io;

  let Info = await GetItemInfo(ItemId);

  const result = {
    data: Info
  };


  let AsocketId = (await pool.query('SELECT * FROM "SocketId" WHERE "UserId" = $1 LIMIT 1;', [AuthorId])).rows[0];


  if (AsocketId) {
    let Sid = AsocketId.SocketId;
    io.to(Sid).emit("ArtItemInfo", result);
    io.to(Sid).emit("notifications", Message);
  }

  let UsocketId = (await pool.query('SELECT * FROM "SocketId" WHERE "UserId" = $1 LIMIT 1;', [UserId])).rows[0];

  if (UsocketId) {
    io.to(UsocketId.SocketId).emit("ArtItemInfo", result);
  }

  return true;

}

exports.OfferSocketCall = async (fastify, ItemId, Edition, AuthorId, UserId, Message) => {

  const io = fastify.io;

  let Info = await GetItemOfferListInfo(ItemId, Edition);

  const result = {
    data: Info,
    ItemId: ItemId
  };


  let AsocketId = (await pool.query('SELECT * FROM "SocketId" WHERE "UserId" = $1 LIMIT 1;', [AuthorId])).rows[0];

  if (AsocketId) {
    let Sid = AsocketId.SocketId;
    io.to(Sid).emit("ArtItemOfferListInfo", result);
    io.to(Sid).emit("notifications", Message);
  }


  let UsocketId = (await pool.query('SELECT * FROM "SocketId" WHERE "UserId" = $1 LIMIT 1;', [UserId])).rows[0];



  if (UsocketId) {
    let Sid = UsocketId.SocketId;
    io.to(Sid).emit("ArtItemOfferListInfo", result);
  }

  return true;

}

exports.HistorySocketCall = async (fastify, ItemId, Edition, AuthorId, UserId, Message) => {

  const io = fastify.io;

  let Info = await GetItemHistoryListInfo(ItemId, Edition);

  const result = {
    data: Info,
    ItemId: ItemId
  };
  let AsocketId = await pool.query(`Select * from "SocketId" where "UserId" = '${AuthorId}'`)
  AsocketId = AsocketId.rows[0];

  if (AsocketId) {
    let Sid = AsocketId.SocketId;
    io.to(Sid).emit("ArtItemHistoryListInfo", result);
    io.to(Sid).emit("notifications", Message);
  }

  return true;

}

exports.OwnerSocketCall = async (fastify, ItemId, Edition, AuthorId, UserId, Message) => {

  const io = fastify.io;

  let Info = await GetItemOwnerListInfo(ItemId, Edition);

  const result = {
    data: Info,
    ItemId: ItemId
  };

  let ItemInfo = await GetItemInfo(ItemId);

  const Iresult = {
    data: ItemInfo
  };

  let AsocketId = (await pool.query('SELECT * FROM "SocketId" WHERE "UserId" = $1 LIMIT 1;', [AuthorId])).rows[0];


  if (AsocketId) {
    let Sid = AsocketId.SocketId;
    io.to(Sid).emit("ArtItemOwnerListInfo", result);
    io.to(Sid).emit("ArtItemInfo", Iresult);

  }


  return true;

}

exports.NotifySocketCall = async (fastify, UserId) => {

  const io = fastify.io;
  const Count = await pool.query(`Select count(*) from "Notifications" where "UserId" = '${UserId}' AND "Status" = 'Unread'`)
  let AsocketId = await pool.query(`Select "SocketId" from "SocketId" where "UserId" = '${UserId}'`)
  AsocketId = AsocketId.rows[0];
  if (AsocketId) {
    let Sid = AsocketId.SocketId;
    io.to(Sid).emit("GetNotifyCount", { "Count": Count.rows[0].count });
  }


  return true;

}

exports.ProfileViews = async (req, UserId) => {
  let Ip = RequestIp.getClientIp(req);
  if (String(Ip).slice(0, 7) == "::ffff:") {
    Ip = String(Ip).slice(7);
  }
  const geo = Geoip.lookup(Ip);
  const Country = geo ? geo.country : 'Unknown';
  let mn = new Date();

  let query = `INSERT INTO "ProfileViews" ( "UserId","Month","Ip","Country","Device") Values ($1,$2,$3,$4,$5)`
  let values = [UserId, mn, Ip, Country,  req.headers["user-agent"]]
  await pool.query(query, values);
  return true;
};

exports.ItemViews = async (ItemId, Ip, Device, AuthorId, OwnerId) => {

  if (String(Ip).slice(0, 7) == "::ffff:") {
    Ip = String(Ip).slice(7);
  }

  const geo = Geoip.lookup(Ip);
  const Country = geo ? geo.country : 'Unknown';

  let mn = new Date();

  let query = `INSERT INTO "ItemViews" ("ItemId","Month","Ip","Country","Device", "AuthorId", "OwnerId") Values ($1,$2,$3,$4,$5,$6,$7)`
  let values = [ItemId, mn, Ip, Country, Device, AuthorId, OwnerId]
  await pool.query(query, values);

  return true;
};

exports.Recaptchaverify = async (Recaptcha, secretkey) => {
  let result = await Axios({
    method: 'post',
    url: 'https://www.google.com/recaptcha/api/siteverify',
    params: {
      secret: secretkey,
      response: Recaptcha
    }
  });
  let data = result.data || {};
  return !(!data.success);
}

const AuctionsQuery = (Type) => {
  let infoQuery = "";

  if (Type === "Past") {
    infoQuery = `
      SELECT json_agg(
        json_build_object(
          'ItemInfo', json_build_object(
            '_id', AI._id,
            'Title', AI."Title",
            'Description', AI."Description",
            'Thumb', AI."Thumb",
            'StartDateTimeUtcBID', E."StartDateTimeUtcBID",
            'EndDateTimeUtcBID', E."EndDateTimeUtcBID"
          ),
          'UserInfo', json_build_object(
            'Id', U._id::text,
            'UserName', U."UserName",
            'ProfilePicture', U."ProfilePicture",
            'Country', U."Country",
            'ProfileName', U."ProfileName",
            'WalletAddress', U."WalletAddress"
          )
        )
      ) AS "Info"
      FROM "Editions" E
      LEFT JOIN "ArtItems" AI ON AI._id = E."ItemId"
      LEFT JOIN "Users" U ON U._id = E."AuthorId"
      WHERE E."EndDateTimeUtcBID" <= $1;
    `;
  } else if (Type === "Future") {
    infoQuery = `
      SELECT json_agg(
        json_build_object(
          'ItemInfo', json_build_object(
            '_id', AI._id,
            'Title', AI."Title",
            'Description', AI."Description",
            'Thumb', AI."Thumb",
            'StartDateTimeUtcBID', E."StartDateTimeUtcBID",
            'EndDateTimeUtcBID', E."EndDateTimeUtcBID"
          ),
          'UserInfo', json_build_object(
            'Id', U._id::text,
            'UserName', U."UserName",
            'ProfilePicture', U."ProfilePicture",
            'Country', U."Country",
            'ProfileName', U."ProfileName",
            'WalletAddress', U."WalletAddress"
          )
        )
      ) AS "Info"
      FROM "Editions" E
      LEFT JOIN "ArtItems" AI ON AI._id = E."ItemId"
      LEFT JOIN "Users" U ON U._id = E."AuthorId"
      WHERE E."EnableBid" = true
        AND E."EnableBidStatus" = true
        AND E."StartDateTimeUtcBID" > $1;
    `;
  } else if (Type === "Ongoing") {
    infoQuery = `
      SELECT json_agg(
        json_build_object(
          'ItemInfo', json_build_object(
            '_id', AI._id,
            'Title', AI."Title",
            'Description', AI."Description",
            'Thumb', AI."Thumb",
            'StartDateTimeUtcBID', E."StartDateTimeUtcBID",
            'EndDateTimeUtcBID', E."EndDateTimeUtcBID"
          ),
          'UserInfo', json_build_object(
            'Id', U._id::text,
            'UserName', U."UserName",
            'ProfilePicture', U."ProfilePicture",
            'Country', U."Country",
            'ProfileName', U."ProfileName",
            'WalletAddress', U."WalletAddress"
          )
        )
      ) AS "Info"
      FROM "Editions" E
      LEFT JOIN "ArtItems" AI ON AI._id = E."ItemId"
      LEFT JOIN "Users" U ON U._id = E."AuthorId"
      WHERE E."EnableBid" = true
        AND E."EnableBidStatus" = true
        AND E."StartDateTimeUtcBID" <= $1
        AND E."EndDateTimeUtcBID" >= $1;
    `;
  } else {
    infoQuery = `
      SELECT '[]'::json AS "Info";
    `;
  }

  return infoQuery;
};

exports.Auctions = async (Type) => {
  try {
    const query = AuctionsQuery(Type);
    let currentDate = new Date();
    const result = await pool.query(query, [currentDate]);
    const infoList = result.rows[0]?.Info || [];

    const response = {
      status: infoList.length > 0,
      data: infoList,
    };

    return response;
  } catch (error) {
    console.error('Error fetching auction details:', error);
    return {
      status: false,
      data: [],
    };
  }
};

exports.UploadFlagFile = async(file) => {
  try {

  
    const zipFilePath = file.path;
    const s3Folder = 'uploads/Flags'; 
    // Unzip the file
    const zip = new AdmZip(zipFilePath);
    zip.extractAllTo('/tmp/unzipped-folder', true);

    // List the contents of the unzipped folder
    const flagsFolderPath = '/tmp/unzipped-folder/flags';

    const filesToUpload = fs.readdirSync(flagsFolderPath);


    // Upload each file to S3
    await Promise.all(
      filesToUpload.map(async (fileName) => {

        const filePath = path.join(flagsFolderPath, fileName);

        const isFile = fs.statSync(filePath).isFile();

        if (isFile) {
          const fileContent = fs.createReadStream(filePath);

          // Create the S3 key by combining the S3 folder path and file name
          const s3Key = `${s3Folder}/${fileName}`;

          // Create an instance of the Upload class
          const upload = new Upload({
            client: s3,
            params: {
              Bucket: Config.S3.Bucket,
              Key: s3Key,
              Body: fileContent,
              ACL: 'public-read',
              ContentType: 'image/svg+xml'

            },
          });

          // Execute the upload
          await upload.done();

          const s3ObjectUrl = `https://s3.amazonaws.com/${Config.S3.Bucket}/${s3Key}`;

          console.log(`Uploaded ${fileName} to S3 at ${s3ObjectUrl}`);
        }


      })
    );

    // Respond with a success message
  } catch (error) {
    console.error('Error handling file upload:', error);
  }
};