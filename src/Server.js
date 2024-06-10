const fastify = require('fastify')({
  logger: true,
});

// Required modules
const io = require('socket.io')(fastify.server);
const rateLimit = require('fastify-rate-limit');
const userSockets = new Map();
const Swagger = require('./SwaggerOptions');
const config = require('./Config');
const { GetItemInfo, GetItemOwnerListInfo, GetItemOfferListInfo, GetItemHistoryListInfo, Auctions, ItemViews } = require("./Helper");
const Axios = require('axios');

const { Pool } = require('pg');
const pool = new Pool(config.sqldb);

// Register Swagger with options
console.log('Starting3 the server...');
console.log('config', config);
fastify.register(require('@fastify/swagger'), Swagger.options);
fastify.register(require('@fastify/cors'), { origin: '*' });
fastify.register(require('@fastify/jwt'), { secret: config.jwt_secret });
fastify.register(require('fastify-multer').contentParser);
// fastify.register(require('@fastify/static'), {
//   root: path.join(__dirname, 'uploads'),
//   prefix: '/uploads/',
// });
fastify.register(require('fastify-cookie'));

fastify.register(require('fastify-session'), {
  secret: 'super-secret-key-super-secret-key',
  cookie: { secure: true },
  saveUninitialized: false,
  resave: false,
});

fastify.register(rateLimit, {
  max: 100, // Maximum number of requests allowed within the duration
  timeWindow: '1 minute', // Duration of the time window
  trustProxy: true, // Enable trust for the proxy server
  keyGenerator: (request) => {
    // Use the "X-Forwarded-For" header to get the client's IP address
    const ipAddress = request.headers['x-forwarded-for'] || request.ip;
    return ipAddress; // Use the client's IP address as the rate limit key
  },
});

async function verifyJwt(request, reply) {
  try {
    request.user = await request.jwtVerify();
  } catch (error) {
    reply.send(error);
  }
}

async function rateLimitAccess(request, reply) {
  try {
    if (request.rateLimit) {
      reply.code(401).send({
        status: false,
        response: 'Rate limit exceeded. Please try again later.',
      });
    }
  } catch (error) {
    reply.send(error);
  }
}

async function serververifyJwt(request, reply) {
  try {

    let Tkn = request.headers.authorization || request.cookies.token
    let Usr = await pool.query(`SELECT * FROM "Users" WHERE "Email" = '${request.user.Email}'`);
    Usr = Usr.rows[0];

    if (!Usr || !Tkn) {
      reply.code(401).send({
        status: false,
        response: "Invalid Token"
      });
    }
  } catch (error) {
    reply.send(error);
  }
}

async function walletverifyJwt(request, reply) {
  try {

    const Tkn = request.headers.authorization || request.cookies.token;
    let Usr = await pool.query(`SELECT * FROM "Users" WHERE _id = '${request.user.UserId}'`);
    Usr = Usr.rows[0];

    // If the user does not exist or the token is blacklisted, send an invalid token response
    if (!Tkn || !Usr) {
      reply.code(401).send({
        status: false,
        response: 'Invalid Token',
      });
    }
  } catch (error) {
    reply.send(error);
  }
}

async function restrictAccess(request, reply) {
  try {
    const allowedOrigins = [
      'http://localhost:3001',
      'http://localhost:3000'
    ];

    const referer = request.headers.referer;
    const useragent = request.headers['user-agent'];
    const origin = request.headers.origin;

    console.log("fgfgfg", origin);

    // Check if the request is from Postman, and if so, allow access
    if (useragent.startsWith('Postman')) {
      return;
    }

    // Check if the request is from the Swagger API documentation, and if so, allow access
    if (referer == 'https://userapi.bluaart.com/docs/static/index.html') {
      return;
    }

    // Check if the request origin is not in the allowed list of origins, and if so, deny access
    if (origin && !allowedOrigins.includes(origin)) {
      reply.code(403).send({
        status: false,
        response: 'Access Denied',
      });
    }

    if (!origin) {
      reply.code(403).send({
        status: false,
        response: 'Access Denied',
      });
    }
  } catch (error) {
    reply.send(error);
  }
}

fastify.decorate('authenticate', verifyJwt);
fastify.decorate('serverauthenticate', serververifyJwt);
fastify.decorate('walletauthenticate', walletverifyJwt);
fastify.decorate('domainauthenticate', restrictAccess);
fastify.decorate('ratelimit', rateLimitAccess);

fastify.decorate('io', io);
fastify.decorate('userSockets', userSockets);

pool.on('connect', () => {
  console.log('Connected to the database');
});

pool.on('error', (err) => {
  console.error('Error connecting to the database:', err);
  pool.end(); // Close the pool in case of an error
});

// Register routes
fastify.register(require('./routes/UserRoutes'));
fastify.register(require('./routes/CollectionRoutes'));
fastify.register(require('./routes/ItemRoutes'));


