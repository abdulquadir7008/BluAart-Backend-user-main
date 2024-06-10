const { exec } = require('child_process');
const config = require('./Config');

// const sourceDatabase = `postgres://bluaart:hAbRInex1&ox@bluaartdb1.c9cizzbvn86q.ap-southeast-1.rds.amazonaws.com:5432/bluaart_db`

const sourceDatabase = `postgres://${config.sqldb.user}:${config.sqldb.password}@${config.sqldb.host}:${config.sqldb.port}/${config.sqldb.database}`

const destDatabase = `postgres://${config.destsqldb.user}:${config.destsqldb.password}@${config.destsqldb.host}:${config.destsqldb.port}/${config.destsqldb.database}`

const tablesToEmpty = ['Prices', 'Notifications', 'Activities', 'WithdrawHistories', 'Histories', 'Address', 'Offers', 'OffersDelete', 'Bids', 'BidsDelete', 'PreOffers', 'Testimonials', 'Exhibitions', 'Bio', 'BidInterest', 'Cart', 'Medias', 'MetaData', 'TempCsv', 'SocketId', 'ProfileViews', 'ItemViews', 'GiftHistories', 'GiftNFT', 'Editions', 'ArtItems', 'Collections', 'Users']; // Use lowercase table name

tablesToEmpty.forEach((tableName) => {

  const serialColumnName = '_id';
  // First, get the sequence name
  exec(`psql -d '${destDatabase}' -c "SELECT pg_get_serial_sequence(quote_ident('${tableName}'::text), '${serialColumnName}');"`,  (error, stdout, stderr) => {
    if (error) {
      console.error(`Error getting sequence name for table ${tableName}:`, error);
    } else {
       const sequenceName = stdout.trim().split('\n')[2].trim(); // Get the sequence name from the query result

      console.log("sequenceName", sequenceName);
      // Now, reset the sequence to start from 1
       exec(`psql -d '${destDatabase}' -c 'ALTER SEQUENCE ${sequenceName} RESTART WITH 1;'`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error resetting auto-increment for table ${tableName}:`, error);
        } else {
          console.log(`Reset auto-increment for table ${tableName} successfully.`);
        }
      });
    }
  });
});

