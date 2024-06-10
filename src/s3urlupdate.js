const config = require('./Config');

const { Pool } = require('pg');
const pool = new Pool(config.destsqldb);
const newBucketName = config.DS3.Bucket;

async function updateImageUrls(tableName) {
    try {
        const client = await pool.connect();
        const query = `SELECT * FROM "${tableName}"`;
        const result = await client.query(query);

        for (const row of result.rows) {

            const originalUrl = row.Image;
            const urlParts = originalUrl.split('/');
            const updatedUrl = originalUrl.replace(urlParts[2], newBucketName+".s3.amazonaws.com");

            const updateQuery = `UPDATE "${tableName}" SET "Image" = $1 WHERE _id = $2`;
            await client.query(updateQuery, [updatedUrl, row._id]);

            const originalUrl1 = row.ImageOrg;
            const urlParts1 = originalUrl1.split('/');
            const updatedUrl1 = originalUrl1.replace(urlParts1[2], newBucketName+".s3.amazonaws.com");

            const updateQuery1 = `UPDATE "${tableName}" SET "ImageOrg" = $1 WHERE _id = $2`;
            await client.query(updateQuery1, [updatedUrl1, row._id]);


          }

        client.release();
        console.log(`Image URLs updated for table: ${tableName}`);
    } catch (error) {
        console.error(`Error updating image URLs for table ${tableName}:`, error);
    }
}

async function updateAboutImageUrls(tableName) {
    try {
        const client = await pool.connect();
        const query = `SELECT * FROM "${tableName}"`;
        const result = await client.query(query);

        for (const row of result.rows) {

            const s1Url = row.Section1Image;
            const urlParts = s1Url.split('/');
            const s1updatedUrl = s1Url.replace(urlParts[2], newBucketName+".s3.amazonaws.com");

            const s1Url1 = row.Section1ImageOrg;
            const urlParts1 = s1Url1.split('/');
            const s1updatedUrl1 = s1Url1.replace(urlParts1[2], newBucketName+".s3.amazonaws.com");

            const updateQuery = `UPDATE "${tableName}" SET "Section1Image" = $1, "Section1ImageOrg" = $2 WHERE _id = $3`;
            await client.query(updateQuery, [s1updatedUrl, s1updatedUrl1, row._id]);

            }

        client.release();
        console.log(`Image URLs updated for table: ${tableName}`);
    } catch (error) {
        console.error(`Error updating image URLs for table ${tableName}:`, error);
    }
}

async function updateSampleCsvUrls(tableName) {
    try {
        const client = await pool.connect();
        const query = `SELECT * FROM "${tableName}"`;
        const result = await client.query(query);

        for (const row of result.rows) {

            const s1Url = row.Sample;
            const urlParts = s1Url.split('/');
            const s1updatedUrl = s1Url.replace(urlParts[2], newBucketName+".s3.amazonaws.com");

            const updateQuery = `UPDATE "${tableName}" SET "Sample" = $1 WHERE _id = $2`;
            await client.query(updateQuery, [s1updatedUrl, row._id]);

            }

        client.release();
        console.log(`Image URLs updated for table: ${tableName}`);
    } catch (error) {
        console.error(`Error updating image URLs for table ${tableName}:`, error);
    }
}

async function updateLandingImageUrls(tableName) {
    try {
        const client = await pool.connect();
        const query = `SELECT * FROM "${tableName}"`;
        const result = await client.query(query);

        for (const row of result.rows) {

            const s1Url = row.Section1Image;
            const urlParts = s1Url.split('/');
            const s1updatedUrl = s1Url.replace(urlParts[2], newBucketName+".s3.amazonaws.com");

            const s1Url1 = row.Section2Image1;
            const urlParts1 = s1Url1.split('/');
            const s1updatedUrl1 = s1Url1.replace(urlParts1[2], newBucketName+".s3.amazonaws.com");


            const s1Url2 = row.Section2Image2;
            const urlParts2 = s1Url2.split('/');
            const s1updatedUrl2 = s1Url2.replace(urlParts2[2], newBucketName+".s3.amazonaws.com");

            const s1Url3 = row.Section2Image3;
            const urlParts3 = s1Url3.split('/');
            const s1updatedUrl3 = s1Url3.replace(urlParts3[2], newBucketName+".s3.amazonaws.com");

            const s1Url4 = row.Section2Image3;
            const urlParts4 = s1Url4.split('/');
            const s1updatedUrl4 = s1Url4.replace(urlParts4[2], newBucketName+".s3.amazonaws.com");

            const s1Url5 = row.Section3Image;
            const urlParts5 = s1Url5.split('/');
            const s1updatedUrl5 = s1Url5.replace(urlParts5[2], newBucketName+".s3.amazonaws.com");

            const updateQuery = `UPDATE "${tableName}" SET "Section1Image" = $1, "Section2Image1" = $2, "Section2Image2" = $4, "Section2Image3" = $5, "Section2Image4" = $6, "Section3Image" = $7 WHERE _id = $3`;
            await client.query(updateQuery, [s1updatedUrl, s1updatedUrl1, row._id, s1updatedUrl2, s1updatedUrl3, s1updatedUrl4, s1updatedUrl5]);

            }

        client.release();
        console.log(`Image URLs updated for table: ${tableName}`);
    } catch (error) {
        console.error(`Error updating image URLs for table ${tableName}:`, error);
    }
}

const tablesToUpdate = [
    'ArtProductCategory',
    'ArtProductName',
    'ArtistCategories',
    'Categories',
    'Events',
    'Features',
    'Teams',
    'NewsAuthor',
    'News'
];

// Loop through the tables and update image URLs
async function updateAllTableImageUrls() {
    for (const tableName of tablesToUpdate) {
        await updateImageUrls(tableName);
    }
}

async function updateBannerImageUrls(tableName) {
    try {
        const client = await pool.connect();
        const query = `SELECT * FROM "${tableName}"`;
        const result = await client.query(query);

        for (const row of result.rows) {
            const updatedRow = { ...row }; // Create a copy of the row

            // Iterate through the row properties and update image URLs
            for (const prop in updatedRow) {
                if (updatedRow.hasOwnProperty(prop) && typeof updatedRow[prop] === 'string') {
                    const urlParts = updatedRow[prop].split('/');
                    updatedRow[prop] = updatedRow[prop].replace(urlParts[2], `${newBucketName}.s3.amazonaws.com`);
                }
            }

            // Construct the dynamic update query
            const updateColumns = Object.keys(updatedRow).map((col, index) => `"${col}" = $${index + 1}`).join(', ');
            const updateQuery = `UPDATE "${tableName}" SET ${updateColumns} WHERE _id = $${Object.keys(updatedRow).length + 1}`;
            const updateValues = Object.values(updatedRow);
            updateValues.push(row._id); // Assuming '_id' is the primary key column

            // Execute the update query
            await client.query(updateQuery, updateValues);
        }

        client.release();
        console.log(`Image URLs updated for table: ${tableName}`);
    } catch (error) {
        console.error(`Error updating image URLs for table ${tableName}:`, error);
    }
}

// Call the function with the table name and new bucket name


updateAllTableImageUrls();
updateAboutImageUrls("AboutUs");
updateSampleCsvUrls("CSVSamples");
updateLandingImageUrls("Landing");
updateBannerImageUrls("Banners");
updateBannerImageUrls("InnerBanners");






