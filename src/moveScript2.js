const { exec } = require('child_process');
const config = require('./Config');

// const sourceDatabase = `postgres://bluaart:hAbRInex1&ox@bluaartdb1.c9cizzbvn86q.ap-southeast-1.rds.amazonaws.com:5432/bluaart_db`

const sourceDatabase = `postgres://${config.sqldb.user}:${config.sqldb.password}@${config.sqldb.host}:${config.sqldb.port}/${config.sqldb.database}`

const destDatabase = `postgres://${config.destsqldb.user}:${config.destsqldb.password}@${config.destsqldb.host}:${config.destsqldb.port}/${config.destsqldb.database}`

const tablesToEmpty = ['Prices', 'Notifications', 'Activities', 'WithdrawHistories', 'Histories', 'Address', 'Offers', 'OffersDelete', 'Bids', 'BidsDelete', 'PreOffers', 'Testimonials', 'Exhibitions', 'Bio', 'BidInterest', 'Cart', 'Medias', 'MetaData', 'TempCsv', 'SocketId', 'ProfileViews', 'ItemViews', 'GiftHistories', 'GiftNFT', 'Editions', 'ArtItems', 'Collections', 'Users']; // Use lowercase table name


tablesToEmpty.forEach((tableName) => {
  exec(`psql -d '${destDatabase}' -c 'DELETE FROM "${tableName}";'`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error emptying table ${tableName}:`, error);
    } else {
      console.log(`Emptied table ${tableName} successfully.`);
    }
  });
});
