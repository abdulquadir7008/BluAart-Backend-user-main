require('dotenv').config({ path: require('find-config')('.env') })
module.exports = {
    server: {
        port: process.env.PORT
    },
   sqldb:{
        user: process.env.DUSERNAME,
        host: process.env.HOST,
        database: process.env.DBNAME,
        password: process.env.PASSWORD,
        port: process.env._PORT,
        sslmode: process.env.SSLMODE,
        ssl:{
                rejectUnauthorized:false,
        }
    },
    destsqldb:{
        user: process.env.DUSERNAME,
        host: process.env.DHOST,
        database: process.env.DDBNAME,
        password: process.env.DPASSWORD,
        port: process.env._DPORT,
        sslmode: process.env.SSLMODE,
        ssl:{
                rejectUnauthorized:false,
        }
    },
    jwt_secret: process.env.SECRET_KEY,
    Services: {
        EmailService: process.env.EMAIL_SERVICE,
        CollectionService: process.env.COLLECTION_SERVICE,
        ItemService: process.env.ITEM_SERVICE,
        ApiService: process.env.API_SERVICE,
        FileService: process.env.FILE_SERVICE,
        FileServiceApi: process.env.FILE_SERVICEAPI,
        BulkFileServiceApi: process.env.BulkFILE_SERVICEAPI
    },
    Pinata:{
        Key: process.env.PinataKey,
        Secret: process.env.PinataSecret,
        Jwt: process.env.PinataJwt
    },
    DHL: {
        Url: process.env.DHLURL,
        AccNo: process.env.DHLACCNO,
        ApiKey: process.env.DHLApiKey,
        ApiSecret: process.env.DHLSecret
    },
    S3:{
        AccessKey: process.env.S3AccessKey,
        SecretKey: process.env.S3SecretKey,
        Bucket: process.env.S3Bucket,
        Region: process.env.S3Region
    },
    DS3:{
        AccessKey: process.env.DS3AccessKey,
        SecretKey: process.env.DS3SecretKey,
        Bucket: process.env.DS3Bucket,
        Region: process.env.DS3Region
    },

}