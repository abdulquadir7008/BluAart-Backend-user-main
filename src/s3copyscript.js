const { S3Client, ListObjectsV2Command, CopyObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const Config = require('./Config');

const sourceBucket = Config.S3.Bucket;
const destinationBucket = Config.DS3.Bucket;
const sourcePrefix = 'uploads/'; // Include the trailing slash

const foldersToMove = [
    'ArtProductCategory',
    'ArtCategory',
    'Events',
    'Features',
    'About',
    'Art',
    'ArtProduct',
    'CorporateCollection',
    'PrivateCollector',
    'Artist',
    'ArtCollection',
    'ArtPageBanner',
    'AuctionBannerImage',
    'MetamaskMatic',
    'MetamaskETH',
    'BulkArtworkCSVSample',
    'BulkArtproductCSVSample',
    'DigitalArt',
    'Glassart',
    'Metalart',
    'Paintings',
    'Potteryandceramics',
    'PrintMedia',
    'ResinArt',
    'Sculpture',
    'Textileart',
    'Woodart',
    'BarCabinets',
    'BookShelfs',
    'CenterTable',
    'Partition',
    'SideBoards',
    'Frames',
    'Cushions',
    'Rugs',
    'WallScones',
    'TableLamps',
    'FloorLamps',
    'PendantLights',
    'CoveLights',
    'RopeLights',
    'AccentFurniture',
    'AccentFurnishing',
    'AccentWalls',
    'AccentLighting',
    'LogoFavicon',
    'LandingSection1',
    'ArtistCategory',
    'Teams',
    'LandingSection2',
    'Flags'
];

const s3Client = new S3Client({
    signatureVersion: 'v4',
    region: Config.S3.Region,
    credentials: {
        accessKeyId: Config.S3.AccessKey,
        secretAccessKey: Config.S3.SecretKey
    }
});

async function copyFolders() {
    try {
        for (const folderName of foldersToMove) {
            const sourceKey = `${sourcePrefix}${folderName}/`;

            const listParams = {
                Bucket: sourceBucket,
                Prefix: sourceKey,
            };

            const data = await s3Client.send(new ListObjectsV2Command(listParams));

            for (const object of data.Contents) {
                // Create the destination key by replacing the source prefix
              
                const destinationKey = `uploads/${folderName}/${object.Key.replace(sourceKey, '')}`;

                // Check if the source object exists before attempting to copy it
                if (object.Key) {
                    const copyParams = {
                        Bucket: destinationBucket,
                        CopySource: `/${sourceBucket}/${object.Key}`,
                        Key: destinationKey,
                        ACL: 'public-read'
                    };

                    await s3Client.send(new CopyObjectCommand(copyParams));

                    // Optional: Delete the original object
                    // const deleteParams = {
                    //     Bucket: sourceBucket,
                    //     Key: object.Key,
                    // };
                    // await s3Client.send(new DeleteObjectCommand(deleteParams));
                    // console.log(`Object copied and original deleted: ${object.Key}`);
                    console.log(`Object copied : ${object.Key}`);
                } else {
                    console.log(`Object not found: ${object.Key}`);
                }
            }

            console.log(`All objects in the folder ${folderName} copied successfully.`);
        }
    } catch (error) {
        console.error('Error copying folders:', error);
    }
}


copyFolders();

// const originalUrl = "https://bluaarts3bucket1.s3.ap-southeast-1.amazonaws.com/uploads/Teams/Image-1694151420763-compressed.png";
// const newBucketName = "newbucketname"; // Replace with your new bucket name

// // Split the URL by slashes to access the parts
// const urlParts = originalUrl.split('/');

// // Find and replace the bucket name in the URL
// const updatedUrl = originalUrl.replace(urlParts[2], newBucketName);

// console.log(updatedUrl);

