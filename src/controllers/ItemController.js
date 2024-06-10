const Config = require("../Config");
const Axios = require("axios");
const fastify = require('fastify');
const base64 = require("base-64");
const { Auctions } = require("../Helper");
const { Pool } = require('pg');

const pool = new Pool(Config.sqldb);
pool.connect();

const io = require('socket.io')(fastify.server);
const sizeOf = require('image-size');
const sanitizeHtml = require("sanitize-html");
const Multer = require("fastify-multer");
const fs = require("fs");
const csv = require('csv-parser');
const mime = require("mime-types");
const FormData = require("form-data");
const RequestIp = require("request-ip");


const {
  storage,
  bulkstorage,
  IPFSUpload,
  OfferSocketCall,
  HistorySocketCall,
  OwnerSocketCall,
  NotifySocketCall
} = require("../Helper");

const ThumbUpload = Multer({ storage: storage });
let ThumbUpdate = ThumbUpload.single("Thumb");

const MediaUpload = Multer({
  storage: storage
});
let MediaUpdate = MediaUpload.single("Media");

const BulkImageUpload = Multer({ storage: bulkstorage });
const BulkImageUpdate = BulkImageUpload.array('Image')

const CSVUpload = Multer({ storage: storage });
const CSVUpdate = CSVUpload.single('csvFile')

/* Item Thumb Upload */

