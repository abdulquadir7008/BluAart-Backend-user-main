/* Add Collection Schema */
exports.AddCollectionSchema = {
  tags: ['Collection'],
  summary: "To Create New Collection",
  body: {
    description: 'New Collection Creation params',
    required: ['Name', 'Description', 'Banner', 'Thumb', 'Currency'],
    properties: {
      Currency: {
        type: 'string',
        description: 'By which Currency Collection needs to be created'
      },
      Name: {
        type: 'string',
        description: 'Collection Name (3 to 255 characters)'
      },
      Description: {
        type: 'string',
        description: 'Collection Description (100 to 1000 characters)'
      },
      Thumb: {
        type: 'string',
        description: 'The Image should contain binary data such as a file upload'
      },
      Banner: {
        type: 'string',
        description: 'The Image should contain binary data such as a file upload'
      },
      Royalties: {
        type: 'number',
        description: 'Royalty Percentage (0 - 10%)'
      }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        message: { type: 'string' }
      }
    }
  }
};

/* Update Collection Schema */
exports.UpdateCollectionSchema = {
  tags: ['Collection'],
  summary: "To Update Collection",
  body: {
    description: 'Update Collection params',
    required: ['CollectionId'],
    properties: {
      CollectionId: {
        type: 'string',
        description: 'Collection Id'
      },
      Name: {
        type: 'string',
        description: 'Collection Name (3 to 255 characters)',
        minLength: 3,
        maxLength: 255
      },
      Description: {
        type: 'string',
        minLength: 100,
        maxLength: 1000,
        description: 'Collection Description (100 to 1000 characters)'
      },
      Thumb: {
        type: 'string',
     
      },
      Banner: {
        type: 'string',
      
      },
      Royalties: {
        type: 'number',
        minimum: 0,
        maximum: 10,
        description: 'Royalty Percentage (0 - 10%)'
      }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        message: { type: 'string' }
      }
    }
  }
};



/* Collection Get Schema */
exports.CollectiongetSchema = {
  tags: ['Collection'],
  summary: "To Get collection details",
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        message: { type: 'string' },
        data: { type: 'array' },
      }
    }
  }
};

/* Collection list Schema */
exports.CollectionallgetSchema = {
  tags: ['Collection'],
  summary: "To Get collection details",
  body: {
    description: 'Collection Details',
    required: ['Role'],
    properties: {
      Role: {
        type: 'string',
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'array'
       
        },
      }
    }
  }
};

exports.UserCollectionallgetSchema = {
  tags: ['Collection'],
  summary: "To Get User based collection details",
  body: {
    description: 'Collection Details',
    required: ['AuthorId'],
    properties: {
      AuthorId: {
        type: 'string',
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        message: { type: 'string' },
        collectiondata: {
          type: 'array'
       
        },
        userdata:{
          type: 'array'
        }
      }
    }
  }
};

/* Collection Info Schema */
exports.CollectionInfoSchema = {
  tags: ['Collection'],
  summary: "To Get collection Info",
  body: {
    description: 'Collection Info Params',
    required: ['CollectionId'],
    properties: {
      CollectionId: {
        type: 'string',
        description: 'Collection Id For Which Info is Needed'
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'array',
          // Add the specific properties for the data array items
        },
      }
    }
  }
};