async function emitAuctions(Type) {
  try {
    let AuctionData = "";
    if (Type == "Past") {
      AuctionData = await Auctions("Past");
      io.emit('GetPastAuctions', AuctionData);
    } else if (Type == "Future") {
      AuctionData = await Auctions("Future");
      io.emit('GetFutureAuctions', AuctionData);
    } else if (Type == "Ongoing") {
      AuctionData = await Auctions("Ongoing");
      io.emit('GetOnGoingAuctions', AuctionData);
    } else {

    }

  } catch (error) {
    console.log('Error occurred while emitting GetPastAuctions:', error);
  }
}

const interval = 3000;

const start = async () => {
  console.log('Starting the server...');
  try {
    await fastify.listen(config.server.port, '0.0.0.0');
    console.log('Starting the server...');
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

// Define a GET route '/'
fastify.get('/', (request, reply) => {
  const message = '<strong>Fastify Running !!! </strong>'
  reply.type('text/html').send(message)
})

io.on('connection', (socket) => {
  
  //const userId = socket.id
  //socket.join(`user-${userId}`);

  //console.log('User connected' , userId);

  // Event: getItemAllDataFilters

  socket.on('walletconnect', async (data) => {

    let { UserId } = data;

    let uinfo = await pool.query(`SELECT * FROM "Users" WHERE _id = '${UserId}'`);
    uinfo = uinfo.rows[0];

    if (UserId && uinfo) {

      let Role = await pool.query(`SELECT * FROM "Users" INNER JOIN "UserRole" ON "Users"."RoleId" = "UserRole"._id WHERE "Users"."_id" = $1`, [UserId]);


      let Alrdy_info = await pool.query(`SELECT * FROM "SocketId" WHERE "UserId" = '${UserId}'`);
      Alrdy_info = Alrdy_info.rows[0];

      if (Alrdy_info) {
        const deleteSocketQuery = 'DELETE FROM "SocketId" WHERE "UserId" = $1';
        const deleteSocketValues = [UserId];
        await pool.query(deleteSocketQuery, deleteSocketValues);
      }

      const insertSocketQuery = 'INSERT INTO "SocketId" ("UserId", "SocketId") VALUES ($1, $2)';
      const insertSocketValues = [UserId, socket.id];
      await pool.query(insertSocketQuery, insertSocketValues);
      userSockets.set(UserId, socket.id);
      socket.emit('walletconnect', { "UserId": uinfo._id, "Role": uinfo.Role })
      socket.emit('walletconnect', {
        status: true,
        UserId: uinfo._id,
        Role: Role
      });



    } else {
      socket.emit('walletconnect', {
        status: false,
        UserId: "",
        Role: ""
      });
    }

  });

  socket.on('autoconnect', async (data) => {
    let { UserId } = data;
    let uinfo = await pool.query(`SELECT * FROM "Users" WHERE _id = '${UserId}'`);
    uinfo = uinfo.rows[0];

    if (UserId && uinfo) {

      let Role = await pool.query(`SELECT * FROM "Users" INNER JOIN "UserRole" ON "Users"."RoleId" = "UserRole"._id WHERE "Users"."_id" = $1`, [UserId]);

      let Alrdy_info = await pool.query(`SELECT * FROM "SocketId" WHERE "UserId" = '${UserId}'`);
      Alrdy_info = Alrdy_info.rows[0];

      if (Alrdy_info) {
        const deleteSocketQuery = 'DELETE FROM "SocketId" WHERE "UserId" = $1';
        const deleteSocketValues = [UserId];
        await pool.query(deleteSocketQuery, deleteSocketValues);
      }

      const insertSocketQuery = 'INSERT INTO "SocketId" ("UserId", "SocketId") VALUES ($1, $2)';
      const insertSocketValues = [UserId, socket.id];
      await pool.query(insertSocketQuery, insertSocketValues);
      userSockets.set(UserId, socket.id);
      socket.emit('autoconnect', { "UserId": uinfo._id, "Role": uinfo.Role })
      socket.emit('autoconnect', {
        status: true,
        UserId: uinfo._id,
        Role: Role
      });
    } else {
      socket.emit('autoconnect', {
        status: false,
        UserId: "",
        Role: ""
      });
    }

  });

  socket.on('getItemAllDataFilters', async (filters) => {
    try {
      let query = 'SELECT _id, "Thumb" , "Title" FROM "ArtItems" WHERE "Type" = $1';
      const queryParams = ['Artwork'];

      if (filters.Material) {
        const materials = Array.isArray(filters.Material) ? filters.Material : [filters.Material];
        query += ` AND ARRAY[${materials.join(', ')}] && "Material"`;
      }

      if (filters.Styles) {
        const styles = Array.isArray(filters.Styles) ? filters.Styles : [filters.Styles];
        console.log("styles", styles)
        query += ` AND ARRAY[${styles.join(', ')}] && "Style"`;
      }

      if (filters.Subject) {
        const subjects = Array.isArray(filters.Subject) ? filters.Subject : [filters.Subject];
        query += ` AND ARRAY[${subjects.join(', ')}] && "Subject"`;
      }

      if (filters.Size) {
        const [minSize, maxSize] = String(filters.Size).split('-');
        query += ` AND "Width" > ${minSize} AND  "Width" < ${maxSize}`;
      }
      if (filters.timePeriod) {
        const [mintimePeriod, maxtimePeriod] = String(filters.timePeriod).split('-');
        query += ` AND "CreationYear" >= ${mintimePeriod} AND  "CreationYear" <= ${maxtimePeriod}`;
      }
      if (filters.Orientation) {
        const orientationValue = filters.Orientation.map(x => "'" + x + "'").toString();
        query += ` AND "Orientation" IN (${orientationValue})`;
        // queryParams.push(orientationValue);
      }

      if (filters.Color) {
        const colorValue = filters.Color;
        query += ` AND "Color" = $${queryParams.length + 1}`;
        queryParams.push(colorValue);
      }

      if (filters.Unique) {
        const uniqueValue = filters.Unique;
        query += ` AND "Unique" = $${queryParams.length + 1}`;
        queryParams.push(uniqueValue);
      }

      if (filters.Framed) {
        const frameValue = filters.Framed;
        query += ` AND "Framed" = $${queryParams.length + 1}`;
        queryParams.push(frameValue);
      }

      if (filters.Price) {
        const [minPrice, maxPrice] = String(filters.Price).split('-');
        query += ` AND ("DigitalUSDPrice")::numeric >= $${queryParams.length + 1}::numeric AND ("DigitalUSDPrice")::numeric <= $${queryParams.length + 2}::numeric`;
        queryParams.push(minPrice, maxPrice);
      }

      if (filters.Price) {
        const [minPrice, maxPrice] = String(filters.Price).split('-');
        query += ` AND ("PhysicalUSDPrice")::numeric >= $${queryParams.length + 1}::numeric AND ("PhysicalUSDPrice")::numeric <= $${queryParams.length + 2}::numeric`;
        queryParams.push(minPrice, maxPrice);
      }

      if (filters.wayToBuy) {
        let buyType = filters.wayToBuy;
        for (let index = 0; index < buyType.length; index++) {
          const element = buyType[index];
          if (['Purchase'].includes(element)) {
            query += ` AND _id IN ( Select "ItemId" from "Editions" where "MarketPlaceStatus" = true Limit 1 ) `
          }
          else if (['offer'].includes(element)) {
            query += ` AND _id IN (Select "ItemId" from "Editions" where "MarketPlaceStatus" = true AND "HasOffer" = true Limit 1 ) `
          } else if (['bid'].includes(element)) {
            query += ` AND _id IN (Select "ItemId" from "Editions" where "MarketPlaceStatus" = true AND "HasBid" = true Limit 1 )`
          }
        }
      }
      const { rows: items } = await pool.query(query, queryParams);
      const data = items.map(item => ({
        _id: item._id,
        Thumb: item.Thumb,
        Title: item.Title // Assuming Thumb is stored directly as a column
      }));
      socket.emit('itemData', {
        status: true,
        message: 'Item details retrieved successfully',
        data: data
      });
    } catch (error) {
      console.error('Item retrieval error: ', error);
      socket.emit('itemData', {
        status: false,
        message: 'Error retrieving item details',
        data: null
      });
    }
  });


  socket.on('getArtProductFilters', async (filters) => {
    try {

      let query = `SELECT "ArtItems"._id, "Thumb" FROM "ArtItems"
      LEFT JOIN "ArtProductName" ON "ArtProductName"._id =  "ArtItems"."ProductName"
      WHERE "ArtItems"."Type" = 'ArtProduct' AND "ProductCategory" = ${filters.Category}`;

      if (filters.Name) {
        query += ` AND  "ArtProductName"."Title"  = '${filters.Name}'`
      }
      if (filters.Brand) {
        query += ` AND  "ProductBrand" IN(${filters.Brand.join(',')})`
      }
      if (filters.Style) {
        query += ` AND  "ProductStyle" IN(${filters.Style.join(',')})`
      }
      if (filters.Size) {
        query += ` AND  "ProductSize" IN(${filters.Size.join(',')})`
      }
      if (filters.Shape) {
        query += ` AND  "ProductShape" IN(${filters.Shape.join(',')})`
      }
      if (filters.Fabric) {
        query += ` AND  "ProductFabric" IN(${filters.Fabric.join(',')})`
      }
      if (filters.Technique) {
        query += ` AND  "ProductTechnique" IN(${filters.Technique.join(',')})`
      }
      if (filters.Material) {
        query += ` AND  "ProductMaterial" IN(${filters.Material.join(',')})`
      }

      // 
      // AND "ProductName" = $2
      // AND ($3::int[] IS NULL OR "ProductBrand" = ANY ($3::int[]))
      // AND ($4::int[] IS NULL OR "ProductFabric" = ANY ($4::int[]))
      // AND ($5::int[] IS NULL OR "ProductMaterial" = ANY ($5::int[]))
      // AND ($6::int[] IS NULL OR "ProductStyle" = ANY ($6::int[]))
      // AND ($7::int[] IS NULL OR "ProductSize" = ANY ($7::int[]))
      // AND ($8::int[] IS NULL OR "ProductShape" = ANY ($8::int[]))
      // AND ($9::int[] IS NULL OR "ProductType" = ANY ($9::int[]))
      // AND ($10::int[] IS NULL OR "ProductTechnique" = ANY ($10::int[]))
      // AND ("PhysicalUSDPrice")::numeric >= $11::numeric
      // AND ("PhysicalUSDPrice")::numeric <= $12::numeric
      // AND ("DigitalUSDPrice")::numeric >= $11::numeric
      // AND ("DigitalUSDPrice")::numeric <= $12::numeric;
      // `;

      // const values = [
      //   filters.Category,
      //   filters.Name,
      //   filters.Brand,
      //   filters.Fabric,
      //   filters.Material,
      //   filters.Style,
      //   filters.Size,
      //   filters.Shape,
      //   filters.Type,
      //   filters.Technique,
      //   filters.Price ? filters.Price.split('-')[0] : null,
      //   filters.Price ? filters.Price.split('-')[1] : null
      // ];

      console.log("Query", query);

      const result = await pool.query(query);

      const data = result.rows;

      socket.emit('artProductData', {
        status: true,
        message: 'Item details retrieved successfully',
        data: data
      });
    } catch (error) {
      console.log('Item retrieval error: ', error);
      socket.emit('artProductData', {
        status: false,
        message: 'Error retrieving item details',
        data: null
      });
    }
  });


  socket.on('ArtItemMint', async (data) => {
    console.log("ArtItemMintcall")
    const { ItemId, TokenId } = data;
    try {

      const itemQuery = 'SELECT * FROM "ArtItems" WHERE "_id" = $1';
      const itemValues = [ItemId];
      const itemResult = await pool.query(itemQuery, itemValues);

      if (itemResult.rows.length === 0) {
        const Aresult = {
          status: false,
          message: "Item Not Found"
        };
        socket.emit('ArtItemMint', Aresult);
        return;
      }

      const editionQuery = 'SELECT "Edition", "PhysicalArt" FROM "Editions" WHERE "ItemId" = $1';
      const editionValues = [ItemId];
      const editionResult = await pool.query(editionQuery, editionValues);
      const Editions = editionResult.rows.map(row => ({
        "Edition": row.Edition,
        "PhysicalArt": row.PhysicalArt
      }));


      const collectionQuery = 'SELECT * FROM "Collections" WHERE "_id" = $1';
      const collectionValues = [itemResult.rows[0].CollectionId];
      const collectionResult = await pool.query(collectionQuery, collectionValues);
      const collectionInfo = collectionResult.rows[0];

      const metaInfo = {
        "Name": itemResult.rows[0].Title,
        "TokenId": TokenId,
        "Description": itemResult.rows[0].Description,
        "Media": itemResult.rows[0].IPFSMedia,
        "CollectionName": collectionInfo.Name,
        "IPFSCid": collectionInfo.IPFSCid,
        "IPFSHash": collectionInfo.IPFSHash
      };

      const MetaJsoninfo = await Axios.post(config.Services.FileService + "MetaJson", metaInfo);
      const respon = MetaJsoninfo.data.MetaJson;

      const query = 'UPDATE "ArtItems" SET "S3Meta" = $1 WHERE _id = $2';
      const values = [respon, ItemId];

      await pool.query(query, values);

      const Ipfsinfo = await Axios.post(config.Services.FileService + "IpfsCID", { 'Data': collectionInfo.Name });
      const resp = Ipfsinfo.data.IpfsCID;

      const Dresult = {
        status: "success",
        cid: resp,
        ipfsHash: `https://ipfs.io/ipfs/${resp}/`,
        contractAddress: collectionInfo.ContractAddress,
        edition: itemResult.rows[0].Edition,
        editiondetails: Editions
      };

      socket.emit('ArtItemMint', Dresult);

    } catch (error) {
      console.error("minting error", error);
      const Dresult = {
        status: "error",
        message: "An error occurred while minting"
      };
      socket.emit('ArtItemMint', Dresult);

    }
  });

  socket.on('ArtBulkItemMint', async (data) => {

    const { itemIds, tokenIds, collectionid } = data;

    let collectionInfo = await pool.query(`Select * from  "Collections" where _id = '${collectionid}'`);
    collectionInfo = collectionInfo.rows[0]
    // const collectionInfo = await CollectionModel.findOne({ "_id": collectionid }).lean();

    try {
      let bulkEditions = {}; // Store editions for each item ID

      for (let i = 0; i < itemIds.length; i++) {

        const ItemId = itemIds[i];
        const TokenId = tokenIds[i];
        let itemInfo = await pool.query(`Select * from "ArtItems" where _id = '${ItemId}'`);
        itemInfo = itemInfo.rows[0];
        if (!itemInfo) {
          const Aresult = {
            status: false,
            message: "Item Not Found"
          };
          socket.emit('ArtBulkItemMint', Aresult);
          continue;
        }

        if (!itemInfo.ApproveStatus) {
          const Aresult = {
            status: false,
            message: "Item Not Approved"
          };
          socket.emit('ArtBulkItemMint', Aresult);
          continue;
        }
        

        let Editions = [];

        for (let i = 0; i < itemInfo.Edition; i++) {
          if (i < itemInfo.PhysicalEdition) {
            let Edition = i + 1;
            // let Info = await EditionModel.findOne({ "ItemId": ItemId, "Edition": Edition });
            
            Editions.push({ "Edition": i + 1, "PhysicalArt": true });
            
          } else {
            
            // let Edition = i + 1;
           
            // let Info = await pool.query(`Select * from "Editions" where "ItemId" = '${ItemId}' AND "Edition" = '${Edition}'`)
            // let Info = await EditionModel.findOne({ "ItemId": ItemId, "Edition": Edition });
            // if (!Info) {
            //   console.log("itemInfo.PhysicalEdition",itemInfo.PhysicalEdition);
            //   await pool.query(`INSERT INTO "Editions" ("ItemId","Edition","PhysicalArt","Price","CurrentOwner","AuthorId") Values ($1,$2,$3,$4,$5,$6)`, [ItemId, Edition, false, itemInfo.DigitalPrice, itemInfo.CurrentOwner, itemInfo.AuthorId])
              // await EditionModel.create({ "ItemId": ItemId, "Edition": Edition, "PhysicalArt": false, "Price": itemInfo.DigitalPrice, "CurrentOwner": itemInfo.CurrentOwner, "AuthorId": itemInfo.AuthorId });
              Editions.push({ "Edition": i + 1, "PhysicalArt": false });
            // }
          }
        }
        console.log("Editions",Editions);
        bulkEditions[ItemId] = { // Store editions for each item ID
          edition: itemInfo.Edition,
          editiondetails: Editions
        };

        const metaInfo = {
          "Name": itemInfo.Title,
          "TokenId": TokenId,
          "Description": itemInfo.Description,
          "Media": itemInfo.Media.IPFS,
          "CollectionName": collectionInfo.Name,
          "IPFSCid": collectionInfo.IPFSCid,
          "IPFSHash": collectionInfo.IPFSHash
        };

        let MetaJsoninfo = await Axios.post(config.Services.FileService + "MetaJson", metaInfo);
        const respon = MetaJsoninfo.data.MetaJson;

        const query = 'UPDATE "ArtItems" SET "S3Meta" = $1 WHERE _id = $2';
        const values = [respon, ItemId];
        await pool.query(query, values);

      }

      let Ipfsinfo = await Axios.post(config.Services.FileService + "IpfsCID", { 'Data': collectionInfo.Name });
      const resp = Ipfsinfo.data.IpfsCID;

      const Dresult = {
        status: "success",
        cid: resp,
        ipfsHash: `https://ipfs.io/ipfs/${resp}/`,
        contractAddress: collectionInfo.ContractAddress,
        editions: bulkEditions // Include editions for each item ID
      };

      socket.emit('ArtBulkItemMint', Dresult);
    } catch (error) {
      console.error(error);
      const Dresult = {
        status: "error",
        message: "An error occurred while minting"
      };
      socket.emit('ArtBulkItemMint', Dresult);
    }
  });

  socket.on('ItemNameCheck', async (data) => {

    const { ItemName } = data;

    const Info = (await pool.query('SELECT * FROM "ArtItems" WHERE "Title" = $1 LIMIT 1;', [ItemName])).rows[0];

    if (Info) {
      const Dresult = {
        status: "false",
        message: "Already Item With This Title Exist"
      };
      socket.emit('ItemNameCheck', Dresult);
    } else {
      const result = {
        status: "true",
        message: "No Item Available in this Name"
      };
      socket.emit('ItemNameCheck', result);
    }


  });

  socket.on('ArtItemInfo', async (data) => {

    let Info = await GetItemInfo(data.ItemId);
    
    console.log("Edition info", Info);
    let EditionFetch = await pool.query(`Select * , "AuthorId"::text,"CurrentOwner"::text from "Editions" where "ItemId" = '${data.ItemId}' ORDER BY "Edition" ASC`);

    let EditionInfo = {
      editions: EditionFetch.rows
    }
    Info[0].EditionInfo = EditionInfo;

    const ip = socket.handshake.headers['x-forwarded-for'];

    const device = socket.handshake.headers['user-agent'];

    console.log("ipddclientIp", ip, "ddd", device, "dfd", Info[0].ItemInfo.AuthorId)

    await ItemViews(data.ItemId,ip,device,Info[0].ItemInfo.AuthorId,Info[0].ItemInfo.AuthorId);

    const result = {
      ItemId: data.ItemId,
      data: Info
    };

    socket.emit('ArtItemInfo', result);


  });

  socket.on('ArtItemOwnerListInfo', async (data) => {

    let Info = await GetItemOwnerListInfo(data.ItemId, data.Edition);

    const result = {
      ItemId: data.ItemId,
      data: Info
    };

    socket.emit('ArtItemOwnerListInfo', result);


  });

  socket.on('ArtItemOfferListInfo', async (data) => {

    let Info = await GetItemOfferListInfo(data.ItemId, data.Edition);

    const result = {
      ItemId: data.ItemId,
      data: Info
    };

    socket.emit('ArtItemOfferListInfo', result);


  });

  socket.on('ArtItemHistoryListInfo', async (data) => {

    let Info = await GetItemHistoryListInfo(data.ItemId, data.Edition);

    const result = {
      ItemId: data.ItemId,
      data: Info
    };

    socket.emit('ArtItemHistoryListInfo', result);


  });

  socket.on('ArtItemBulkPublish', async (data) => {
    try {
      const { itemIds, tokenIds, transactionHash, collectionId } = data;
      let successCount = 0;

      let CollectionInfo = await pool.query(`Select * from "Collections" where _id = '${collectionId}'`)
      // let CollectionInfo = await CollectionModel.findOne({ "_id": collectionId }).lean();
      CollectionInfo = CollectionInfo.rows[0];
      if (!CollectionInfo) {
        const Aresult = {
          status: false,
          message: "Collection Not Found"
        };
        socket.emit('ArtItemBulkPublish', Aresult);
        return;
      }

      if (itemIds.length !== tokenIds.length) {
        const Bresult = {
          status: false,
          message: "Invalid data: Number of item IDs, and token IDs should be the same."
        };
        socket.emit('ArtItemBulkPublish', Bresult);
        return;
      }

      for (let i = 0; i < itemIds.length; i++) {
        const ItemId = itemIds[i];
        const TokenId = tokenIds[i];
        const TransactionHash = transactionHash;
        let ItemInfo = await pool.query(`Select * from "ArtItems" where _id = '${ItemId}'`)
        ItemInfo = ItemInfo.rows[0];
        if (!ItemInfo) {
          const Aresult = {
            status: false,
            message: `Item Not Found for Item ID: ${ItemId}`
          };
          socket.emit('ArtItemBulkPublish', Aresult);
          continue;
        }

        let AuthorId = ItemInfo.AuthorId;
        await pool.query(`Update "ArtItems" SET "TokenId" = '${TokenId}', "MintedDate" = $1, "Status" = 'Active',"PublishStatus" = true where _id = '${ItemId}'`, [new Date()])

        // Create a history record for the minted item
        console.log("Query", `Update "ArtItems" SET "TokenId" = '${TokenId}', "MintedDate" = $1, "Status" = 'Active',"PublishStatus" = true where _id = '${ItemId}'`, new Date);

        const History_Upd = await pool.query(`INSERT INTO "Histories" ("ItemId", "CollectionId","FromId","ToId","TransactionHash","Price","HistoryType") Values ($1,$2,$3,$4,$5,$6,$7)`, [ItemId, ItemInfo.CollectionId, AuthorId, AuthorId, TransactionHash, 0, "Minted"])

        if (History_Upd) {
          // Create a price record for the minted item
          await pool.query(`INSERT INTO "Prices" ("ItemId","UserId","Price") Values ($1,$2,$3)`, [ItemId, AuthorId, 0]);
          await pool.query(`INSERT INTO "Notifications" ("Type","ItemId","Price","UserId") Values ($1,$2,$3,$4)`, ["Item Published", ItemId, 0, AuthorId])
          let Count = await pool.query(`Select COUNT(*) from "Notifications" where "UserId" = '${AuthorId}' AND "Status" = 'Unread'`)
          Count = Count.rows[0].count;
          socket.emit('GetNotifyCount', { "Count": Count });
        }

        const query = 'UPDATE "ArtItems" SET "IPFSStatus" = $1 WHERE _id = $2';
        const values = [true, ItemId];

        await pool.query(query, values);


      }

      let Ipfsinfo = await Axios.post(config.Services.FileService + "IpfsUpload", { 'Data': CollectionInfo.Name });
      const MetaDataIpfs = Ipfsinfo.data.IpfsCID;

      if (MetaDataIpfs) {
        if (CollectionInfo.IPFSCid && CollectionInfo.IPFSCid !== MetaDataIpfs.cid) {
          let IpfsRemove = await Axios.post(config.Services.FileService + "IpfsUnpin", { 'Data': CollectionInfo.IPFSCid });
        }
        await pool.query(`Update "Collections" SET "IPFSCid" = '${MetaDataIpfs.cid}' , "IPFSHash" = 'https://ipfs.io/ipfs/${MetaDataIpfs.cid}'`)

         successCount++;
      } else {
        let Cresult = {
          status: false,
          message: `Upload to IPFS Failed for Item ID: ${ItemId}`
        };
        socket.emit('ArtItemBulkPublish', Cresult);
      }

      if (successCount === itemIds.length) {
        let Dresult = {
          status: true,
          message: "Items Published successfully"
        };
        socket.emit('ArtItemBulkPublish', Dresult);
      }
    } catch (error) {
      console.log('error-/update item', error);
      let Eresult = {
        status: false,
        message: 'Error Occurred',
      };
      // Emit 'ArtItemPublish' event with error status and message
      socket.emit('ArtItemBulkPublish', Eresult);
    }
  });


  // Handle 'ArtistFilterbyStyle' event
  socket.on('ArtistFilterbyStyle', async (data) => {
    const { Style } = data;

    try {
      // Find artists based on matching styles in the provided array
      const queryString = `
        SELECT id, "ProfilePicture"
        FROM "Users"
        WHERE "AccountStatus" = 1
        AND ARRAY[${Style.join(', ')}] && "Styles"
        ORDER BY id DESC
      `;

      const { rows: Info } = await pool.query(queryString);

      // Emit 'artistData' event with the retrieved artist details
      socket.emit('artistData', {
        status: true,
        message: 'Artist details retrieved successfully',
        data: Info
      });
    } catch (error) {
      console.error('Artist retrieval error: ', error);
      // Emit 'artistData' event with error status and message
      socket.emit('artistData', {
        status: false,
        message: 'Error retrieving artist details',
        data: null
      });
    }
  });


  // Handle 'SearchFilter' event
  socket.on('SearchFilter', async (data) => {

    const { Search } = data;

    try {
      // Create regex pattern for search query
      const searchPattern = `%${Search}%`;

      const cquery = `SELECT "Name", _id, "ItemCount", "Thumb"
      FROM "Collections" WHERE "Name" ILIKE $1 ORDER BY _id DESC;`;
      const cresult = await pool.query(cquery, [searchPattern]);
      const CollectionInfo = cresult.rows;

      // Retrieve user information matching the search query

      const uquery = `SELECT "UserName", _id, "ProfilePicture"
      FROM "Users" WHERE "UserName" ILIKE $1 ORDER BY _id DESC;   `;
      const uresult = await pool.query(uquery, [searchPattern]);
      const UserInfo = uresult.rows;

      // Retrieve artwork information matching the search query

      const Iquery = `SELECT "Title", _id, "Thumb"
      FROM "ArtItems" WHERE "Title" ILIKE $1 ORDER BY _id DESC;`;
      const Iresult = await pool.query(Iquery, [searchPattern]);
      const ArtworkInfo = Iresult.rows;

      // Emit 'searchData' event with the retrieved search data
      socket.emit('searchData', {
        status: true,
        message: 'Search Data Retrieved',
        CollectionData: CollectionInfo,
        ArtworkData: ArtworkInfo,
        UserData: UserInfo
      });
    } catch (error) {
      console.log('Search get error ', error);
      // Emit 'searchData' event with error status and message
      socket.emit('searchData', {
        status: false,
        message: error,
        data: null
      });
    }
  });

  // Handle 'ItemPublish' event
  socket.on('ArtItemPublish', async (data) => {
    try {

      let { ItemId, TokenId, TransactionHash } = data;

      const itemQuery = 'SELECT * FROM "ArtItems" WHERE "_id" = $1';
      const itemValues = [ItemId];
      const itemResult = await pool.query(itemQuery, itemValues);
      const ItemInfo = itemResult.rows[0];
      const AuthorId = ItemInfo.AuthorId;


      if (!ItemInfo) {
        const Aresult = {
          status: false,
          message: "Item Not Found"
        };
        // Emit 'ItemPublish' event with error status and message
        socket.emit('ArtItemPublish', Aresult);
      }

      // Update the artwork with TokenId, MintedDate, Status, PublishStatus, and MarketPlaceStatus

      const updateItemQuery = `
      UPDATE "ArtItems"
      SET "TokenId" = $1, "MintedDate" = $2, "Status" = $3, "PublishStatus" = $4
      WHERE "_id" = $5
    `;
      const updateItemValues = [
        TokenId,
        new Date(),
        'Active',
        true,
        ItemId
      ];
      await pool.query(updateItemQuery, updateItemValues);

      const insertHistoryQuery = `
      INSERT INTO "Histories" ("ItemId", "CollectionId", "FromId", "ToId", "TransactionHash", "Price", "HistoryType")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
      const insertHistoryValues = [
        ItemId,
        ItemInfo.CollectionId,
        AuthorId,
        AuthorId,
        TransactionHash,
        0,
        'Minted'
      ];
      await pool.query(insertHistoryQuery, insertHistoryValues);

      const insertPriceQuery = `
      INSERT INTO "Prices" ("ItemId", "UserId", "Price")
      VALUES ($1, $2, $3)
    `;
      const insertPriceValues = [
        ItemId,
        AuthorId,
        0
      ];
      await pool.query(insertPriceQuery, insertPriceValues);

      const insertNotificationQuery = `
      INSERT INTO "Notifications" ("Type", "ItemId", "Price", "UserId")
      VALUES ($1, $2, $3, $4)
    `;
      const insertNotificationValues = [
        'Item Published',
        ItemId,
        0,
        AuthorId
      ];
      await pool.query(insertNotificationQuery, insertNotificationValues);

      const countQuery = 'SELECT COUNT(*) FROM "Notifications" WHERE "UserId" = $1 AND "Status" = $2';
      const countValues = [AuthorId, 'Unread'];
      const countResult = await pool.query(countQuery, countValues);
      const Count = countResult.rows[0].count;

      socket.emit('GetNotifyCount', { "Count": Count });

      const collectionQuery = 'SELECT * FROM "Collections" WHERE "_id" = $1';
      const collectionValues = [ItemInfo.CollectionId];
      const collectionResult = await pool.query(collectionQuery, collectionValues);
      const CollectionInfo = collectionResult.rows[0];

      const ipfsUploadInfo = await Axios.post(config.Services.FileService + "IpfsUpload", { 'Data': CollectionInfo.Name });
      const MetaDataIpfs = ipfsUploadInfo.data.IpfsCID;

      if (MetaDataIpfs) {
        if (CollectionInfo.IPFSCid && CollectionInfo.IPFSCid !== MetaDataIpfs.cid) {
           await Axios.post(config.Services.FileService + "IpfsUnpin", { 'Data': CollectionInfo.IPFSCid });
        }
        const updateCollectionQuery = `
          UPDATE "Collections"
          SET "IPFSCid" = $1, "IPFSHash" = $2
          WHERE "_id" = $3
        `;
        const updateCollectionValues = [
          MetaDataIpfs.cid,
          `https://ipfs.io/ipfs/${MetaDataIpfs.cid}`,
          CollectionInfo._id
        ];
        await pool.query(updateCollectionQuery, updateCollectionValues);
        const query = 'UPDATE "ArtItems" SET "IPFSStatus" = $1 WHERE _id = $2';
        const values = [true, ItemId];

        await pool.query(query, values);

        const Cresult = {
          status: true,
          message: "Item Published successfully"
        };
        socket.emit('ArtItemPublish', Cresult);

      } else {
        let Bresult = {
          status: false,
          message: "Upload to IPFS Failed"
        }
        // Emit 'ItemPublish' event with error status and message
        socket.emit('ArtItemPublish', Bresult);
        return;
      }

    } catch (error) {
      console.log('error-/update item', error);
      let Dresult = {
        status: false,
        message: 'Error Occurred',
      }
      // Emit 'ItemPublish' event with error status and message
      socket.emit('ArtItemPublish', Dresult);
    }

  });


  socket.on('GetNotifyCount', async (data) => {
    try {

      let { UserId } = data;

      const CountQuery = `SELECT COUNT(*) AS "Count" FROM "Notifications" WHERE "UserId" = $1 AND "Status" = 'Unread'`;

      try {
        const result = await pool.query(CountQuery, [UserId]);
        const count = result.rows[0].Count;

        // Emit the count to the socket
        socket.emit('GetNotifyCount', { "Count": count });
      } catch (error) {
        console.error('Error getting notification count:', error);
        // Handle the error as needed
      }


    } catch (error) {
      console.log('error-/update item', error);
      let Dresult = {
        status: false,
        message: 'Error Occurred',
      }
      socket.emit('GetNotifyCount', { "Count": 0 });
    }

  });

  socket.on('pageOnStatus', async (data) => {
    try {
      let result = await pool.query(`select * from "SocketId" where "SocketId" = '${socket.id}' `);
      if (result.rows.length > 0) {
        await pool.query(`Update "SocketId" SET "Online" = true where "SocketId" = '${socket.id}'`)
      } else {
        await pool.query(`INSERT INTO "SocketId" ("UserId", "SocketId" , "Online") VALUES (null, '${socket.id}', true)`)
      }
      socket.emit('pageOnStatus', 'success');
    } catch (error) {
      socket.emit('pageOnStatus', 'faild');
    }
  })

  socket.on('pageOffStatus', async (data) => {
    try {
      let result = await pool.query(`select * from "SocketId" where "SocketId" = '${socket.id}' `);
      if (result.rows.length > 0) {
        await pool.query(`Update "SocketId" SET "Online" = false where "SocketId" = '${socket.id}' `)
      }
      socket.emit('pageOffStatus', 'success');
    } catch (error) {
      socket.emit('pageOffStatus', 'faild');
    }
  })
  socket.on('GetPastAuctions', async (data) => {
    let AuctionData = await Auctions("Past");
    socket.emit('GetPastAuctions', AuctionData);
  })

  socket.on('GetFutureAuctions', async (data) => {
    let AuctionData = await Auctions("Future");
    socket.emit('GetFutureAuctions', AuctionData);
  })

  socket.on('GetOnGoingAuctions', async (data) => {
    let AuctionData = await Auctions("Ongoing");
    socket.emit('GetOnGoingAuctions', AuctionData);
  })

});

// Start the server
start()

// Export the Fastify instance
module.exports = fastify;