const ArtItemThumbUpload = (fastify) => async (req, res) => {
  try {
    if (!req.file) {
      res.code(200).send({
        status: false,
        message: "Item Thumb Image is required",
      });
      return;
    }

    let itemId = req.body.ItemId

    if (!itemId) {
      res.code(200).send({
        status: false,
        message: "ItemId is Mandatory",
      });
      return;
    }

    const artworkQuery = 'SELECT * FROM "ArtItems" WHERE "_id" = $1';
    const artworkValues = [itemId];
    const artworkResult = await pool.query(artworkQuery, artworkValues);
    const Artwork = artworkResult.rows[0];

    const collectionQuery = 'SELECT * FROM "Collections" WHERE "_id" = $1';
    const collectionValues = [Artwork.CollectionId];
    const collectionResult = await pool.query(collectionQuery, collectionValues);
    const Collection = collectionResult.rows[0];

    const itemDataQuery = 'SELECT * FROM "ArtItems" WHERE "CollectionId" = $1 ORDER BY "_id"';
    const itemDataValues = [Artwork.CollectionId];
    const itemDataResult = await pool.query(itemDataQuery, itemDataValues);

    const itemdata = itemDataResult.rows;
    const itemIndex = itemdata.findIndex((item) => item._id == itemId);


    const userInfoQuery = 'SELECT * FROM "Users" WHERE "_id" = $1';
    const userInfoValues = [req.user.UserId];
    const userInfoResult = await pool.query(userInfoQuery, userInfoValues);
    const UserInfo = userInfoResult.rows[0];

    const dimensions = await sizeOf(req.file.path);
    const Width = dimensions.width;
    const Height = dimensions.height;

    if ((Width * Height) > 268402689) {
      res.code(200).send({
        status: false,
        message: `Image Size is too Large`,
      });
      return;
    }

    let thumbImage = sanitizeHtml(req.file.filename);

    let IPFS = "";
    let Local;

    if (thumbImage) {
      try {
        const ipfsUrl = await IPFSUpload(req.file);
        IPFS = "https://ipfs.io/ipfs/" + ipfsUrl;
      } catch (error) {
        console.error("Error occurred during IPFS upload for Item Thumb Image");
      }

      try {
        let file = req.file;
        let formData = new FormData();
        filename = itemIndex + "." + mime.extension(file.mimetype);
        formData.append("Image", fs.createReadStream(file.path), filename);

        formData.append("Location", "uploads/Collections/" + UserInfo.UserName + "/" + Collection.ContractSymbol + "/Items/" + Artwork.Title + "/Thumb");
        let s3Store = await Axios.post(
          Config.Services.FileServiceApi,
          formData
        );
        Local = {
          "s3Image": s3Store.data.s3Image,
          "s3CImage": s3Store.data.s3CImage
        };
      } catch (error) {
        console.error(`Error occurred during local upload`);
      }

      res.code(200).send({
        status: true,
        Thumb: Local,
        IPFSThumb: IPFS,
        message: "Item Thumb Image Uploaded Successfully",
      });
      return;
    } else {
      res.code(403).send({
        status: false,
        info: "Something Went Wrong",
      });
      return;
    }
  } catch (error) {
    console.log("error-/itemthumb", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

// const GetAllGiftNft = (fastify) => async (req, res) => {
//   try {
  
//     let Info = await GiftNftModel.aggregate([
//       { $match: { CurrentOwner: new ObjectId(req.user.UserId) } },
//       {
//         $project: {
//           _id: 1,
//           Name: 1,
//           Thumb: {
//             $cond: {
//               if: {
//                 $ne: [
//                   { $ifNull: ["$Thumb.Local", ""] },
//                   ""
//                 ]
//               },
//               then: "$Thumb.Local",
//               else: {
//                 $ifNull: ["$Thumb.CLocal", ""]
//               }
//             }
//         }
//         }
//       },
//       { $sort: { _id: -1 } }
//     ])  

//     const giftQuery = `SELECT
//     _id,
//     "Name",
//     CASE
//         WHEN COALESCE("Thumb"."Local", '') != '' THEN "Thumb"."Local"
//         ELSE COALESCE("Thumb"."CLocal", '')
//     END AS "Thumb"
//     FROM
//         "GiftNft"
//     WHERE
//         "CurrentOwner" = '${req.user.UserId}' 
//     ORDER BY
//         _id DESC`;
   
//     const giftResult = await pool.query(giftQuery);
//     const Gift = giftResult.rows[0];

//     res.code(200).send({
//       status: true,
//       message: "GiftNFT details get successfully",
//       data: Gift,
//     });
    
//   } catch (error) {
//     console.log("Item get error ", error);
//     res.code(500).send({
//       status: true,
//       message: error,
//     });
//     return;
//   }
// };

const GetAllGiftNft = (fastify) => async (req, res) => {
  try {
    console.log("GetAllGiftNftinside")
    const giftQuery = `
      SELECT
        _id,
        "Name",
        "Thumb"
      FROM
        "GiftNFT"
      WHERE
        "UserId" = $1
      ORDER BY
        _id DESC`;

    const giftResult = await pool.query(giftQuery, [req.user.UserId]);
    const Gift = giftResult.rows.length > 0 ? giftResult.rows : [];

    res.code(200).send({
      status: true,
      message: "GiftNFT details get successfully",
      data: Gift,
    });
  } catch (error) {
    console.log("GetAllGiftNft", error)
    fastify.log.error("Item get error", error);

    res.code(500).send({
      status: true,
      message: error.message || "Internal Server Error",
    });
  }
};

const GetGiftItemInfo = (fastify) => async (req, res) => {
  try {


    let { ItemId } = req.body;

    console.log("GetGiftItemInfo")
    const giftQuery = `SELECT
       json_build_object(
        '_id', gn._id::text,
        'Name', gn."Name",
        'UserId', gn."UserId",
        'Thumb', gn."Thumb",
        'Media', gn."Media",
        'IPFSHash', gn."IPFSHash",
        'PublishStatus', gn."PublishStatus",
        'MarketPlaceStatus', gn."MarketPlaceStatus",
        'Currency', gn."Currency",
        'TokenId', gn."TokenId",
        'UpdatedAt', CASE
          WHEN gn."updatedAt" IS NOT NULL THEN TO_CHAR(gn."updatedAt", 'YYYY-MM-DD')
          ELSE ''
        END
      ) AS "ItemInfo",
      json_build_object(
        'UserName', u."UserName",
        'ProfilePicture', u."ProfilePicture",
        'Country', u."Country",
        'ProfileName', u."ProfileName",
        'WalletAddress', u."WalletAddress"
      ) AS "UserInfo",
      json_build_object(
        'ChainName', nw."ChainName",
        'FactoryContract', nw."GiftContract",
        'BlockExplorer', nw."BlockExplorer"
      ) AS "NetworkInfo",
      json_build_object(
        'TransactionHash', gh."TransactionHash",
        'HistoryType', gh."HistoryType",
        'CreatedAt', TO_CHAR(gh."createdAt", 'YYYY-MM-DD'),
        'UpdatedAt', TO_CHAR(gh."updatedAt", 'YYYY-MM-DD')
      ) AS "GitfHistory"
      FROM
        "GiftNFT" gn
      LEFT JOIN
        "Users" u ON gn."UserId" = u._id
      LEFT JOIN
        "Networks" nw ON gn."Currency" = nw."Currency"
      LEFT JOIN
        "GiftHistories" gh ON gn._id = gh."ItemId"
      WHERE
        gn._id = $1
      ORDER BY
        gn._id DESC;`
      ;

    const giftResult = await pool.query(giftQuery, [ItemId]);
    const Gift = giftResult.rows.length > 0 ? giftResult.rows : null;

    if (!Gift) {
      res.code(200).send({
        status: false,
        message: "Item Not Found",
        data: "",
      });
      return;
    } else {
       res.code(200).send({
        status: true,
        message: "Gift Item details get successfully",
        data: Gift,
      });
      return;
    }
  } catch (error) {
    console.log("Item get error ", error);
    res.code(500).send({
      status: true,
      message: error,
    });
    return;
  }
};

// const GetGiftItemInfo = (fastify) => async (req, res) => {
//   try {


//     let { ItemId } = req.body;

//     let Info = await GiftNftModel.aggregate([
//       { $match: { _id: new ObjectId(ItemId) } },
//       {
//         $lookup: {
//           from: "Users",
//           localField: "CurrentOwner",
//           foreignField: "_id",
//           as: "user_info",
//         },
//       },
//       {
//         $lookup: {
//           from: "Networks",
//           localField: "Currency",
//           foreignField: "Currency",
//           as: "network_info",
//         },
//       },
//       {
//         $lookup: {
//           from: "GiftHistories",
//           localField: "_id",
//           foreignField: "ItemId",
//           as: "gift_history_info",
//         },
//       },
//       {
//         $project: {
//           ItemInfo: {
//             _id: "$_id",
//             Name: "$Name",
//             CurrentOwner: "$CurrentOwner",
//             Thumb: {
//               $cond: {
//                 if: {
//                   $ne: [
//                     { $ifNull: ["$Thumb.CDN", ""] },
//                     ""
//                   ]
//                 },
//                 then: "$Thumb.CDN",
//                 else: {
//                   $ifNull: ["$Thumb.Local", ""]
//                 }
//               }
//             },
//             Media: {
//               $cond: {
//                 if: {
//                   $ne: [
//                     { $ifNull: ["$Media.CDN", ""] },
//                     ""
//                   ]
//                 },
//                 then: "$Media.CDN",
//                 else: {
//                   $ifNull: ["$Media.Local", ""]
//                 }
//               }
//             },
//             IPFSHash: "$IPFSHash",
//             PublishStatus: "$PublishStatus",
//             MarketPlaceStatus: "$MarketPlaceStatus",
//             Currency: "$Currency",
//             TokenId: "$TokenId",
//             ThumbIPFS: "$Thumb.IPFS",
//             MediaIPFS: "$Media.IPFS",
//             UpdatedAt: {
//               $cond: {
//                 if: {
//                   $and: [
//                     { $ne: ["$updatedAt", ""] },
//                     { $ne: ["$updatedAt", null] }
//                   ]
//                 },
//                 then: { $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$updatedAt" } } },
//                 else: ""
//               }
//           },
//           },
//           UserInfo: {
//             UserName: { $arrayElemAt: ["$user_info.UserName", 0] },
//             ProfilePicture: {
//               $cond: {
//                 if: { $ne: [{ $arrayElemAt: ["$user_info.ProfilePicture.CCDN", 0] }, ""] },
//                 then: { $arrayElemAt: ["$user_info.ProfilePicture.CCDN", 0] },
//                 else: {
//                   $cond: {
//                     if: { $ne: [{ $arrayElemAt: ["$user_info.ProfilePicture.CLocal", 0] }, ""] },
//                     then: { $arrayElemAt: ["$user_info.ProfilePicture.CLocal", 0] },
//                     else: { $arrayElemAt: ["$user_info.ProfilePicture.Local", 0] }
//                   }
//                 }
//               }
//             },
//             Country: { $arrayElemAt: ["$user_info.Country", 0] },
//             ProfileName: { $arrayElemAt: ["$user_info.ProfileName", 0] },
//             WalletAddress: { $arrayElemAt: ["$user_info.WalletAddress", 0] },
//           },
//           NetworkInfo: {
//             ChainName: { $arrayElemAt: ["$network_info.ChainName", 0],
//             },
//             FactoryContract: { $arrayElemAt: ["$network_info.GiftContract", 0],
//           },
//             BlockExplorer: { $arrayElemAt: ["$network_info.BlockExplorer", 0] },
//           },
//           GitfHistory: {
//             TransactionHash: { $arrayElemAt: ["$gift_history_info.TransactionHash", 0] },
//             HistoryType: { $arrayElemAt: ["$gift_history_info.HistoryType", 0] },
//             createdAt: { $arrayElemAt: ["$gift_history_info.createdAt", 0] },
//             updatedAt: { $arrayElemAt: ["$gift_history_info.updatedAt", 0] }
//           },
//         },
//       },
//       { $sort: { _id: -1 } },
//     ]);

//     if (!Info) {
//       res.code(200).send({
//         status: false,
//         message: "Item Not Found",
//         data: "",
//       });
//       return;
//     } else {
//        res.code(200).send({
//         status: true,
//         message: "Gift Item details get successfully",
//         data: Info,
//       });
//       return;
//     }
//   } catch (error) {
//     console.log("Item get error ", error);
//     res.code(500).send({
//       status: true,
//       message: error,
//     });
//     return;
//   }
// };

const ArtItemMediaUpload = (fatsify) => async (req, res) => {
  try {
    if (!req.file) {
      res.code(200).send({
        status: false,
        message: "Item Media Image is required",
      });
      return;
    }

    let itemId = req.body.ItemId

    if (!itemId) {
      res.code(200).send({
        status: false,
        message: "ItemId is Mandatory",
      });
      return;
    }

    const artworkQuery = 'SELECT * FROM "ArtItems" WHERE "_id" = $1';
    const artworkValues = [itemId];
    const artworkResult = await pool.query(artworkQuery, artworkValues);
    const Artwork = artworkResult.rows[0];

    const itemDataQuery = 'SELECT * FROM "ArtItems" WHERE "CollectionId" = $1 ORDER BY "_id"';
    const itemDataValues = [Artwork.CollectionId];
    const itemDataResult = await pool.query(itemDataQuery, itemDataValues);
    const itemdata = itemDataResult.rows;
    const itemIndex = itemdata.findIndex((item) => item._id == itemId);

    const collectionQuery = 'SELECT * FROM "Collections" WHERE "_id" = $1';
    const collectionValues = [Artwork.CollectionId];
    const collectionResult = await pool.query(collectionQuery, collectionValues);
    const Collection = collectionResult.rows[0];

    const userInfoQuery = 'SELECT * FROM "Users" WHERE "_id" = $1';
    const userInfoValues = [req.user.UserId];
    const userInfoResult = await pool.query(userInfoQuery, userInfoValues);
    const UserInfo = userInfoResult.rows[0];

    const dimensions = await sizeOf(req.file.path);
    const Width = dimensions.width;
    const Height = dimensions.height;

    if ((Width * Height) > 268402689) {
      res.code(200).send({
        status: false,
        message: `Image Size is too Large`,
      });
      return;
    }

    let mediaImage = sanitizeHtml(req.file.filename);

    let IPFS = "";
    let Local;

    if (mediaImage) {
      try {
        const ipfsUrl = await IPFSUpload(req.file); 
        IPFS = "https://ipfs.io/ipfs/" + ipfsUrl;
      } catch (error) {
        console.error("Error occurred during IPFS upload for Item Media Image");
      }

      try {
        let file = req.file;
        let formData = new FormData();
        filename = itemIndex + "." + mime.extension(file.mimetype);
        formData.append("Image", fs.createReadStream(file.path), filename);
        formData.append("Location", "uploads/Collections/" + UserInfo.UserName + "/" + Collection.ContractSymbol + "/Items/" + Artwork.Title + "/Media");
        let s3Store = await Axios.post(
          Config.Services.FileServiceApi,
          formData
        );
        Local = {
          "s3Image": s3Store.data.s3Image,
          "s3CImage": s3Store.data.s3CImage
        };
      } catch (error) {
        console.error(`Error occurred during local upload`);
      }


      res.code(200).send({
        status: true,
        Media: Local,
        IPFSMedia: IPFS,
        message: "Item Media Image Uploaded Successfully"
      });
      return;
    } else {
      res.code(403).send({
        status: false,
        info: "Something Went Wrong",
      });
      return;
    }
  } catch (error) {
    console.log("error-/itemmedia", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};


const BulkThumbUpload = (fastify) => async (req, res) => {
  try {
    if (!req.files) {
      res.code(200).send({
        status: false,
        message: "Artwork Thumb / Media Image is required",
      });
      return;
    }

    const ImageUploads = [];

    let { Quantity, CollectionId, Type } = req.body;

    const collectionQuery = 'SELECT * FROM "Collections" WHERE "_id" = $1';
    const collectionValues = [CollectionId];
    const collectionResult = await pool.query(collectionQuery, collectionValues);
    const CollectionInfo = collectionResult.rows[0];

    if (Type != "Media" && Type != "Thumb") {
      res.code(200).send({
        status: false,
        message: "Type Needs to be Thumb / Media",
      });
      return;
    }

    if (!CollectionInfo) {
      res.code(200).send({
        status: false,
        message: "Invalid Collection Id",
      });
      return;
    }

    if (Quantity != req.files.length) {
      res.code(200).send({
        status: false,
        message: "Quantity & File Count Mismatched",
      });
      return;
    }

    const total = req.files.length;
    const ic_arr = [];
    const img_arr = [];
    let formatvalidation = false;
    let ic = CollectionInfo.ItemCount;

    for (let i = 0; i < total; i++) {
      const image = req.files[i];
      const trm_files = image.originalname.split('.').slice(0, -1).join('.');
      ic++;
      ic_arr.push(ic.toString());
      img_arr.push(trm_files);
    }

    for (const element of img_arr) {
      if (ic_arr.includes(element)) {
        formatvalidation = true;
      } else {
        res.code(200).send({
          status: false,
          message: "Invalid File Formats"
        });
        return;
      }
    }

    let itemIndex = Number(CollectionInfo.ItemCount) + 1;

    for (const file of req.files) {
      let Local = "";

      if (file) {
        const Dimensions = await sizeOf(file.path);

        const Width = Dimensions.width;
        const Height = Dimensions.height;

        if ((Width * Height) > 268402689) {
          res.code(200).send({
            status: false,
            message: `Image Size is too Large`,
          });
          return;
        }

        try {
          const FN = file.filename.split('.')[0];
          const filename = FN + "." + mime.extension(file.mimetype);
          const formData = new FormData();
          formData.append("Image", fs.createReadStream(file.path), filename);
          if (Type == "Thumb") {
            formData.append("Location", "uploads/Media/Images/Items/Thumb");
          } else {
            formData.append("Location", "uploads/Media/Images/Items/Media");
          }

          const s3Store = await Axios.post(
            Config.Services.BulkFileServiceApi,
            formData
          );
          Local = s3Store.data.s3Image;
        } catch (error) {
          console.error(`Error occurred during local upload`);
        }

        const Thumb = Local;

        ImageUploads.push(Thumb);
        itemIndex++;
      }
    }

    const trimmedImageUploads = JSON.parse(JSON.stringify(ImageUploads).replace(/\s/g, ''));

    res.code(200).send({
      status: true,
      Thumb: trimmedImageUploads,
      message: "Images Uploaded Successfully",
    });

  } catch (error) {
    console.log("error-/itemmedia", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const BulkCsvUpload = (fatsify) => async (req, res) => {
  try {

    let { CollectionId, Media, Thumb, Quantity, Type } = req.body;

    MediaArray = [];
    ThumbArray = [];

    if (Array.isArray(Media)) {
      MediaArray = Media.map((element) => JSON.parse(element));
    } else {
      MediaArray.push(JSON.parse(Media));
    }

    if (Array.isArray(Thumb)) {
      ThumbArray = Thumb.map((element) => JSON.parse(element));
    } else {
      ThumbArray.push(JSON.parse(Thumb));
    }

    const collectionQuery = 'SELECT * FROM "Collections" WHERE "_id" = $1';
    const collectionValues = [CollectionId];
    const collectionResult = await pool.query(collectionQuery, collectionValues);
    const CollectionInfo = collectionResult.rows[0];

    if (!CollectionInfo) {
      res.code(200).send({
        status: false,
        message: "Invalid Collection ID",
      });
      return;
    }

    if (!req.file) {
      res.code(200).send({
        status: false,
        message: "CSV File is required",
      });
      return;
    }

    let file = req.file;
    const results = [];
    let errorsArray = [];
    fs.createReadStream(file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        if (Type === 'ArtProduct') {
          if (results.length > 100) {
            let fileLengthError = {
              "File length": "CSV item list must be less than or equal to 100 "
            }
            errorsArray.push(fileLengthError);
            console.log("CSVA1")
            return res.code(200).send({
              status: false,
              message: "CSV file error. Please check CSV file",
              errors: errorsArray
            });
            console.log("CSV1")
          }
          for (let index = 0; index < results.length; index++) {
            
            const element = results[index];
            console.log("element", element)
            let MatchingThumb = ThumbArray.find(url => {
              let thumbExtension = url.split('.').pop();
              let thumbFilename = url.split('/').pop().split('-')[0];
              return (
                thumbFilename === element.Thumb ||
                thumbFilename === element.Thumb.replace('.png', '') ||
                thumbFilename === element.Thumb.replace('.jpg', '') ||
                thumbFilename === element.Thumb.replace('.jpeg', '') ||
                thumbFilename === element.Thumb.replace('.jpeg', '.jpg') ||
                thumbFilename === element.Thumb.replace('.jpg', '.jpeg') ||
                (thumbExtension === 'jpg' && (element.Thumb.endsWith('.jpg') || element.Thumb.endsWith('.jpeg')))
              );
            });
            
            if (!MatchingThumb) {
              let thumbError = {
                "Thumb": element.Thumb + " not available in uploaded Thumb Folder"
              };
              errorsArray.push(thumbError);
            }
            
            let MatchingMedia = MediaArray.find(url => {
              let mediaExtension = url.split('.').pop();
              let mediaFilename = url.split('/').pop().split('-')[0];
              return (
                mediaFilename === element.Media ||
                mediaFilename === element.Media.replace('.png', '') ||
                mediaFilename === element.Media.replace('.jpg', '') ||
                mediaFilename === element.Media.replace('.jpeg', '') ||
                mediaFilename === element.Media.replace('.jpeg', '.jpg') ||
                mediaFilename === element.Media.replace('.jpg', '.jpeg') ||
                (mediaExtension === 'jpg' && (element.Media.endsWith('.jpg') || element.Media.endsWith('.jpeg')))
              );
            });
            
            
            // Check if element.Media exists in MediaArray
            if (!MatchingMedia) {
              let mediaError = {
                "Media": element.Media + " not available in uploaded Media Folder"
              };
              errorsArray.push(mediaError);
            }
            let title = await pool.query(`Select count(*)::integer FROM "ArtItems" WHERE "Title" = '${element.Title}'`)
            if (title.rows[0].count > 0) {
              let titleError = {
                "Title": element.Title + " Art item Name already exits"
              }
              errorsArray.push(titleError);
            }
            if (element.Unique === 'TRUE' || element.Unique === 'true' || element.Unique === 'True') {
              if (element.PhysicalEdition > 1 || element.DigitalEdition > 1) {
                let data = element.PhysicalEdition > 1 ? "PhysicalEdition" : "DigitalEdition"
                let uniqueError = {                  
                  [data]: "if  Unique is TRUE " + data + " not exceed more than one"
                }
                errorsArray.push(uniqueError);
              }
            }

            const CreationYear = Number(element.CreationYear);
            
            if (isNaN(CreationYear) || CreationYear < 1000 || CreationYear > 9999) {
              let CreationYearError = {
                "CreationYear": element.CreationYear + " Invalid creation year "
              }
              errorsArray.push(CreationYearError);
            }

             // List of properties to validate
            const propertiesToValidate = [
              "PhysicalEdition", "DigitalEdition", "PackageHeight", "PackageWidth", "PackageWeightValue", "PhysicalPrice", "DigitalPrice", "PriceNegotiation" , "PackageDepth"
            ];

            // Iterate through the properties and validate each one
            propertiesToValidate.forEach(property => {
              const error = validateProperty(element, property);
              if (error) {
                errorsArray.push(error);
              }
            });

            if (element.ProductBrand) {
              const ProductBrand = (await pool.query('SELECT * FROM "ArtProductBrand" WHERE "Title" = $1 LIMIT 1;', [element.ProductBrand])).rows[0];
              if (!ProductBrand) {
                let ProductBrandError = {
                  "ProductBrand": element.ProductBrand + " Invalid ProductBrand "
                }
                errorsArray.push(ProductBrandError);
              }

            }
            const ProductCategory = (await pool.query('SELECT * FROM "ArtProductCategory" WHERE "Title" = $1 LIMIT 1;', [element.ProductCategory])).rows[0];
            if (!ProductCategory) {
              let ProductCategoryError = {
                "ProductCategory": element.ProductCategory + " Invalid ProductCategory "
              }
              errorsArray.push(ProductCategoryError);
            }
            if (element.ProductFabric) {
              const ProductFabric = (await pool.query('SELECT * FROM "ArtProductFabric" WHERE "Title" = $1 LIMIT 1;', [element.ProductFabric])).rows[0];
              if (!ProductFabric) {
                let ProductFabricError = {
                  "ProductFabric": element.ProductFabric + " Invalid ProductFabric "
                }
                errorsArray.push(ProductFabricError);
              }
            }
            if (element.ProductMaterial) {
              const ProductMaterial = (await pool.query('SELECT * FROM "ArtProductMaterial" WHERE "Title" = $1 LIMIT 1;', [element.ProductMaterial])).rows[0];
              if (!ProductMaterial) {
                let ProductMaterialError = {
                  "ProductMaterial": element.ProductMaterial + " Invalid ProductMaterial "
                }
                errorsArray.push(ProductMaterialError);
              }
            }
            if (element.ProductName) {
              const ProductName = (await pool.query('SELECT * FROM "ArtProductName" WHERE "Title" = $1 LIMIT 1;', [element.ProductName])).rows[0];
              if (!ProductName) {
                let ProductMaterialError = {
                  "ProductName": element.ProductName + " Invalid ProductName "
                }
                errorsArray.push(ProductMaterialError);
              }
            }
            if (element.ProductSize) {
              const ProductSize = (await pool.query('SELECT * FROM "ArtProductSize" WHERE "Title" = $1 LIMIT 1;', [element.ProductSize])).rows[0];
              if (!ProductSize) {
                let ProductSizeError = {
                  "ProductSize": element.ProductSize + " Invalid ProductSize "
                }
                errorsArray.push(ProductSizeError);
              }
            }
            if (element.ProductStyle) {
              const ProductStyle = (await pool.query('SELECT * FROM "ArtProductStyle" WHERE "Title" = $1 LIMIT 1;', [element.ProductStyle])).rows[0];
              if (!ProductStyle) {
                let ProductStyleError = {
                  "ProductStyle": element.ProductStyle + " Invalid ProductStyle "
                }
                errorsArray.push(ProductStyleError);
              }
            }
            if (element.ProductShape) {
              const ProductShape = (await pool.query('SELECT * FROM "ArtProductShape" WHERE "Title" = $1 LIMIT 1;', [element.ProductShape])).rows[0];
              if (!ProductShape) {
                let ProductShapeError = {
                  "ProductShape": element.ProductShape + " Invalid ProductShape "
                }
                errorsArray.push(ProductShapeError);
              }
            }

            if (element.ProductType) {
              const ProductType = (await pool.query('SELECT * FROM "ArtProductType" WHERE "Title" = $1 LIMIT 1;', [element.ProductType])).rows[0];
              if (!ProductType) {
                let ProductTypeError = {
                  "ProductType": element.ProductType + " Invalid ProductType "
                }
                errorsArray.push(ProductTypeError);
              }
            }
            if (element.ProductTechnique) {
              const ProductTechnique = (await pool.query('SELECT * FROM "ArtProductTechnique" WHERE "Title" = $1 LIMIT 1;', [element.ProductTechnique])).rows[0];
              if (!ProductTechnique) {
                let ProductTechniqueError = {
                  "ProductTechnique": element.ProductTechnique + " Invalid ProductTechnique"
                }
                errorsArray.push(ProductTechniqueError);
              }
            }
            if (element.PackageDimension && element.PackageDimension !== "IN" && element.PackageDimension !== "CM") {
              let PackageDimensionError = {
                "PackageDimension": element.PackageDimension + " Invalid PackageDimension"
              }
              errorsArray.push(PackageDimensionError);
            }
            if (element.PackageWeight && element.PackageWeight !== "KG" && element.PackageWeight !== "LB") {
              let PackageWeightError = {
                "PackageWeight": element.PackageWeight + " Invalid PackageWeight"
              }
              errorsArray.push(PackageWeightError);
            }

          }

          if (errorsArray.length > 0) {
            console.log("CSVA2")
            return res.code(200).send({
              status: false,
              message: "CSV file error. Please check CSV file",
              errors: errorsArray
            });
            console.log("CSV2")
          }
        } else {
          if (results.length > 100) {
            let fileLengthError = {
              "File length": "CSV item list must be less than or equal to 100 "
            }
            errorsArray.push(fileLengthError);
            console.log("CSVA3")
            return res.code(200).send({
              status: false,
              message: "CSV file error. Please check CSV file",
              errors: errorsArray
            });
            console.log("CSV3")
          }
          for (let index = 0; index < results.length; index++) {
            const element = results[index];
            console.log("element", element)

            console.log("ThumbArray", ThumbArray)
            console.log("element.Thumb", element.Thumb)

            let MatchingThumb = ThumbArray.find(url => {
              let thumbExtension = url.split('.').pop();
              let thumbFilename = url.split('/').pop().split('-')[0];
              return (
                thumbFilename === element.Thumb ||
                thumbFilename === element.Thumb.replace('.png', '') ||
                thumbFilename === element.Thumb.replace('.jpg', '') ||
                thumbFilename === element.Thumb.replace('.jpeg', '') ||
                thumbFilename === element.Thumb.replace('.jpeg', '.jpg') ||
                thumbFilename === element.Thumb.replace('.jpg', '.jpeg') ||
                (thumbExtension === 'jpg' && (element.Thumb.endsWith('.jpg') || element.Thumb.endsWith('.jpeg')))
              );
            });
            
            if (!MatchingThumb) {
              let thumbError = {
                "Thumb": element.Thumb + " not available in uploaded Thumb Folder"
              };
              errorsArray.push(thumbError);
            }
            
            let MatchingMedia = MediaArray.find(url => {
              let mediaExtension = url.split('.').pop();
              let mediaFilename = url.split('/').pop().split('-')[0];
              return (
                mediaFilename === element.Media ||
                mediaFilename === element.Media.replace('.png', '') ||
                mediaFilename === element.Media.replace('.jpg', '') ||
                mediaFilename === element.Media.replace('.jpeg', '') ||
                mediaFilename === element.Media.replace('.jpeg', '.jpg') ||
                mediaFilename === element.Media.replace('.jpg', '.jpeg') ||
                (mediaExtension === 'jpg' && (element.Media.endsWith('.jpg') || element.Media.endsWith('.jpeg')))
              );
            });
            
            
            // Check if element.Media exists in MediaArray
            if (!MatchingMedia) {
              let mediaError = {
                "Media": element.Media + " not available in uploaded Media Folder"
              };
              errorsArray.push(mediaError);
            }

            let title = await pool.query(`Select count(*)::integer FROM "ArtItems" WHERE "Title" = '${element.Title}'`)
            if (title.rows[0].count > 0) {
              let titleError = {
                "Title": element.Title + " Art item Name already exits"
              }
              errorsArray.push(titleError);
            }

            if (element.Unique === 'TRUE' || element.Unique === 'true' || element.Unique === 'True' ) {
              if (element.PhysicalEdition > 1 || element.DigitalEdition > 1) {
                let data = element.PhysicalEdition > 1 ? "PhysicalEdition" : "DigitalEdition"
                let uniqueError = {                  
                  [data]: "if  Unique is TRUE " + data + " not exceed more than one"
                }
                errorsArray.push(uniqueError);
              }
            } else if (isNaN(element.PhysicalEdition) || isNaN(element.DigitalEdition)) {
                let data = isNaN(element.PhysicalEdition) ? "PhysicalEdition" : "DigitalEdition"
                let uniqueError = {                  
                  [data]: "if  Unique is TRUE " + data + " not exceed more than one"
                }
                errorsArray.push(uniqueError);
            }

            const CreationYear = Number(element.CreationYear);
            console.log("CreationYear", CreationYear)
            if (isNaN(CreationYear) || CreationYear < 1000 || CreationYear > 9999) {
              let CreationYearError = {
                "CreationYear": element.CreationYear + " Invalid creation year "
              }
              errorsArray.push(CreationYearError);
            }

            // List of properties to validate
            const propertiesToValidate = [
              "Width",
              "Height",
              "Depth",
              "PackageHeight",
              "PackageWidth",
              "PackageDepth",
              "PackageWeightValue",
              "PhysicalPrice",
              "DigitalPrice",
              "PriceNegotiation"
            ];

            // Iterate through the properties and validate each one
            propertiesToValidate.forEach(property => {
              const error = validateProperty(element, property);
              if (error) {
                errorsArray.push(error);
              }
            });

            const Categoryget = (await pool.query('SELECT * FROM "Categories" WHERE "Title" = $1 LIMIT 1;', [element.Category])).rows[0];
            if (!Categoryget) {
              let categoryError = {
                "Category": element.category + " Invalid category"
              }
              errorsArray.push(categoryError);
            }
            if (element.Dimension !== "IN" && element.Dimension !== "CM") {
              let dimensionError = {
                "Dimension": element.Dimension + " Invalid Dimension"
              }
              errorsArray.push(dimensionError);
            }
            if (element.Panel && element.Panel !== "Single" && element.Panel !== "Multiple") {
              let PanelError = {
                "Panel": element.Panel + " Invalid Panel"
              }
              errorsArray.push(PanelError);
            }
            if (element.PackageDimension && element.PackageDimension !== "IN" && element.PackageDimension !== "CM") {
              let PackageDimensionError = {
                "PackageDimension": element.PackageDimension + " Invalid PackageDimension"
              }
              errorsArray.push(PackageDimensionError);
            }
            if (element.PackageWeight && element.PackageWeight !== "KG" && element.PackageWeight !== "LB") {
              let PackageWeightError = {
                "PackageWeight": element.PackageWeight + " Invalid PackageWeight"
              }
              errorsArray.push(PackageWeightError);
            }
            const Materials = element.Material.split(",").map(material => material.trim()).filter(material => material !== "");
            const Keywords = element.Keywords.split(",").map(keyword => keyword.trim()).filter(keyword => keyword !== "");
            const Styles = element.Style.split(",").map(style => style.trim()).filter(style => style !== "");
            const Subjects = element.Subject.split(",").map(subj => subj.trim()).filter(subj => subj !== "");
            for (const value of Materials) {
              const matchingMaterial = (await pool.query('SELECT * FROM "Materials" WHERE "Title" = $1 LIMIT 1;', [value])).rows[0];
              if (!matchingMaterial) {
                let MaterialError = {
                  "Material": value + " Invalid Material"
                }
                errorsArray.push(MaterialError);
              }
            }
            for (const value of Keywords) {
              const matchingKeywd = (await pool.query('SELECT * FROM "KeyWords" WHERE "Title" = $1 LIMIT 1;', [value])).rows[0];
              if (!matchingKeywd) {
                let KeywordError = {
                  "Keyword": value + " Invalid Keyword"
                }
                errorsArray.push(KeywordError);
              }
            }
            for (const value of Styles) {
              const matchingstyle = (await pool.query('SELECT * FROM "Style" WHERE "Title" = $1 LIMIT 1;', [value])).rows[0];
              if (!matchingstyle) {
                let StyleError = {
                  "Style": value + " Invalid Style"
                }
                errorsArray.push(StyleError);
              }
            }
            for (const value of Subjects) {
              const matchingsubject = (await pool.query('SELECT * FROM "Medium" WHERE "Title" = $1 LIMIT 1;', [value])).rows[0];
              if (!matchingsubject) {
                let SubjectError = {
                  "Subject": value + " Invalid Subject"
                }
                errorsArray.push(SubjectError);
              }
            }
            console.log("errors each", errorsArray);
          }
          if (errorsArray.length > 0) {
            console.log("CSVA4")
            return res.code(200).send({
              status: false,
              message: "CSV file error. Please check CSV file",
              errors: errorsArray
            });
            console.log("CSV4")
          }
        }
        if (file && errorsArray.length === 0) {

          let Local = "";
    
          try {
            filename = file.filename + "." + mime.extension(file.mimetype);
            const formData = new FormData();
    
            formData.append("Image", fs.createReadStream(file.path), filename);
            formData.append("Location", "uploads/BulkArtwork");
            const s3Store = await Axios.post(
              Config.Services.FileServiceApi,
              formData
            );
            Local = s3Store.data.s3Image;
          } catch (error) {
            console.error(`Error occurred during local upload`);
          }
    
          if (Local) {
            let FilePath = Local;
    
            const tempCsvInsertQuery = `
              INSERT INTO "TempCsv" (
                "FilePath",
                "CollectionId",
                "Media",
                "Thumb",
                "Type",
                "Quantity",
                "AuthorId"
                
              ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            `;
            const tempCsvInsertValues = [
              FilePath,
              CollectionId,
              MediaArray,
              ThumbArray,
              Type || 'Artwork',
              Quantity,
              req.user.UserId,
    
            ];
            await pool.query(tempCsvInsertQuery, tempCsvInsertValues);
    
            const userInfoQuery = 'SELECT * FROM "Users" WHERE "_id" = $1';
            const userInfoValues = [req.user.UserId];
            const userInfoResult = await pool.query(userInfoQuery, userInfoValues);
            const UserInfo = userInfoResult.rows[0];
    
            await Axios.post(Config.Services.EmailService + "/CSVSuccessEmail", {
              To: UserInfo.Email,
              Content: "CSV Upload For Bulk Mint Uploaded Successfully. Once the File get processed the Artworks will get Created"
            });
    
            res.code(200).send({
              status: true,
              message: "Bulk Mint Form Submitted Successfully",
            });
            return;
          } else {
            res.code(200).send({
              status: false,
              message: "Error in Submitting Bulk Mint Form",
            });
            return;
          }
        }
      });    
    
  } catch (error) {
    console.log("error-/itemmedia", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

function validateProperty(element, propertyName) {
  if (isNaN(element[propertyName])) {
    return {
      [propertyName]: "Numbers only  accepted"///element[propertyName] + " Numbers only  accepted" //` Invalid ${propertyName}`
    };
  }
  return null;
}

const CategoryList = (fastify) => async (req, res) => {
  try {

    console.log("testconsole")
    let CategoryData = await Axios.get(
      Config.Services.ItemService + "/CategoryList"
    );

    res.code(200).send({
      status: CategoryData.data.status,
      data: CategoryData.data.data,
    });
    return;
  } catch (error) {
    console.log("error-/getcategories", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const APCategoryList = (fastify) => async (req, res) => {
  try {

    let CategoryData = await Axios.get(
      Config.Services.ItemService + "/APCategoryList"
    );

    res.code(200).send({
      status: CategoryData.data.status,
      data: CategoryData.data.data,
    });
    return;
  } catch (error) {
    console.log("error-/getcategories", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const APStyleList = (fastify) => async (req, res) => {
  try {


    let Data = await Axios.get(
      Config.Services.ItemService + "/APStyleList"
    );

    res.code(200).send({
      status: Data.data.status,
      data: Data.data.data,
    });
    return;
  } catch (error) {
    console.log("error-/getcategories", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const APMaterialList = (fastify) => async (req, res) => {
  try {


    let Data = await Axios.get(
      Config.Services.ItemService + "/APMaterialList"
    );

    res.code(200).send({
      status: Data.data.status,
      data: Data.data.data,
    });
    return;
  } catch (error) {
    console.log("error-/getcategories", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const APFabricList = (fastify) => async (req, res) => {
  try {


    let Data = await Axios.get(
      Config.Services.ItemService + "/APFabricList"
    );

    res.code(200).send({
      status: Data.data.status,
      data: Data.data.data,
    });
    return;
  } catch (error) {
    console.log("error-/getcategories", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const APBrandList = (fastify) => async (req, res) => {
  try {

    let Data = await Axios.get(
      Config.Services.ItemService + "/APBrandList"
    );

    res.code(200).send({
      status: Data.data.status,
      data: Data.data.data,
    });
    return;
  } catch (error) {
    console.log("error-/getcategories", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const APShapeList = (fastify) => async (req, res) => {
  try {

    let Data = await Axios.get(
      Config.Services.ItemService + "/APShapeList"
    );

    res.code(200).send({
      status: Data.data.status,
      data: Data.data.data,
    });
    return;
  } catch (error) {
    console.log("error-/getcategories", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const APTypeList = (fastify) => async (req, res) => {
  try {


    let Data = await Axios.get(
      Config.Services.ItemService + "/APTypeList"
    );

    res.code(200).send({
      status: Data.data.status,
      data: Data.data.data,
    });
    return;
  } catch (error) {
    console.log("error-/getcategories", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const APTechniqueList = (fastify) => async (req, res) => {
  try {

    let Data = await Axios.get(
      Config.Services.ItemService + "/APTechniqueList"
    );

    res.code(200).send({
      status: Data.data.status,
      data: Data.data.data,
    });
    return;
  } catch (error) {
    console.log("error-/getcategories", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const APCushionSizeList = (fastify) => async (req, res) => {
  try {

    let Data = await Axios.get(
      Config.Services.ItemService + "/APCushionSizeList"
    );

    res.code(200).send({
      status: Data.data.status,
      data: Data.data.data,
    });
    return;
  } catch (error) {
    console.log("error-/getcategories", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const APRugSizeList = (fastify) => async (req, res) => {
  try {

    let Data = await Axios.get(
      Config.Services.ItemService + "/APRugSizeList"
    );

    res.code(200).send({
      status: Data.data.status,
      data: Data.data.data,
    });
    return;
  } catch (error) {
    console.log("error-/getcategories", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const APFurnitureNameList = (fastify) => async (req, res) => {
  try {


    let Data = await Axios.get(
      Config.Services.ItemService + "/APFurnitureNameList"
    );

    res.code(200).send({
      status: Data.data.status,
      data: Data.data.data,
      category: Data.data.category
    });
    return;
  } catch (error) {
    console.log("error-/getcategories", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const APLightingNameList = (fastify) => async (req, res) => {
  try {


    let Data = await Axios.get(
      Config.Services.ItemService + "/APLightingNameList"
    );

    res.code(200).send({
      status: Data.data.status,
      data: Data.data.data,
      category: Data.data.category

    });
    return;
  } catch (error) {
    console.log("error-/getcategories", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const APFurnishingNameList = (fastify) => async (req, res) => {
  try {


    let Data = await Axios.get(
      Config.Services.ItemService + "/APFurnishingNameList"
    );

    res.code(200).send({
      status: Data.data.status,
      data: Data.data.data,
      category: Data.data.category
    });
    return;
  } catch (error) {
    console.log("error-/getcategories", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const APNameList = (fastify) => async (req, res) => {
  try {

    let Data = await Axios.get(
      Config.Services.ItemService + "/APNameList"
    );

    res.code(200).send({
      status: Data.data.status,
      data: Data.data.data,
    });
    return;
  } catch (error) {
    console.log("error-/getcategories", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const MaterialList = (fastify) => async (req, res) => {
  try {

    let MaterialData = await Axios.get(
      Config.Services.ItemService + "/MaterialList"
    );

    res.code(200).send({
      status: MaterialData.data.status,
      data: MaterialData.data.data,
    });
    return;
  } catch (error) {
    console.log("error-/getmaterials", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const MediumList = (fastify) => async (req, res) => {
  try {

    let MediumData = await Axios.get(
      Config.Services.ItemService + "/MediumList"
    );

    res.code(200).send({
      status: MediumData.data.status,
      data: MediumData.data.data,
    });
    return;
  } catch (error) {
    console.log("error-/getmedium", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const ArtistCategoryList = (fastify) => async (req, res) => {
  try {
    let Data = await Axios.get(
      Config.Services.ItemService + "/ArtistCategoryList"
    );

    res.code(200).send({
      status: Data.data.status,
      data: Data.data.data,
    });
    return;
  } catch (error) {
    console.log("error-/getartistcategories", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const ArtistLabelList = (fastify) => async (req, res) => {
  try {
    let Data = await Axios.get(
      Config.Services.ItemService + "/ArtistLabelList"
    );

    res.code(200).send({
      status: Data.data.status,
      data: Data.data.data,
    });
    return;
  } catch (error) {
    console.log("error-/getartistlabels", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const ArtistMediumList = (fastify) => async (req, res) => {
  try {
    let Data = await Axios.get(
      Config.Services.ItemService + "/ArtistMediumList"
    );

    res.code(200).send({
      status: Data.data.status,
      data: Data.data.data,
    });
    return;
  } catch (error) {
    console.log("error-/getartistmedium", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const ArtistStyleList = (fastify) => async (req, res) => {
  try {
    let Data = await Axios.get(
      Config.Services.ItemService + "/ArtistStyleList"
    );

    res.code(200).send({
      status: Data.data.status,
      data: Data.data.data,
    });
    return;
  } catch (error) {
    console.log("error-/getartiststyles", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const StylesList = (fastify) => async (req, res) => {
  try {

    let StyleData = await Axios.get(
      Config.Services.ItemService + "/StylesList"
    );

    res.code(200).send({
      status: StyleData.data.status,
      data: StyleData.data.data,
    });
    return;
  } catch (error) {
    console.log("error-/getstyle", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const KeywordsList = (fastify) => async (req, res) => {
  try {
    if (req.user.Role == "Buyer") {
      res.code(200).send({
        status: false,
        message: "Not Allowed For " + req.user.Role + " Role",
      });
      return;
    }

    let keyData = await Axios.get(Config.Services.ItemService + "/KeywordList");

    res.code(200).send({
      status: keyData.data.status,
      data: keyData.data.data,
    });
    return;
  } catch (error) {
    console.log("error-/getstyle", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};



const CreateArtItemGeneral = (fastify) => async (req, res) => {
  try {
    if (req.user.Role == "Buyer") {
      res.code(200).send({
        status: false,
        message: "Not Allowed For " + req.user.Role + " Role",
      });
      return;
    }
    let {
      Title,
      CreationYear,
      Unique,
      Category,
      Material,
      MaterialId,
      PhysicalEdition,
      DigitalEdition,
      Publisher,
      Dimension,
      Height,
      Width,
      Depth,
      Color,
      Orientation,
      CollectionId,
      Artworkid,
      ProductCategory,
      ProductMaterial,
      ProductStyle,
      ProductName,
      ProductBrand,
      ProductSize,
      ProductShape,
      ProductFabric,
      ProductType,
      ProductTechnique,
      Type
    } = req.body;

    let ItemCreate = await Axios.post(
      Config.Services.ItemService + "/AddArtItemGeneral",
      {
        Title: Title,
        CreationYear: CreationYear,
        Category: Category,
        Artworkid: Artworkid,
        Material: Material,
        MaterialId: MaterialId,
        Unique: Unique,
        AuthorId: req.user.UserId,
        PhysicalEdition: PhysicalEdition,
        DigitalEdition: DigitalEdition,
        Publisher: Publisher,
        Dimension: Dimension,
        Height: Height,
        Color: Color,
        Orientation: Orientation,
        ProductName: ProductName,
        ProductCategory: ProductCategory,
        ProductBrand: ProductBrand,
        ProductFabric: ProductFabric,
        ProductSize: ProductSize,
        ProductStyle: ProductStyle,
        ProductType: ProductType,
        ProductTechnique: ProductTechnique,
        ProductMaterial: ProductMaterial,
        ProductShape: ProductShape,
        Type: Type,
        Width: Width,
        Depth: Depth,
        CollectionId: CollectionId
      }
    );

    res.code(200).send({
      status: ItemCreate.data.status,
      message: ItemCreate.data.message,
      Artworkid: ItemCreate.data.Artworkid,
    });
    return;
  } catch (error) {
    console.log("error-/createartwork", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};


const CreateArtItemArtistDetail = (fastify) => async (req, res) => {
  try {
    if (req.user.Role === "Buyer") {
      res.code(200).send({
        status: false,
        message: "Not Allowed For " + req.user.Role + " Role",
      });
      return;
    }

    let {
      Figurative,
      Series,
      Style,
      StyleId,
      Subject,
      SubjectId,
      Keywords,
      KeywordsId,
      Condition,
      Signature,
      Description,
      Artworkid

    } = req.body;

  
    let ItemCreate = await Axios.post(
      Config.Services.ItemService + "/AddArtItemArtistDetail",
      {
        Figurative: Figurative,
        Series: Series,
        Style: Style,
        StyleId: StyleId,
        Subject: Subject,
        SubjectId: SubjectId,
        Condition: Condition,
        Keywords: Keywords,
        KeywordsId: KeywordsId,
        Signature: Signature,
        Description: Description,
        Artworkid: Artworkid,
      }
    );

    res.code(200).send({
      status: ItemCreate.data.status,
      message: ItemCreate.data.message,
      Artworkid: ItemCreate.data.Artworkid,
    });
    return;
  } catch (error) {
    console.log("error-/createartwork", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};


const CreateArtItemPriceDetail = (fastify) => async (req, res) => {
  try {
    if (req.user.Role === "Buyer") {
      res.code(200).send({
        status: false,
        message: "Not Allowed For " + req.user.Role + " Role",
      });
      return;
    }

    let {
      Currency,
      PhysicalPrice,
      DigitalPrice,
      PriceTransparency,
      PriceDisplay,
      AutoAcceptOffers,
      AutoRejectOffers,
      Artworkid,
    } = req.body;

    let ItemCreate = await Axios.post(
      Config.Services.ItemService + "/AddArtItemPriceDetail",
      {
        PhysicalPrice: PhysicalPrice,
        DigitalPrice: DigitalPrice,
        Currency: Currency,
        PriceTransparency: PriceTransparency,
        PriceDisplay: PriceDisplay,
        AutoAcceptOffers: AutoAcceptOffers,
        AutoRejectOffers: AutoRejectOffers,
        Artworkid: Artworkid,
      }
    );

    res.code(200).send({
      status: ItemCreate.data.status,
      message: ItemCreate.data.message,
      Artworkid: ItemCreate.data.Artworkid,
    });
    return;
  } catch (error) {
    console.log("error-/createartwork", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

/* Handler for creating artwork with logistic details */

const CreateArtItemLogisticDetail = (fastify) => async (req, res) => {
  try {
    if (req.user.Role == "Buyer") {
      res.code(200).send({
        status: false,
        message: "Not Allowed For " + req.user.Role + " Role",
      });
      return;
    }

    let {
      Framed,
      Panel,
      Artworkid,
      Packaging,
      PackageDimension,
      PackageHeight,
      PackageWidth,
      PackageDepth,
      PackageWeight,
      PackageWeightValue,
    } = req.body;

    
    let ItemCreate = await Axios.post(
      Config.Services.ItemService + "/AddArtItemLogisticDetail",
      {
        Artworkid: Artworkid,
        Framed: Framed,
        Panel: Panel,
        Packaging: Packaging,
        PackageDimension: PackageDimension,
        PackageHeight: PackageHeight,
        PackageWidth: PackageWidth,
        PackageDepth: PackageDepth,
        PackageWeight: PackageWeight,
        PackageWeightValue: PackageWeightValue,
      }
    );

    res.code(200).send({
      status: ItemCreate.data.status,
      message: ItemCreate.data.message,
      Artworkid: ItemCreate.data.Artworkid,
    });
    return;
  } catch (error) {
    console.log("error-/createartwork", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};


const CreateArtItemImageDetail = (fastify) => async (req, res) => {
  try {
    if (req.user.Role == "Buyer") {
      res.code(200).send({
        status: false,
        message: "Not Allowed For " + req.user.Role + " Role",
      });
      return;
    }

    let { Artworkid, Thumb, Media, IPFSThumb, IPFSMedia } = req.body;
  
    let ItemCreate = await Axios.post(
      Config.Services.ItemService + "/AddArtItemImageDetail",
      {
        Artworkid: Artworkid,
        Thumb: Thumb,
        Media: Media,
        IPFSThumb: IPFSThumb,
        IPFSMedia: IPFSMedia
      }
    );

    res.code(200).send({
      status: ItemCreate.data.status,
      message: ItemCreate.data.message,
      Artworkid: ItemCreate.data.Artworkid,
    });
    return;
  } catch (error) {
    console.log("error-/createartwork", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const ListItem = (fastify) => async (req, res) => {
  try {

    let { ItemId, Edition, TransactionHash, Type } = req.body;

    ItemId = sanitizeHtml(ItemId);
    TransactionHash = sanitizeHtml(TransactionHash);

    let ItemListUpdate = await Axios.post(
      Config.Services.ItemService + "/ListItem",
      {
        ItemId: ItemId,
        Edition: Edition,
        Type: Type,
        AuthorId: req.user.UserId,
        TransactionHash: TransactionHash,
      }
    );
    if (Type == 'Auction') {
      let getPageOnlineSocket = await pool.query(`Select "SocketId" from "SocketId" where "Online" = true`)
      const io = fastify.io;
      if (getPageOnlineSocket.rows.length > 0) {
        for (let index = 0; index < getPageOnlineSocket.rows.length; index++) {
          AuctionData = await Auctions("Past");
          io.to(getPageOnlineSocket.rows[index].SocketId).emit('GetPastAuctions', AuctionData);
          AuctionData = await Auctions("Future");
          io.to(getPageOnlineSocket.rows[index].SocketId).emit('GetFutureAuctions', AuctionData);
          AuctionData = await Auctions("Ongoing");
          io.to(getPageOnlineSocket.rows[index].SocketId).emit('GetOnGoingAuctions', AuctionData);
        }
      }
    }
    res.code(200).send({
      status: ItemListUpdate.data.status,
      message: ItemListUpdate.data.message,
    });
    return;
  } catch (error) {
    console.log("error-/listitem", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const AddToCart = (fastify) => async (req, res) => {
  try {
    let { ItemId, Edition } = req.body;

    let AddcartUpdate = await Axios.post(
      Config.Services.ItemService + "/AddCart",
      {
        ItemId: ItemId,
        Edition: Edition,
        AuthorId: req.user.UserId,
      }
    );

    res.code(200).send({
      status: AddcartUpdate.data.status,
      message: AddcartUpdate.data.message,
    });
    return;
  } catch (error) {
    console.log("error-/addcart", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const RemoveCart = (fastify) => async (req, res) => {
  try {
    let { CartId } = req.body;


    let RemovecartUpdate = await Axios.post(
      Config.Services.ItemService + "/RemoveFromCart",
      {
        CartId: CartId,
        AuthorId: req.user.UserId,
      }
    );

    res.code(200).send({
      status: RemovecartUpdate.data.status,
      message: RemovecartUpdate.data.message,
    });
    return;
  } catch (error) {
    console.log("error-/removecart", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};



const SellNFT = (fastify) => async (req, res) => {
  try {

    let { Price, EnableAuction, EnableBid, DateRange, TimeZone, ItemId } =
      req.body;

    let DateRangeBid;

    if (EnableAuction) {
      if (DateRange == "") {
        res.code(200).send({
          status: false,
          message: "Invalid Date Range",
          error: "error",
        });
        return;
      }
    }

    if (EnableBid) {
      if (DateRange == "") {
        res.code(200).send({
          status: false,
          message: "Invalid Date Range For Bid",
          error: "error",
        });
        return;
      }

      DateRangeBid = DateRange;
      DateRange = "";
    }

    let ItemUpdate = await Axios.post(
      Config.Services.ItemService + "/UpdateItem",
      {
        ItemId: ItemId,
        AuthorId: req.user.UserId,
        Price: Price,
        EnableAuction: EnableAuction || false,
        EnableBid: EnableBid || false,
        DateRange: DateRange || "",
        DateRangeBid: DateRangeBid || "",
        TimeZone: TimeZone || "",
        UserId: req.user.UserId,
      }
    );

    res.code(200).send({
      status: ItemUpdate.data.status,
      message: ItemUpdate.data.message,
    });
    return;
  } catch (error) {
    console.log("error-/updateitem", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const DelistArtNFT = (fastify) => async (req, res) => {
  try {

    let { ItemId, Edition } = req.body;

    let ItemUpdate = await Axios.post(
      Config.Services.ItemService + "/DelistArtItem",
      {
        ItemId: ItemId,
        Edition: Edition
      }
    );

    res.code(200).send({
      status: ItemUpdate.data.status,
      message: ItemUpdate.data.message,
    });
    return;
  } catch (error) {
    console.log("error-/updateitem", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const HideArtNFT = (fastify) => async (req, res) => {
  try {

    let { ItemId } = req.body;

    let ItemUpdate = await Axios.post(
      Config.Services.ItemService + "/HideArtItem",
      {
        ItemId: ItemId
      }
    );

    res.code(200).send({
      status: ItemUpdate.data.status,
      message: ItemUpdate.data.message,
    });
    return;
  } catch (error) {
    console.log("error-/updateitem", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const SellArtNFT = (fastify) => async (req, res) => {
  try {

    let { EnableAuction, EnableBid, DateRange, TimeZone, ItemId, Edition } = req.body;

    let DateRangeBid;

    if (EnableAuction) {
      if (DateRange == "") {
        res.code(200).send({
          status: false,
          message: "Invalid Date Range",
          error: "error",
        });
        return;
      }
    }

    if (EnableBid) {
      if (DateRange == "") {
        res.code(200).send({
          status: false,
          message: "Invalid Date Range For Bid",
          error: "error",
        });
        return;
      }

      DateRangeBid = DateRange;
      DateRange = "";
    }

    let ItemUpdate = await Axios.post(
      Config.Services.ItemService + "/UpdateArtItem",
      {
        ItemId: ItemId,
        AuthorId: req.user.UserId,
        Edition: Edition,
        EnableAuction: EnableAuction || false,
        EnableBid: EnableBid || false,
        DateRange: DateRange || "",
        DateRangeBid: DateRangeBid || "",
        TimeZone: TimeZone || "",
        UserId: req.user.UserId,
      }
    );

    res.code(200).send({
      status: ItemUpdate.data.status,
      message: ItemUpdate.data.message,
    });
    return;
  } catch (error) {
    console.log("error-/updateitem", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const ItemGetData = (fastify) => async (req, res) => {
  try {
    let ItemData = await Axios.post(
      Config.Services.ItemService + "/GetItemData",
      {
        AuthorId: req.user.UserId,
      }
    );

    res.code(200).send({
      status: ItemData.data.status,
      message: ItemData.data.message,
      data: ItemData.data.data,
    });
    return;
  } catch (error) {
    console.log("error-/createcollection", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};



const NewItemGetData = (fastify) => async (req, res) => {
  try {
    let ItemData = await Axios.post(
      Config.Services.ItemService + "/GetNewItemData",
      {
        AuthorId: req.user.UserId,
      }
    );

    res.code(200).send({
      status: ItemData.data.status,
      message: ItemData.data.message,
      data: ItemData.data.data,
    });
    return;
  } catch (error) {
    console.log("error-/createcollection", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const ItemGetAllData = (fastify) => async (req, res) => {
  try {

    const { Category } = req.body;

    let ItemData = await Axios.post(
      Config.Services.ItemService + "/GetItemAllData",
      {
        Category: Category,
      }
    );

    const sanitizedData = ItemData.data;

    res.code(200).send({
      status: sanitizedData.status,
      message: sanitizedData.message,
      data: sanitizedData.data,
      category: sanitizedData.category,
    });
    return;
  } catch (error) {
    console.log("error-/createcollection", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};


const ItemGetPhysicalArt = (fastify) => async (req, res) => {
  try {
    const { Category, Name } = req.body;

    let ItemData = await Axios.post(
      Config.Services.ItemService + "/GetAllPhysicalArtData",
      {
        "Category": Category,
        "Name": Name
      }
    );

    res.code(200).send({
      status: ItemData.data.status,
      message: ItemData.data.message,
      data: ItemData.data.data,
      category: ItemData.data.category
    });
    return;
  } catch (error) {
    console.log("error-/createcollection", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const ItemCollectionBasedGetData = (fastify) => async (req, res) => {
  try {
    let ItemData = await Axios.post(
      Config.Services.ItemService + "/GetCollectionBasedItemData",
      {
        CollectionId: sanitizeHtml(req.body.CollectionId),
      }
    );

    res.code(200).send({
      status: ItemData.data.status,
      message: ItemData.data.message,
      data: ItemData.data.data,
    });
    return;
  } catch (error) {
    console.log("error-/createcollection", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const MintedItemCollectionBasedGetData = (fastify) => async (req, res) => {
  try {
    let ItemData = await Axios.post(
      Config.Services.ItemService + "/GetCollectionBasedMintedItemData",
      {
        CollectionId: sanitizeHtml(req.body.CollectionId),
      }
    );

    res.code(200).send({
      status: ItemData.data.status,
      message: ItemData.data.message,
      mintdata: ItemData.data.mintdata,
      unmintdata: ItemData.data.unmintdata
    });
    return;
  } catch (error) {
    console.log("error-/createcollection", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const ItemCollectionBasedArtGetData = (fastify) => async (req, res) => {
  try {
    let ItemData = await Axios.post(
      Config.Services.ItemService + "/GetCollectionBasedArtItemData",
      {
        CollectionId: sanitizeHtml(req.body.CollectionId),
      }
    );

    res.code(200).send({
      status: ItemData.data.status,
      message: ItemData.data.message,
      data: ItemData.data.data,
    });
    return;
  } catch (error) {
    console.log("error-/createcollection", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const OfferItemBasedGetData = (fastify) => async (req, res) => {
  try {
    let ItemData = await Axios.post(
      Config.Services.ItemService + "/GetItemBasedOfferData",
      {
        ItemId: sanitizeHtml(req.body.ItemId),
        Edition: req.body.Edition
      }
    );
    res.code(200).send({
      status: ItemData.data.status,
      message: ItemData.data.message,
      data: ItemData.data.data,
    });
    return;
  } catch (error) {
    console.log("error-/createcollection", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const PreOfferItemBasedGetData = (fastify) => async (req, res) => {
  try {
    let ItemData = await Axios.post(
      Config.Services.ItemService + "/GetItemBasedOfferData",
      {
        ItemId: sanitizeHtml(req.body.ItemId),
        Edition: req.body.Edition
      }
    );


    res.code(200).send({
      status: ItemData.data.status,
      message: ItemData.data.message,
      data: ItemData.data.data,
    });
    return;
  } catch (error) {
    console.log("error-/createcollection", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const BidItemBasedGetData = (fastify) => async (req, res) => {
  try {
    const { ItemId } = req.body;

    const itemData = await Axios.post(
      Config.Services.ItemService + "/GetItemBasedPreOfferData",
      {
        ItemId: sanitizeHtml(ItemId),
      }
    );

    res.code(200).send({
      status: itemData.data.status,
      message: itemData.data.message,
      data: itemData.data.data,
    });
    return;
  } catch (error) {
    console.log("error-/createcollection", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const ItemCartGetData = (fastify) => async (req, res) => {
  try {
    const ItemData = await Axios.post(
      Config.Services.ItemService + "/GetCartItemData",
      {
        AuthorId: req.user.UserId,
      }
    );

    res.code(200).send({
      status: ItemData.data.status,
      message: ItemData.data.message,
      data: ItemData.data.data,
    });
    return;
  } catch (error) {
    console.log("error-/createcollection", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const ItemGetInfo = (fastify) => async (req, res) => {
  try {

    const { CartId } = req.body;

    const ItemData = await Axios.post(
      Config.Services.ItemService + "/GetItemInfo",
      {
        CartId: sanitizeHtml(CartId),
        Ip: sanitizeHtml(RequestIp.getClientIp(req)),
        Device: sanitizeHtml(req.headers["user-agent"]),
      }
    );

    res.code(200).send({
      status: ItemData.data.status,
      message: ItemData.data.message,
      data: ItemData.data.data,
    });
    return;
  } catch (error) {
    console.log("error-/createcollection", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};


const ItemGetOwnerListInfo = (fastify) => async (req, res) => {
  try {
    const { ItemId } = req.body;

    const ItemData = await Axios.post(
      Config.Services.ItemService + "/GetItemOwnerListInfo",
      {
        ItemId: sanitizeHtml(ItemId),
      }
    );

    res.code(200).send({
      status: ItemData.data.status,
      message: ItemData.data.message,
      data: ItemData.data.data,
    });
    return;
  } catch (error) {
    console.log("error-/createcollection", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const ItemGetHistoryListInfo = (fastify) => async (req, res) => {
  try {
    let ItemData = await Axios.post(
      Config.Services.ItemService + "/GetItemHistoryListInfo",
      {
        ItemId: sanitizeHtml(req.body.ItemId),
      }
    );

    res.code(200).send({
      status: ItemData.data.status,
      message: ItemData.data.message,
      data: ItemData.data.data,
    });
    return;
  } catch (error) {
    console.log("error-/createcollection", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const ItemGetInfoWithAuth = (fastify) => async (req, res) => {
  try {
    let ItemData = await Axios.post(
      Config.Services.ItemService + "/GetItemInfoWithAuth",
      {
        ItemId: sanitizeHtml(req.body.ItemId),
        AuthorId: req.user.UserId,
      }
    );

    res.code(200).send({
      status: ItemData.data.status,
      message: ItemData.data.message,
      data: ItemData.data.data,
    });
    return;
  } catch (error) {
    console.log("error-/createcollection", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const AddOffer = (fastify) => async (req, res) => {
  try {

    let { ItemId, Price, Message, Edition } = req.body;

    let ItemInfo = (await pool.query('SELECT * FROM "Editions" WHERE "ItemId" = $1 AND "Edition" = $2 LIMIT 1;', [ItemId, Edition])).rows[0];

    let AddofferUpdate = await Axios.post(
      Config.Services.ItemService + "/AddOffer",
      {
        ItemId: sanitizeHtml(ItemId),
        Edition: sanitizeHtml(Edition),
        Price: sanitizeHtml(Price),
        Message: sanitizeHtml(Message),
        AuthorId: req.user.UserId,
      }
    );

    if (AddofferUpdate.data.status) {
      await OfferSocketCall(fastify, ItemId, Edition, ItemInfo.CurrentOwner, req.user.UserId, "Offer Placed On Your Item for " + Price);
      await NotifySocketCall(fastify, ItemInfo.CurrentOwner);
      await NotifySocketCall(fastify, req.user.UserId);
    }

    res.code(200).send({
      status: AddofferUpdate.data.status,
      message: AddofferUpdate.data.message,
    });
    return;



  } catch (error) {
    console.log("error-/addoffer", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};


const AddPreOffer = (fastify) => async (req, res) => {
  try {
    let { ItemId, Price, Message, Edition } = req.body;


    let ItemInfo = (await pool.query('SELECT * FROM "Editions" WHERE "ItemId" = $1 AND "Edition" = $2 LIMIT 1;', [ItemId, Edition])).rows[0];

    let AddofferUpdate = await Axios.post(
      Config.Services.ItemService + "/AddPreOffer",
      {
        ItemId: sanitizeHtml(ItemId),
        Edition: sanitizeHtml(Edition),
        Price: sanitizeHtml(Price),
        Message: sanitizeHtml(Message),
        AuthorId: req.user.UserId,
      }
    );

    if (AddofferUpdate.data.status) {
      await OfferSocketCall(fastify, ItemId, Edition, ItemInfo.CurrentOwner, req.user.UserId, "PreOffer Placed On Your Item for " + Price);
      await NotifySocketCall(fastify, ItemInfo.CurrentOwner);
      await NotifySocketCall(fastify, req.user.UserId);
    }

    res.code(200).send({
      status: AddofferUpdate.data.status,
      message: AddofferUpdate.data.message,
    });
    return;

  } catch (error) {
    console.log("error-/addPreOffer", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const AddBid = (fastify) => async (req, res) => {
  try {

    let { ArtworkId, Edition, Price } = req.body;


    let ItemInfo = (await pool.query('SELECT * FROM "Editions" WHERE "ItemId" = $1 AND "Edition" = $2 LIMIT 1;', [ArtworkId, Edition])).rows[0];

    let AddbidUpdate = await Axios.post(
      Config.Services.ItemService + "/AddBid",
      {
        ArtworkId: sanitizeHtml(ArtworkId),
        Edition: Edition,
        Price: Price,
        AuthorId: req.user.UserId,
      }
    );

    if (AddbidUpdate.data.status) {

      await OfferSocketCall(fastify, ArtworkId, Edition, ItemInfo.CurrentOwner, req.user.UserId, "Bid Placed Your Item for " + Price);
      await NotifySocketCall(fastify, ItemInfo.CurrentOwner);
      await NotifySocketCall(fastify, req.user.UserId);


    }

    res.code(200).send({
      status: AddbidUpdate.data.status,
      message: AddbidUpdate.data.message,
    });
    return;



  } catch (error) {
    console.log("error-/addbid", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const CheckBid = (fastify) => async (req, res) => {
  try {
    let { ArtworkId, Price, Edition } = req.body;

    const sanitizedArtworkId = sanitizeHtml(ArtworkId);
    const sanitizedPrice = sanitizeHtml(Price);

    const checkBidUpdate = await Axios.post(
      Config.Services.ItemService + "/CheckBid",
      {
        ArtworkId: sanitizedArtworkId,
        Price: sanitizedPrice,
        AuthorId: req.user.UserId,
        Edition: Edition
      }
    );

    const sanitizedStatus = checkBidUpdate.data.status;
    const sanitizedMessage = checkBidUpdate.data.message;

    res.code(200).send({
      status: sanitizedStatus,
      message: sanitizedMessage,
    });
    return;
  } catch (error) {
    console.log("error-/addbid", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const RemoveOffer = (fastify) => async (req, res) => {
  try {
    let { OfferId } = req.body;

    const sanitizedOfferId = sanitizeHtml(OfferId);

    const removeOfferUpdate = await Axios.post(
      Config.Services.ItemService + "/RemoveOffer",
      {
        OfferId: sanitizedOfferId,
        AuthorId: req.user.UserId,
      }
    );

    const sanitizedStatus = removeOfferUpdate.data.status;
    const sanitizedMessage = removeOfferUpdate.data.message;

    res.code(200).send({
      status: sanitizedStatus,
      message: sanitizedMessage,
    });
    return;
  } catch (error) {
    console.log("error-/removeoffer", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const OfferStatus = (fastify) => async (req, res) => {
  try {
    let { OfferId, Status } = req.body;


    let OfferInfo = (await pool.query('SELECT * FROM "Offers" WHERE _id = $1 LIMIT 1;', [OfferId])).rows[0];

    let ItemInfo = (await pool.query('SELECT * FROM "Editions" WHERE "ItemId" = $1 AND "Edition" = $2 LIMIT 1;', [OfferInfo.ItemId, OfferInfo.Edition])).rows[0];

    const sanitizedOfferId = sanitizeHtml(OfferId);
    const sanitizedStatus = sanitizeHtml(Status);

    const offerStatusUpdate = await Axios.post(
      Config.Services.ItemService + "/OfferStatus",
      {
        OfferId: sanitizedOfferId,
        Status: sanitizedStatus,
      }
    );

    if (offerStatusUpdate.data.status) {

      await OfferSocketCall(fastify, OfferInfo.ItemId, OfferInfo.Edition, ItemInfo.CurrentOwner, OfferInfo.Sender, "Offer Placed for " + OfferInfo.Price + "Accepted");
      await NotifySocketCall(fastify, ItemInfo.CurrentOwner);
      await NotifySocketCall(fastify, req.user.UserId);


    }

    res.code(200).send({
      status: offerStatusUpdate.data.status,
      message: offerStatusUpdate.data.message,
    });
    return;



  } catch (error) {
    console.log("error-/offerstatus", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const PreOfferStatus = (fastify) => async (req, res) => {
  try {
    let { OfferId, Status } = req.body;

    let OfferInfo = (await pool.query('SELECT * FROM "PreOffers" WHERE _id = $1 LIMIT 1;', [OfferId])).rows[0];

    let ItemInfo = (await pool.query('SELECT * FROM "Editions" WHERE "ItemId" = $1 AND "Edition" = $2 LIMIT 1;', [OfferInfo.ItemId, OfferInfo.Edition])).rows[0];

    const sanitizedOfferId = sanitizeHtml(OfferId);
    const sanitizedStatus = sanitizeHtml(Status);

    const offerStatusUpdate = await Axios.post(
      Config.Services.ItemService + "/PreOfferStatus",
      {
        OfferId: sanitizedOfferId,
        Status: sanitizedStatus,
      }
    );

    if (offerStatusUpdate.data.status) {

      await OfferSocketCall(fastify, OfferInfo.ItemId, OfferInfo.Edition, ItemInfo.CurrentOwner, OfferInfo.Sender, "PreOffer Placed for " + OfferInfo.Price + "Accepted");
      await NotifySocketCall(fastify, ItemInfo.CurrentOwner);
      await NotifySocketCall(fastify, req.user.UserId);

    }

    res.code(200).send({
      status: offerStatusUpdate.data.status,
      message: offerStatusUpdate.data.message,
    });
    return;



  } catch (error) {
    console.log("error-/Preofferstatus", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const AuctionStatus = (fastify) => async (req, res) => {
  try {
    let { ItemId, Status } = req.body;

    const sanitizedItemId = sanitizeHtml(ItemId);
    const sanitizedStatus = sanitizeHtml(Status);

    let AuctionstatusUpdate = await Axios.post(
      Config.Services.ItemService + "/AuctionStatus",
      {
        ItemId: sanitizedItemId,
        Status: sanitizedStatus,
      }
    );

    let sanitizdStatus = AuctionstatusUpdate.data.status;
    let sanitizdMessage = AuctionstatusUpdate.data.message;

    res.code(200).send({
      status: sanitizdStatus,
      message: sanitizdMessage,
    });
    return;
  } catch (error) {
    console.log("error-/auctionstatus", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const PurchaseItem = (fastify) => async (req, res) => {
  try {

    let { ItemId, Edition, Price } = req.body;

    let ItemInfo = await pool.query(
      `Select * from "Editions" where "ItemId" = '${ItemId}' AND "Edition" =  '${Edition}'`
    )
    ItemInfo = ItemInfo.rows[0]
    const sanitizedItemId = sanitizeHtml(ItemId);

    let ItemPurchase = await Axios.post(
      Config.Services.ItemService + "/PurchaseItem",
      {
        ItemId: sanitizedItemId,
        Edition: Edition,
        Price: Price ? Price : ItemInfo.Price,
        AuthorId: req.user.UserId,
      }
    );

    const sanitizedStatus = ItemPurchase.data.status;
    const sanitizedMessage = ItemPurchase.data.message;

    if (sanitizedStatus) {

      await NotifySocketCall(fastify, ItemInfo.CurrentOwner);
      await NotifySocketCall(fastify, req.user.UserId);
      await HistorySocketCall(fastify, ItemId, Edition, ItemInfo.CurrentOwner, req.user.UserId, "Your Item Get Transferred");
      await OwnerSocketCall(fastify, ItemId, Edition, ItemInfo.CurrentOwner, req.user.UserId, "Your Item Get Transferred");
      await NotifySocketCall(fastify, ItemInfo.CurrentOwner);
      await NotifySocketCall(fastify, req.user.UserId);
    }


    res.code(200).send({
      status: sanitizedStatus,
      message: sanitizedMessage,
    });
    return;


  } catch (error) {
    console.log("error-/purchaseItem", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const PurchaseMultipleItem = (fastify) => async (req, res) => {
  try {
    let { ItemId } = req.body;

    const sanitizedItemId = sanitizeHtml(ItemId);

    let ItemPurchase = await Axios.post(
      Config.Services.ItemService + "/PurchaseMultipleItem",
      {
        ItemId: sanitizedItemId,
        AuthorId: req.user.UserId,
      }
    );

    const sanitizedStatus = ItemPurchase.data.status;
    const sanitizedMessage = ItemPurchase.data.message;

    res.code(200).send({
      status: sanitizedStatus,
      message: sanitizedMessage,
    });
    return;
  } catch (error) {
    console.log("error-/purchaseItem", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};


const DHLProduct = (fastify) => async (req, res) => {
  try {

    let options = {
      method: 'GET',
      url: Config.DHL.Url + '/products',
      params: {
        accountNumber: Config.DHL.AccNo,
        originCountryCode: 'CZ',
        originCityName: 'Prague',
        destinationCountryCode: 'CZ',
        destinationCityName: 'Prague',
        weight: 5,
        length: 15,
        width: 10,
        height: 5,
        plannedShippingDate: '2023-06-26',
        isCustomsDeclarable: false,
        unitOfMeasurement: 'metric'
      },
      headers: {
        Authorization: `Basic ${base64.encode(`${Config.DHL.ApiKey}:${Config.DHL.ApiSecret}`)}`
      }
    };

    let data = [];

    Axios.request(options).then(function (response) {
      if (response) {
        data.push(response.data);
        res.code(200).send({
          status: true,
          data: data,
        });
      }

    }).catch(function (error) {
      console.error(error);
    });


  } catch (error) {
    console.log("error-/DHLProducts", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const DHLRates = (fastify) => async (req, res) => {
  try {

    let { ItemId, Edition, Country, City } = req.body;

    let ArtInfo = (await pool.query('SELECT * FROM "ArtItems" WHERE _id = $1 LIMIT 1;', [ItemId])).rows[0];

    let ItemInfo = (await pool.query('SELECT * FROM "Editions" WHERE "ItemId" = $1 AND "Edition" = $2 LIMIT 1;', [ItemId, Edition])).rows[0];

    let PA = (await pool.query('SELECT * FROM "Address" WHERE "UserId" = $1 LIMIT 1;', [ItemInfo.CurrentOwner])).rows[0];

    let DC = (await pool.query('SELECT * FROM "Country" WHERE name = $1 LIMIT 1;', [Country])).rows[0];

    let OC = (await pool.query('SELECT * FROM "Country" WHERE name = $1 LIMIT 1;', [PA.CountryName])).rows[0];

    let origincountry = OC.code;
    let origincity = PA.CityName;
    let destinationcountry = DC.code;
    let destinationcity = City;

    console.log("oc", origincountry, "oci", origincity)
    console.log("dc", destinationcountry, "dci", destinationcity)

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const formattedTomorrow = tomorrow.toISOString().slice(0, 10);

    let options = {
      method: 'GET',
      url: Config.DHL.Url + '/rates',
      params: {
        accountNumber: Config.DHL.AccNo,
        originCountryCode: origincountry,
        originCityName: origincity,
        destinationCountryCode: destinationcountry,
        destinationCityName: destinationcity,
        weight: ArtInfo.PackageWeight === 'KG' ? ArtInfo.PackageWeightValue / 1000 : ArtInfo.PackageWeightValue * 0.000454,
        height: ArtInfo.PackageDimension === "IN" ? ArtInfo.PackageDepth * 2.54 : ArtInfo.PackageDepth,
        width: ArtInfo.PackageWidth < ArtInfo.PackageHeight ? (ArtInfo.PackageDimension === "IN" ? ArtInfo.PackageWidth * 2.54 : ArtInfo.PackageWidth) : (ArtInfo.PackageDimension === "IN" ? ArtInfo.PackageHeight * 2.54 : ArtInfo.PackageHeight),
        length: ArtInfo.PackageWidth > ArtInfo.PackageHeight ? (ArtInfo.PackageDimension === "IN" ? ArtInfo.PackageWidth * 2.54 : ArtInfo.PackageWidth) : (ArtInfo.PackageDimension === "IN" ? ArtInfo.PackageHeight * 2.54 : ArtInfo.PackageHeight),
        plannedShippingDate: formattedTomorrow,
        isCustomsDeclarable: false,
        unitOfMeasurement: 'metric'
      },
      headers: {
        Authorization: `Basic ${base64.encode(`${Config.DHL.ApiKey}:${Config.DHL.ApiSecret}`)}`
      }
    };
    let data = [];

    Axios.request(options).then(function (response) {
      if (response) {
        data.push(response.data);
        res.code(200).send({
          status: true,
          data: data,
        });
      }

    }).catch(function (error) {
      console.error(error);
    });


  } catch (error) {
    console.log("error-/DHLRates", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const DHLAddress = (fastify) => async (req, res) => {
    let { Type , countryCode , postalCode , cityName  } = req.body;

    let options = {
      method: 'GET',
      url:  Config.DHL.Url + '/address-validate',
      params: {
        type:Type,
        countryCode:countryCode,
        postalCode:postalCode,
        cityName:cityName,
      },
      headers: {
        Authorization: `Basic ${base64.encode(`${Config.DHL.ApiKey}:${Config.DHL.ApiSecret}`)}`        
      }
    };
    let data = [];
    Axios.request(options).then(function (response) {
      data.push(response.data);
      res.code(200).send({
        status: true,
        data: data,
      });
    }).catch(function (error) {
      res.code(404).send({
        status: false,
        data: "Address not found",
      });
    });
}

const DHLShipment = (fastify) => async (req, res) => {
  try {

    let options = {
      method: 'POST',
      url: Config.DHL.Url + '/shipments?strictValidation=false&bypassPLTError=false&validateDataOnly=false',
      data: {
        "plannedShippingDateAndTime": "2022-10-19T19:19:40 GMT+00:00",
        "pickup": {
          "isRequested": false
        },
        "productCode": "P",        
        "accounts": [
          {
            "typeCode": "shipper",
            "number": "123456789"
          }
        ],
        "valueAddedServices": [
          {
            "serviceCode": "II",
            "value": 10,
            "currency": "USD"
          }
        ],
        "outputImageProperties": {
          "printerDPI": 300,
          "encodingFormat": "pdf",
          "imageOptions": [
            {
              "typeCode": "invoice",
              "templateName": "COMMERCIAL_INVOICE_P_10",
              "isRequested": true,
              "invoiceType": "commercial",
              "languageCode": "eng",
              "languageCountryCode": "US"
            },
            {
              "typeCode": "waybillDoc",
              "templateName": "ARCH_8x4",
              "isRequested": true,
              "hideAccountNumber": false,
              "numberOfCopies": 1
            },
            {
              "typeCode": "label",
              "templateName": "ECOM26_84_001",
              "renderDHLLogo": true,
              "fitLabelsToA4": false
            }
          ],
          "splitTransportAndWaybillDocLabels": true,
          "allDocumentsInOneImage": false,
          "splitDocumentsByPages": false,
          "splitInvoiceAndReceipt": true,
          "receiptAndLabelsInOneImage": false
        },
        "customerDetails": {
          "shipperDetails": {
            "postalAddress": {
              "postalCode": "526238",
              "cityName": "Zhaoqing",
              "countryCode": "CN",
              "addressLine1": "4FENQU, 2HAOKU, WEIPINHUI WULIU YUAN，DAWANG",
              "addressLine2": "GAOXIN QU, BEIJIANG DADAO, SIHUI,",
              "addressLine3": "ZHAOQING, GUANDONG",
              "countyName": "SIHUI",
              "countryName": "CHINA, PEOPLES REPUBLIC"
            },
            "contactInformation": {
              "email": "shipper_create_shipmentapi@dhltestmail.com",
              "phone": "18211309039",
              "mobilePhone": "18211309039",
              "companyName": "Cider BookStore",
              "fullName": "LiuWeiMing"
            },
            "registrationNumbers": [
              {
                "typeCode": "SDT",
                "number": "CN123456789",
                "issuerCountryCode": "CN"
              }
            ],
            "bankDetails": [
              {
                "name": "Bank of China",
                "settlementLocalCurrency": "RMB",
                "settlementForeignCurrency": "USD"
              }
            ],
            "typeCode": "business"
          },
          "receiverDetails": {
            "postalAddress": {
              "cityName": "Graford",
              "countryCode": "US",
              "postalCode": "76449",
              "addressLine1": "116 Marine Dr",
              "countryName": "UNITED STATES OF AMERICA"
            },
            "contactInformation": {
              "email": "recipient_create_shipmentapi@dhltestmail.com",
              "phone": "9402825665",
              "mobilePhone": "9402825666",
              "companyName": "Baylee Marshall",
              "fullName": "Baylee Marshall"
            },
            "registrationNumbers": [
              {
                "typeCode": "SSN",
                "number": "US123456789",
                "issuerCountryCode": "US"
              }
            ],
            "bankDetails": [
              {
                "name": "Bank of America",
                "settlementLocalCurrency": "USD",
                "settlementForeignCurrency": "USD"
              }
            ],
            "typeCode": "business"
          }
        },
        "content": {
          "packages": [
            {
              "typeCode": "2BP",
              "weight": 0.5,
              "dimensions": {
                "length": 1,
                "width": 1,
                "height": 1
              },
              "customerReferences": [
                {
                  "value": "3654673",
                  "typeCode": "CU"
                }
              ],
              "description": "Piece content description",
              "labelDescription": "bespoke label description"
            }
          ],
          "isCustomsDeclarable": true,
          "declaredValue": 120,
          "declaredValueCurrency": "USD",
          "exportDeclaration": {
            "lineItems": [
              {
                "number": 1,
                "description": "Harry Steward biography first edition",
                "price": 15,
                "quantity": {
                  "value": 4,
                  "unitOfMeasurement": "GM"
                },
                "commodityCodes": [
                  {
                    "typeCode": "outbound",
                    "value": "84713000"
                  },
                  {
                    "typeCode": "inbound",
                    "value": "5109101110"
                  }
                ],
                "exportReasonType": "permanent",
                "manufacturerCountry": "US",
                "exportControlClassificationNumber": "US123456789",
                "weight": {
                  "netValue": 0.1,
                  "grossValue": 0.7
                },
                "isTaxesPaid": true,
                "additionalInformation": [
                  "450pages"
                ],
                "customerReferences": [
                  {
                    "typeCode": "AFE",
                    "value": "1299210"
                  }
                ],
                "customsDocuments": [
                  {
                    "typeCode": "COO",
                    "value": "MyDHLAPI - LN#1-CUSDOC-001"
                  }
                ]
              },
              {
                "number": 2,
                "description": "Andromeda Chapter 394 - Revenge of Brook",
                "price": 15,
                "quantity": {
                  "value": 4,
                  "unitOfMeasurement": "GM"
                },
                "commodityCodes": [
                  {
                    "typeCode": "outbound",
                    "value": "6109100011"
                  },
                  {
                    "typeCode": "inbound",
                    "value": "5109101111"
                  }
                ],
                "exportReasonType": "permanent",
                "manufacturerCountry": "US",
                "exportControlClassificationNumber": "US123456789",
                "weight": {
                  "netValue": 0.1,
                  "grossValue": 0.7
                },
                "isTaxesPaid": true,
                "additionalInformation": [
                  "36pages"
                ],
                "customerReferences": [
                  {
                    "typeCode": "AFE",
                    "value": "1299211"
                  }
                ],
                "customsDocuments": [
                  {
                    "typeCode": "COO",
                    "value": "MyDHLAPI - LN#1-CUSDOC-001"
                  }
                ]
              }
            ],
            "invoice": {
              "number": "2667168671",
              "date": "2022-10-22",
              "instructions": [
                "Handle with care"
              ],
              "totalNetWeight": 0.4,
              "totalGrossWeight": 0.5,
              "customerReferences": [
                {
                  "typeCode": "UCN",
                  "value": "UCN-783974937"
                },
                {
                  "typeCode": "CN",
                  "value": "CUN-76498376498"
                },
                {
                  "typeCode": "RMA",
                  "value": "MyDHLAPI-TESTREF-001"
                }
              ],
              "termsOfPayment": "100 days",
              "indicativeCustomsValues": {
                "importCustomsDutyValue": 150.57,
                "importTaxesValue": 49.43
              }
            },
            "remarks": [
              {
                "value": "Right side up only"
              }
            ],
            "additionalCharges": [
              {
                "value": 10,
                "caption": "fee",
                "typeCode": "freight"
              },
              {
                "value": 20,
                "caption": "freight charges",
                "typeCode": "other"
              },
              {
                "value": 10,
                "caption": "ins charges",
                "typeCode": "insurance"
              },
              {
                "value": 7,
                "caption": "rev charges",
                "typeCode": "reverse_charge"
              }
            ],
            "destinationPortName": "New York Port",
            "placeOfIncoterm": "ShenZhen Port",
            "payerVATNumber": "12345ED",
            "recipientReference": "01291344",
            "exporter": {
              "id": "121233",
              "code": "S"
            },
            "packageMarks": "Fragile glass bottle",
            "declarationNotes": [
              {
                "value": "up to three declaration notes"
              }
            ],
            "exportReference": "export reference",
            "exportReason": "export reason",
            "exportReasonType": "permanent",
            "licenses": [
              {
                "typeCode": "export",
                "value": "123127233"
              }
            ],
            "shipmentType": "personal",
            "customsDocuments": [
              {
                "typeCode": "INV",
                "value": "MyDHLAPI - CUSDOC-001"
              }
            ]
          },
          "description": "Shipment",
          "USFilingTypeValue": "12345",
          "incoterm": "DAP",
          "unitOfMeasurement": "metric"
        },
        "shipmentNotification": [
          {
            "typeCode": "email",
            "receiverId": "shipmentnotification@mydhlapisample.com",
            "languageCode": "eng",
            "languageCountryCode": "UK",
            "bespokeMessage": "message to be included in the notification"
          }
        ],
        "getTransliteratedResponse": false,
        "estimatedDeliveryDate": {
          "isRequested": true,
          "typeCode": "QDDC"
        },
        "getAdditionalInformation": [
          {
            "typeCode": "pickupDetails",
            "isRequested": true
          }
        ]
      },
      headers: {
        Authorization: `Basic ${base64.encode(`${Config.DHL.ApiKey}:${Config.DHL.ApiSecret}`)}`
      }
    };

    let data = [];
    Axios.request(options).then(function (response) {
      if (response) {
        console.log("response",response.data);
        data.push(response.data);
        res.code(200).send({
          status: true,
          data: data,
        });
      }

    }).catch(function (error) {
      console.error(error);
    });


  } catch (error) {
    console.log("error-/DHLRates", error);
    res.code(500).send({
      status: false,
      message: "Error Occurred",
      error: "error",
    });
  }
};

const BidInterest = (fastify) => async (req, res) => {

  try {

    let { Email, UserId, ItemId } = req.body;

    if (Email) {
      Email = Email.toLowerCase().trim();
    }

    let Org = req.headers["origin"];

    let Url = Org + '/art/' + ItemId;

    let Data = await Axios.post(
      Config.Services.ItemService + "/BidInterest",
      {
        ItemId: ItemId,
        UserId: UserId || "",
        Url: Url,
        Email: Email || ""
      }
    );

    res.code(200).send({
      status: Data.data.status,
      data: Data.data.message,
    });
    return;

  } catch (error) {
    console.log('error-/bidinterest', error);
    res.code(500).send({
      status: false,
      message: 'Error Occurred',
      error: 'error',
    });
  }
};

const ArtistBasedBid = (fastify) => async (req, res) => {

  try {

    let { AuthorId } = req.body;

    let ItemData = await Axios.post(
      Config.Services.ItemService + "/GetArtistBasedBidItem",
      {
        "AuthorId": AuthorId
      }
    );

    const sanitizedData = ItemData.data;

    res.code(200).send({
      status: sanitizedData.status,
      message: sanitizedData.message,
      data: sanitizedData.data,
    });
    return;

  } catch (error) {
    console.log('error-/bidinterest', error);
    res.code(500).send({
      status: false,
      message: 'Error Occurred',
      error: 'error',
    });
  }
};

const ArtistBasedBidInterest = (fastify) => async (req, res) => {

  try {

    let { AuthorId } = req.body;

    let ItemData = await Axios.post(
      Config.Services.ItemService + "/GetArtistBasedBidInterest",
      {
        "AuthorId": AuthorId
      }
    );

    const sanitizedData = ItemData.data;

    res.code(200).send({
      status: sanitizedData.status,
      message: sanitizedData.message,
      data: sanitizedData.data,
    });
    return;

  } catch (error) {
    console.log('error-/bidinterest', error);
    res.code(500).send({
      status: false,
      message: 'Error Occurred',
      error: 'error',
    });
  }
};

module.exports = {
  ThumbUpdate,
  MediaUpdate,
  CategoryList,
  APCategoryList,
  APStyleList,
  MaterialList,
  MediumList,
  PurchaseItem,
  PurchaseMultipleItem,
  StylesList,
  SellNFT,
  ItemGetData,
  ItemGetAllData,
  ItemCartGetData,
  ListItem,
  ItemCollectionBasedGetData,
  ItemGetInfo,
  ItemGetOwnerListInfo,
  ItemGetInfoWithAuth,
  AddToCart,
  RemoveCart,
  AddOffer,
  RemoveOffer,
  OfferStatus,
  PreOfferStatus,
  AuctionStatus,
  AddBid,
  OfferItemBasedGetData,
  BidItemBasedGetData,
  ItemGetPhysicalArt,
  NewItemGetData,
  ItemGetHistoryListInfo,
  ArtistCategoryList,
  BulkThumbUpload,
  CheckBid,
  KeywordsList,
  ArtistMediumList,
  ArtistStyleList,
  APMaterialList,
  DHLProduct,
  APFabricList,
  APBrandList,
  APShapeList,
  APTypeList,
  APTechniqueList,
  DHLRates,
  BulkImageUpdate,
  CSVUpdate,
  BulkCsvUpload,
  APCushionSizeList,
  APRugSizeList,
  APFurnishingNameList,
  APLightingNameList,
  APFurnitureNameList,
  BidInterest,
  APNameList,
  ArtItemMediaUpload,
  CreateArtItemGeneral,
  CreateArtItemArtistDetail,
  CreateArtItemPriceDetail,
  CreateArtItemLogisticDetail,
  CreateArtItemImageDetail,
  ArtistBasedBid,
  ArtistBasedBidInterest,
  SellArtNFT,
  ArtItemThumbUpload,
  ItemCollectionBasedArtGetData,
  MintedItemCollectionBasedGetData,
  ArtistLabelList,
  AddPreOffer,
  DelistArtNFT,
  HideArtNFT,
  PreOfferItemBasedGetData,
  DHLAddress,
  DHLShipment,
  GetAllGiftNft,
  GetGiftItemInfo
};
