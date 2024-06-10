const axios = require('axios');
const Config = require('./Config');


const pinataApiKey = '4b0b624191e256ed40c6';
const pinataApiSecret = 'f334bd21b44f1d064b4a239769dab8e30b2f8b4ce906adc05769a91b72965beb';
const pinataJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJkYmJmMTM1ZS0zOWMxLTQ4OTUtOWI5ZC1hY2ZhNWFmNzk2ODYiLCJlbWFpbCI6Im5pZ2FtLmt1bWFyQG9wZW5nb3Zhc2lhLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfSx7ImlkIjoiTllDMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI0YjBiNjI0MTkxZTI1NmVkNDBjNiIsInNjb3BlZEtleVNlY3JldCI6ImYzMzRiZDIxYjQ0ZjFkMDY0YjRhMjM5NzY5ZGFiOGUzMGIyZjhiNGNlOTA2YWRjMDU3NjlhOTFiNzI5NjViZWIiLCJpYXQiOjE2ODE4OTY1ODN9.gJaXUg9CkRLhGAOWm3MU5jRyKHfTbYm60C32joP4Uo4';

const listPinnedFiles = async () => {
  const listPinnedUrl = 'https://api.pinata.cloud/data/pinList?status=pinned&pageLimit=100&pageOffset=1';

  const headers = {
    Authorization: `Bearer ${pinataJwt}`,
    pinata_api_key: pinataApiKey,
    pinata_secret_api_key: pinataApiSecret,
  };

  try {
    const response = await axios.get(listPinnedUrl, { headers });
    return response.data.rows;
  } catch (error) {
    console.error('Error listing pinned files:', error);
    throw error;
  }
};

const unpinFile = async (ipfsHash) => {
  const unpinUrl = `https://api.pinata.cloud/pinning/unpin/${ipfsHash}`;

  const headers = {
    Authorization: `Bearer ${pinataJwt}`,
    pinata_api_key: pinataApiKey,
    pinata_secret_api_key: pinataApiSecret,
  };

  try {
    await axios.delete(unpinUrl, { headers });
    console.log(`File with IPFS hash ${ipfsHash} unpinned successfully`);
  } catch (error) {
   // console.error(`Error unpinning file with IPFS hash ${ipfsHash}:`, error);
  }
};

const unpinAllFiles = async () => {
    const pageLimit = 100;
    let pageOffset = 1;
  
    try {
      let pinnedFiles = await listPinnedFiles(pageOffset, pageLimit);
  
      if (pinnedFiles.length === 0) {
        console.log('No pinned files found.');
        return;
      }
  
      while (pinnedFiles.length > 0) {
        for (const file of pinnedFiles) {
          await unpinFile(file.ipfs_pin_hash);
        }
  
        // Increment the pageOffset to get the next page
        pageOffset++;
  
        // Retrieve the next set of pinned files
        pinnedFiles = await listPinnedFiles(pageOffset, pageLimit);
      }
  
      console.log('All pinned files unpinned successfully.');
    } catch (error) {
      console.error('Error unpinning files:', error);
    }
  };

// Usage: Call the unpinAllFiles function to unpin all files in your Pinata account.
unpinAllFiles();
