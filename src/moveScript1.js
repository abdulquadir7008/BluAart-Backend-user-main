const { exec } = require('child_process');
const config = require('./Config');

// const sourceDatabase = `postgres://bluaart:hAbRInex1&ox@bluaartdb1.c9cizzbvn86q.ap-southeast-1.rds.amazonaws.com:5432/bluaart_db`

const sourceDatabase = `postgres://${config.sqldb.user}:${config.sqldb.password}@${config.sqldb.host}:${config.sqldb.port}/${config.sqldb.database}`

const destDatabase = `postgres://${config.destsqldb.user}:${config.destsqldb.password}@${config.destsqldb.host}:${config.destsqldb.port}/${config.destsqldb.database}`

const tablesToEmpty = ['Prices', 'Notifications', 'Activities', 'WithdrawHistories', 'Histories', 'Address', 'Offers', 'OffersDelete', 'Bids', 'BidsDelete', 'PreOffers', 'Testimonials', 'Exhibitions', 'Bio', 'BidInterest', 'Cart', 'Medias', 'MetaData', 'TempCsv', 'SocketId', 'ProfileViews', 'ItemViews', 'GiftHistories', 'GiftNFT', 'Editions', 'ArtItems', 'Collections', 'Users']; // Use lowercase table name


// Create a dump of the source table
exec(`pg_dump -Fc -d '${sourceDatabase}' > backup.dump`, (error, stdout, stderr) => {
  if (error) {
    console.error('Error creating dump:', error);
    return;
  }

  if (stderr) {
    console.error('Error (stderr):', stderr);
    return;
  }

  console.log('Dump created successfully.');

  // Restore the dump into the destination database
  exec(`pg_restore -d '${destDatabase}' --no-owner backup.dump`, (error, stdout, stderr) => {
    if (error) {
      console.error('Error restoring dump:', error);
      return;
    }

    if (stderr) {
      console.error('Error (stderr):', stderr);
      return;
    }

    console.log(`Table '${tableName}' copied successfully.`);

    // Clean up the dump file
    exec('rm backup.dump', (error) => {
      if (error) {
        console.error('Error cleaning up dump file:', error);
      } else {
        console.log('Dump file cleaned up successfully.');
      }
    });
  });
});


