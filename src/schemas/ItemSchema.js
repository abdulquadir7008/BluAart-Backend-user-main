/* Update Item Thumb */
exports.ArtItemThumbUpdateSchema = {
  tags: ['ArtItems'],
  summary: "To Update Item Thumb Image",
  body: {
    description: 'Item Thumb Image Update Params',
    required: ['Thumb', 'ItemId'],
    properties: {
      Thumb: {
        type: 'string',
        description: 'The Image should contain binary data such as a file upload'
      },
      ItemId: {
        type: 'string'
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        message: { type: 'string' },
        Thumb: { 
          type: 'object',
          properties:{
            "s3Image": {type:"string"},
            "s3CImage": {type:"string"}
          } 
        },
        IPFSThumb: { type: 'string' }
      }
    }
  }
};



/* Update Item Media */
exports.ArtItemMediaUpdateSchema = {
  tags: ['ArtItems'],
  summary: "To Update Item Media Image",
  body: {
    description: 'Item Media Image Update Params',
    required: ['Media'],
    properties: {
      Media: {
        type: 'string',
        description: 'The Image should contain binary data such as a file upload'
      },
      ItemId: {
        type: 'string'
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        message: { type: 'string' },
        Media: { 
          type: 'object',
          properties:{
            "s3Image": {type:"string"},
            "s3CImage": {type:"string"}
          } 
        },
        IPFSMedia: { type: 'string'}
      }
    }
  }
};

exports.BulkMediaUpdateSchema = {
  tags: ['Artworks'],
  summary: "To Upload Bulk Image",
  body: {
    description: 'Bulk Media Image Update Params',
    required: ['Image'],
    properties: {
      Image: {
        type: 'string',
        description: 'The Image should contain binary data such as a file upload'
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        message: { type: 'string' },
        Media: {
          type: 'array'
    
        }
      }
    }
  }
};

exports.BulkThumbUpdateSchema = {
  tags: ['Artworks'],
  summary: "To Upload Bulk Image",
  body: {
    description: 'Bulk Thumb Image Update Params',
    required: ['Image', 'CollectionId', 'Quantity'],
    properties: {
      Image: {
        type: 'string',
        description: 'The Image should contain binary data such as a file upload'
      },
      CollectionId: {
        type: 'string'
      },
      Quantity: {
        type: 'string'
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        message: { type: 'string' },
        Thumb: {
          type: 'array'
    
        }
      }
    }
  }
};

exports.BulkCSVUpdateSchema = {
  tags: ['ArtItems'],
  summary: "To Bulk Upload Data",
  body: {
    description: 'Bulk Upload Update Params',
    required: ['csvFile', 'CollectionId', 'Media', 'Thumb', 'Quantity', 'Type'],
    properties: {
      csvFile: {
        type: 'string',
        description: 'The Image should contain binary data such as a file upload'
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        message: { type: 'string' },
        errors: { type: 'array' },
        Media: {
          type: 'array'
    
        }
      }
    }
  }
};

exports.BulkMintUpdateSchema = {
  tags: ['Artworks'],
  summary: "To Update Bulk Mint",
  body: {
    description: 'To Update Bulk Mint',
    type: 'object',
    required: ['ItemIdarray', 'TokenIdarray'],
    properties: {
      ItemIdarray: {
        type: 'array'
      },
      TokenIdarray:{
        type: 'array'
      }
    
    },
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

/* Get Categories */
exports.CategoriesListSchema = {
  tags: ['Items'],
  summary: "To Get Categories",
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' }, // Status of the response
        data: { type: 'array' }, // Array of categories
      },
    },
  },
};

exports.APCategoriesListSchema = {
  tags: ['Art Products'],
  summary: "To Get Art Product Categories",
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' }, // Status of the response
        data: { type: 'array' }, // Array of categories
      },
    },
  },
};

exports.APStylesListSchema = {
  tags: ['Art Products'],
  summary: "To Get Art Product Styles",
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' }, // Status of the response
        data: { type: 'array' }, // Array of categories
      },
    },
  },
};

exports.APMaterialsListSchema = {
  tags: ['Art Products'],
  summary: "To Get Art Product Materials",
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' }, // Status of the response
        data: { type: 'array' }, // Array of categories
      },
    },
  },
};

exports.APFabricListSchema = {
  tags: ['Art Products'],
  summary: "To Get Art Product Fabric",
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' }, // Status of the response
        data: { type: 'array' }, // Array of categories
      },
    },
  },
};

exports.APBrandListSchema = {
  tags: ['Art Products'],
  summary: "To Get Art Product Brand",
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' }, // Status of the response
        data: { type: 'array' }, // Array of categories
      },
    },
  },
};

exports.APShapeListSchema = {
  tags: ['Art Products'],
  summary: "To Get Art Product Shape",
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' }, // Status of the response
        data: { type: 'array' }, // Array of categories
      },
    },
  },
};

exports.APTypeListSchema = {
  tags: ['Art Products'],
  summary: "To Get Art Product Type",
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' }, // Status of the response
        data: { type: 'array' }, // Array of categories
      },
    },
  },
};

exports.APTechniqueListSchema = {
  tags: ['Art Products'],
  summary: "To Get Art Product Technique",
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' }, // Status of the response
        data: { type: 'array' }, // Array of categories
      },
    },
  },
};

exports.APCushionsizeSchema = {
  tags: ['Art Products'],
  summary: "To Get Cushion Size List",
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' }, // Status of the response
        data: { type: 'array' }, // Array of categories
      },
    },
  },
};

exports.APRugsizeSchema = {
  tags: ['Art Products'],
  summary: "To Get Rug Size List",
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' }, // Status of the response
        data: { type: 'array' }, // Array of categories
      },
    },
  },
};

exports.APFurnitureNameSchema = {
  tags: ['Art Products'],
  summary: "To Get Accent Furniture Name List",
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' }, // Status of the response
        data: { type: 'array' }, // Array of categories
        category: {type: 'string'}
      },
    },
  },
};

exports.APLightingNameSchema = {
  tags: ['Art Products'],
  summary: "To Get Accent Lighting Name List",
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' }, // Status of the response
        data: { type: 'array' }, // Array of categories
        category: {type: 'string'}
      },
    },
  },
};

exports.APFurnishingNameSchema = {
  tags: ['Art Products'],
  summary: "To Get Accent Furnishing Name List",
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' }, // Status of the response
        data: { type: 'array' }, // Array of categories
        category: { type: 'string'}
      },
    },
  },
};

exports.APNameSchema = {
  tags: ['Art Products'],
  summary: "To Get Art Product Name List",
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' }, // Status of the response
        data: { type: 'array' }, // Array of categories
      },
    },
  },
};

// Material List Schema
exports.MaterialListSchema = {
  tags: ['Items'],
  summary: "To Get Materials",
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' }, // Status of the response
        data: { type: 'array' }, // Array of materials
      },
    },
  },
};

// Medium List Schema
exports.MediumListSchema = {
  tags: ['Items'],
  summary: "To Get Medium",
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' }, // Status of the response
        data: { type: 'array' }, // Array of medium
      },
    },
  },
};

// Schema for getting the artist category list
exports.ArtistCategoryListSchema = {
  tags: ['Users'],
  summary: "To Get Artist Category List",
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        data: {
          type: 'array'
        },
      }
    }
  }
}

exports.ArtistLabelListSchema = {
  tags: ['Users'],
  summary: "To Get Artist Label List",
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        data: {
          type: 'array'
        },
      }
    }
  }
}

// Schema for getting the artist medium list
exports.ArtistMediumListSchema = {
  tags: ['Users'],
  summary: "To Get Artist Medium List",
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              "Title": { type: 'string' }, // Title of the medium
              "_id": { type: 'string' }, // Title of the medium
               // Value of the medium
            }
          }
        },
      }
    }
  }
}

// Schema for getting the artist style list
exports.ArtistStyleListSchema = {
  tags: ['Users'],
  summary: "To Get Artist Style List",
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              "Title": { type: 'string' }, // Title of the style
              "Value": { type: 'string' } // Value of the style
            }
          }
        },
      }
    }
  }
}

// Schema for getting item view by month
exports.ItemViewbyMonthSchema = {
  tags: ['Dashboard'],
  summary: "Get Item View By Month",
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        info: {
          type: "array" // Array containing the item view information
        },
      }
    }
  }
}

// Schema for getting most visited item
exports.MostVisitedSchema = {
  tags: ['Dashboard'],
  summary: "Get Most Visited Item",
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        info: {
          type: "array" // Array containing the most visited item information
        },
      }
    }
  }
}

// Schema for getting styles
exports.StyleListSchema = {
  tags: ['Items'],
  summary: "To Get Styles",
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        data: { type: 'array' } // Array containing the list of styles
      }
    }
  }
}

// Schema for getting keywords
exports.KeywordListSchema = {
  tags: ['Items'],
  summary: "To Get Keywords",
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        data: { type: 'array' } // Array containing the list of keywords
      }
    }
  }
}


// Add Artwork General Schema
exports.AddArtworkGeneralSchema = {
  tags: ['Artworks'],
  summary: "To Create New Artwork General",
  body: {
    // Description of the parameters required to create a new artwork
    description: 'New Artwork Creation params',
    type: 'object',
    required: ['Title', 'CreationYear',  'Unique', 'Dimension', 'Height', 'Width', 'Depth', 'CollectionId', 'PhysicalArt'],
    properties: {
      Title: {
        type: 'string',
        description: 'Artwork Name (3 to 255 characters)',
        minLength: 3,
        maxLength: 255
      },
      CreationYear: {
        type: 'number',
        description: 'Artwork Year of Creation'
      },
      Category: {
        type: 'number',
        description: 'Artwork Category'
      },
      Color: {
        type: 'string',
        description: 'Artwork Color'
      },
      Orientation:{
        type: 'string',
        description: 'Artwork Orientation'
      },
      Material: {
        type: 'array',
        description: 'Artwork Material'
      },
      Type:{
        type: 'string',
        description: 'Artwork / ArtProduct'
      },
      ProductCategory:{
        type: 'string',
      },
      ProductName:{
        type: 'string',
      },
      ProductBrand:{
        type: 'string',
      },
      ProductFabric:{
        type: 'string',
      },
      ProductStyle:{
        type: 'string',
      },
      ProductSize:{
        type: 'string',
      },
      ProductMaterial:{
        type: 'string',
      },
      ProductTechnique:{
        type: 'string',
      },
      ProductShape:{
        type: 'string',
      },
      ProductType:{
        type: 'string',
      },
      Unique: {
        type: 'boolean',
        description: 'Unique / Multiple'
      },
      Publisher: {
        type: 'string',
        description: 'Artwork Publisher'
      },
      Edition: {
        type: 'number',
        description: 'Artwork Edition'
      },
      Dimension: {
        type: 'string',
        description: 'IN / CM'
      },
      Height: {
        type: 'number',
        description: 'Artwork Height'
      },
      Width: {
        type: 'number',
        description: 'Artwork Width'
      },
      Depth: {
        type: 'number',
        description: 'Artwork Depth'
      },
      CollectionId: {
        type: 'string',
        description: "Artwork's Collection ID"
      },
      PhysicalArt: {
        type: 'boolean'
      },
      Artworkid: {
        type: 'string'
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: {
          type: 'boolean'
        },
        message: {
          type: 'string'
        },
        Artworkid: {
          type: 'string'
        }
      }
    }
  }
};

exports.AddArtItemGeneralSchema = {
  tags: ['ArtItems'],
  summary: "To Create New ArtItem General",
  body: {
    // Description of the parameters required to create a new artwork
    description: 'New ArtItem Creation params',
    type: 'object',
    required: ['Title', 'CreationYear', 'CollectionId', 'PhysicalEdition', 'DigitalEdition'],
    properties: {
      Unique:{
        type: 'boolean',
        default: false
      },
      Title: {
        type: 'string',
        description: 'Artwork Name (3 to 255 characters)',
        minLength: 3,
        maxLength: 255
      },
      CreationYear: {
        type: 'number',
        description: 'Artwork Year of Creation'
      },
      Category: {
        type: 'string',
        description: 'Artwork Category'
      },
      Color: {
        type: 'string',
        description: 'Artwork Color'
      },
      Orientation:{
        type: 'string',
        description: 'Artwork Orientation'
      },
      Material: {
        type: 'array',
        description: 'Artwork Material'
      },
      Type:{
        type: 'string',
        description: 'Artwork / ArtProduct'
      },

      Publisher: {
        type: 'string',
        description: 'Artwork Publisher'
      },
      PhysicalEdition: {
        type: 'number',
        description: 'Physical Edition'
      },
      DigitalEdition: {
        type: 'number',
        description: 'Digital Edition'
      },
      Dimension: {
        type: 'string',
        description: 'IN / CM'
      },
      Height: {
        type: 'number',
        description: 'Artwork Height'
      },
      Width: {
        type: 'number',
        description: 'Artwork Width'
      },
      Depth: {
        type: 'number',
        description: 'Artwork Depth'
      },
      CollectionId: {
        type: 'string',
        description: "Artwork's Collection ID"
      },
     
      Artworkid: {
        type: 'string'
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: {
          type: 'boolean'
        },
        message: {
          type: 'string'
        },
        Artworkid: {
          type: 'string'
        }
      }
    }
  }
};

// Schema for adding new artwork artist details
exports.AddArtworkArtistSchema = {
  tags: ['Artworks'],
  summary: 'To Create New Artwork Artist Detail',
  body: {
    // Description of the request body
    description: 'New Artwork Creation params',
    type: 'object',
    // List of required properties in the request body
    required: ['Artworkid', 'Description'],
    properties: {
      // Artwork id property
      Artworkid: {
        type: 'string',
        description: 'Artwork id',
      },
      // Artwork Figurative property (boolean)
      Figurative: {
        type: 'boolean',
        description: 'Artwork Figurative'
      },
      // Artwork Series property (string)
      Series: {
        type: 'string',
        description: 'Artwork Series'
      },
      // Artwork Style property (string)
      Style: {
        type: 'string',
        description: 'Artwork Style'
      },
      // Artwork StyleId property (array)
      StyleId: {
        type: 'array'
      },
      // Artwork Subject property (string)
      Subject: {
        type: 'string',
        description: 'Artwork Subject'
      },
      // Artwork SubjectId property (array)
      SubjectId: {
        type: 'array'
      },
      // Artwork Keywords property (string)
      Keywords: {
        type: 'string',
        description: 'Artwork Keywords'
      },
      // Artwork KeywordsId property (array)
      KeywordsId: {
        type: 'array'
      },
      // Artwork Condition property (string)
      Condition: {
        type: 'string',
        description: 'Artwork condition'
      },
      // Artwork Signature property (string)
      Signature: {
        type: 'string',
        description: 'Artwork Signature'
      },
      // Artwork Description property
      Description: {
        type: 'string',
        minLength: 100,
        maxLength: 1000,
        description: 'Artwork Description'
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        // Response status property (boolean)
        status: {
          type: 'boolean'
        },
        // Response message property (string)
        message: {
          type: 'string'
        },
        // Artwork id property (string)
        Artworkid: {
          type: 'string'
        }
      }
    }
  }
};

exports.AddArtItemArtistSchema = {
  tags: ['ArtItems'],
  summary: 'To Create New ArtItem Artist Detail',
  body: {
    // Description of the request body
    description: 'New ArtItem Creation params',
    type: 'object',
    // List of required properties in the request body
    required: ['Artworkid', 'Description'],
    properties: {
      // Artwork id property
      Artworkid: {
        type: 'string',
        description: 'Artwork id',
      },
      // Artwork Figurative property (boolean)
      Figurative: {
        type: 'boolean',
        description: 'Artwork Figurative'
      },
      // Artwork Series property (string)
      Series: {
        type: 'string',
        description: 'Artwork Series'
      },
      // Artwork Style property (string)
      Style: {
        type: 'array',
        description: 'Artwork Style'
      },

      // Artwork Subject property (string)
      Subject: {
        type: 'array',
        description: 'Artwork Subject'
      },
      // Artwork Keywords property (string)
      Keywords: {
        type: 'array',
        description: 'Artwork Keywords'
      },
      // Artwork Condition property (string)
      Condition: {
        type: 'string',
        description: 'Artwork condition'
      },
      // Artwork Signature property (string)
      Signature: {
        type: 'string',
        description: 'Artwork Signature'
      },
      // Artwork Description property
      Description: {
        type: 'string',
        minLength: 100,
        maxLength: 1000,
        description: 'Artwork Description'
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        // Response status property (boolean)
        status: {
          type: 'boolean'
        },
        // Response message property (string)
        message: {
          type: 'string'
        },
        // Artwork id property (string)
        Artworkid: {
          type: 'string'
        }
      }
    }
  }
};

// Schema for adding new artwork price details
exports.AddArtworkPriceSchema = {
  tags: ['Artworks'],
  summary: 'To Create New Artwork Price Detail',
  body: {
    // Description of the request body
    description: 'New Artwork Creation params',
    type: 'object',
    // List of required properties in the request body
    required: ['Price', 'PriceDisplay', 'Artworkid', 'PriceTransparency'],
    properties: {
      // Artwork id property
      Artworkid: {
        type: 'string',
        description: 'Artwork id',
      },
      // Artwork PriceDisplay property (boolean)
      PriceDisplay: {
        type: 'boolean',
        description: 'Artwork Price Display'
      },
      // Artwork AutoAcceptOffers property (boolean)
      AutoAcceptOffers: {
        type: 'boolean',
        description: 'Artwork AutoAcceptOffers'
      },
      AutoRejectOffers: {
        type: 'boolean',
        description: 'Artwork AutoRejectOffers'
      },
      Price: {
        type: 'number',
        description: 'Artwork Price'
      },
      PriceTransparency: {
          type: 'number',
          description: 'Artwork Price Tranparaency'
      }
  
    },
  },
  response:{
      200:{
          type: 'object',
          properties:{
              status:{type:'boolean'},
              message:{type:'string'},
              Artworkid:{type:'string'}
          }
      }
  }
}

exports.AddArtItemPriceSchema = {
  tags: ['ArtItems'],
  summary: 'To Create New Artitem Price Detail',
  body: {
    // Description of the request body
    description: 'New Artitem Creation params',
    type: 'object',
    // List of required properties in the request body
    required: ['PhysicalPrice', 'DigitalPrice', 'PriceDisplay', 'Artworkid', 'PriceTransparency', 'Currency'],
    properties: {
      // Artwork id property
      Currency:{
        type: 'string'
      },
      Artworkid: {
        type: 'string',
        description: 'Artwork id',
      },
      // Artwork PriceDisplay property (boolean)
      PriceDisplay: {
        type: 'boolean',
        description: 'Artwork Price Display'
      },
      // Artwork AutoAcceptOffers property (boolean)
      AutoAcceptOffers: {
        type: 'boolean',
        description: 'Artwork AutoAcceptOffers'
      },
      AutoRejectOffers: {
        type: 'boolean',
        description: 'Artwork AutoRejectOffers'
      },
      PhysicalPrice: {
        type: 'number',
        description: 'Artwork Price'
      },
      DigitalPrice: {
        type: 'number',
        description: 'Artwork Price'
      },
      PriceTransparency: {
          type: 'number',
          description: 'Artwork Price Tranparaency'
      }
  
    },
  },
  response:{
      200:{
          type: 'object',
          properties:{
              status:{type:'boolean'},
              message:{type:'string'},
              Artworkid:{type:'string'}
          }
      }
  }
}

// Schema for adding new Artwork Logistic details
exports.AddArtworkLogisticSchema = {
  tags: ['Artworks'],
  summary: "To Create New Artwork Logistic Detail",
  body: {
    // Description of the parameters required to create new artwork logistic detail
    description: 'New Artwork Creation params',
    type: 'object',
    required: ['Artworkid'],
    properties: {
      Artworkid: {
        type: 'string',
        description: 'Artwork id',
      },
      Framed: {
        type: 'boolean',
        description: 'Artwork Framed'
      },
      Panel: {
        type: 'string',
        description: 'Single / Multiple'
      },
      Packaging: {
        type: 'string',
        description: 'Artwork Packaging'
      },
      PackageDimension: {
        type: 'string',
        description: 'IN / CM'
      },
      PackageHeight: {
        type: 'number',
        description: 'Package Height'
      },
      PackageWidth: {
        type: 'number',
        description: 'Package Width'
      },
      PackageDepth: {
        type: 'number',
        description: 'Package Depth'
      },
      PackageWeight: {
        type: 'string',
        description: 'KG / LB'
      },
      PackageWeightValue: {
        type: 'number',
        description: 'Package Weight Value'
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: {
          type: 'boolean'
        },
        message: {
          type: 'string'
        },
        Artworkid: {
          type: 'string'
        }
      }
    }
  }
};

exports.AddArtItemLogisticSchema = {
  tags: ['ArtItems'],
  summary: "To Create New Artitem Logistic Detail",
  body: {
    // Description of the parameters required to create new artwork logistic detail
    description: 'New Artitem Creation params',
    type: 'object',
    required: ['Artworkid'],
    properties: {
      Artworkid: {
        type: 'string',
        description: 'Artwork id',
      },
      Framed: {
        type: 'boolean',
        description: 'Artwork Framed'
      },
      Panel: {
        type: 'string',
        description: 'Single / Multiple'
      },
      Packaging: {
        type: 'string',
        description: 'Artwork Packaging'
      },
      PackageDimension: {
        type: 'string',
        description: 'IN / CM'
      },
      PackageHeight: {
        type: 'number',
        description: 'Package Height'
      },
      PackageWidth: {
        type: 'number',
        description: 'Package Width'
      },
      PackageDepth: {
        type: 'number',
        description: 'Package Depth'
      },
      PackageWeight: {
        type: 'string',
        description: 'KG / LB'
      },
      PackageWeightValue: {
        type: 'number',
        description: 'Package Weight Value'
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: {
          type: 'boolean'
        },
        message: {
          type: 'string'
        },
        Artworkid: {
          type: 'string'
        }
      }
    }
  }
};

// Schema for adding new Artwork Image details
exports.AddArtworkImageSchema = {
  tags: ['Artworks'],
  summary: "To Create New Artwork Image Detail",
  body: {
    // Description of the parameters required to create new artwork image detail
    description: 'New Artwork Creation params',
    type: 'object',
    required: ['Artworkid', 'Thumb', 'Media'],
    properties: {
      Artworkid: {
        type: 'string',
        description: 'Artwork id',
      },
      Thumb: {
        type: 'object',
        properties: {
          "CDN": {
            type: "string"
          },
          "CCDN": {
            type: "string"
          },
          "IPFS": {
            type: "string"
          },
          "Local": {
            type: "string"
          },
          "CLocal": {
            type: "string"
          }
        }
      },
      Media: {
        type: 'object',
        properties: {
          "CDN": {
            type: "string"
          },
          "CCDN": {
            type: "string"
          },
          "IPFS": {
            type: "string"
          },
          "Local": {
            type: "string"
          },
          "CLocal": {
            type: "string"
          }
        }
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: {
          type: 'boolean'
        },
        message: {
          type: 'string'
        },
        Artworkid: {
          type: 'string'
        }
      }
    }
  }
};

exports.AddArtItemImageSchema = {
  tags: ['ArtItems'],
  summary: "To Create New ArtItem Image Detail",
  body: {
    // Description of the parameters required to create new artwork image detail
    description: 'New Artitem Creation params',
    type: 'object',
    required: ['Artworkid'],
    properties: {
      Artworkid: {
        type: 'string',
        description: 'Artwork id',
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: {
          type: 'boolean'
        },
        message: {
          type: 'string'
        },
        Artworkid: {
          type: 'string'
        }
      }
    }
  }
};

// Schema for updating an item
exports.UpdateItemSchema = {
  tags: ['Items'],
  summary: 'To Update Item',
  body: {
    // Description of the request body
    description: 'Update Item params',
    type: 'object',
    properties: {
      // ItemId property
      ItemId: {
        type: 'string',
        description: 'The ID of the item to be updated.'
      },
      // Price property
      Price: {
        type: 'string',
        description: 'The new price of the item.'
      },
      // EnableBid property (boolean)
      EnableBid: {
        type: 'boolean',
        description: 'Indicates whether bidding is enabled for the item.'
      },
      // EnableAuction property (boolean)
      EnableAuction: {
        type: 'boolean',
        description: 'Indicates whether auction is enabled for the item.'
      },
      // DateRange property (array)
      DateRange: {
        type: 'array',
        description: 'The range of dates during which the item is available for sale.',
        items: {
          type: 'string',
          format: 'date-time'
        }
      },
      // TimeZone property (string)
      TimeZone: {
        type: 'string',
        description: 'The time zone for the item.'
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        // Response status property (boolean)
        status: {
          type: 'boolean',
          description: 'The status of the update operation.'
        },
        // Response message property (string)
        message: {
          type: 'string',
          description: 'A descriptive message regarding the update operation.'
        }
      }
    }
  }
};

exports.UpdateArtItemSchema = {
  tags: ['ArtItems'],
  summary: 'To Update Item',
  body: {
    // Description of the request body
    description: 'Update Item params',
    type: 'object',
    properties: {
      // ItemId property
      ItemId: {
        type: 'string',
        description: 'The ID of the item to be updated.'
      },
      Edition: {
        type: 'string',
      },
      // EnableBid property (boolean)
      EnableBid: {
        type: 'boolean',
        description: 'Indicates whether bidding is enabled for the item.'
      },
      // EnableAuction property (boolean)
      EnableAuction: {
        type: 'boolean',
        description: 'Indicates whether auction is enabled for the item.'
      },
      // DateRange property (array)
      DateRange: {
        type: 'array',
        description: 'The range of dates during which the item is available for sale.',
        items: {
          type: 'string',
          format: 'date-time'
        }
      },
      // TimeZone property (string)
      TimeZone: {
        type: 'string',
        description: 'The time zone for the item.'
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        // Response status property (boolean)
        status: {
          type: 'boolean',
          description: 'The status of the update operation.'
        },
        // Response message property (string)
        message: {
          type: 'string',
          description: 'A descriptive message regarding the update operation.'
        }
      }
    }
  }
};

exports.DelistArtItemSchema = {
  tags: ['ArtItems'],
  summary: 'To Delist Item',
  body: {
    description: 'Delist Item params',
    type: 'object',
    required: ['ItemId', 'Edition'],
    properties: {
      // ItemId property
      ItemId: {
        type: 'string',
      },
      Edition:{
        type: 'number'
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        // Response status property (boolean)
        status: {
          type: 'boolean',
          description: 'The status of the update operation.'
        },
        // Response message property (string)
        message: {
          type: 'string',
          description: 'A descriptive message regarding the update operation.'
        }
      }
    }
  }
};

exports.HideArtItemSchema = {
  tags: ['ArtItems'],
  summary: 'To Hide Item',
  body: {
    description: 'Hide Item params',
    type: 'object',
    required: ['ItemId'],
    properties: {
      // ItemId property
      ItemId: {
        type: 'string',
        description: 'The ID of the item to be updated.'
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        // Response status property (boolean)
        status: {
          type: 'boolean',
          description: 'The status of the update operation.'
        },
        // Response message property (string)
        message: {
          type: 'string',
          description: 'A descriptive message regarding the update operation.'
        }
      }
    }
  }
};

// Schema for getting item details based on user
exports.ItemgetSchema = {
  tags: ['Items'],
  summary: 'To Get Item details based on User',
  response: {
    200: {
      type: 'object',
      properties: {
        // Response status property (boolean)
        status: {
          type: 'boolean'
        },
        // Response message property (string)
        message: {
          type: 'string'
        },
        // Data property (array)
        data: {
          type: 'array'
        }
      }
    }
  }
};

// Schema for getting all item details
exports.ItemgetAllSchema = {
  tags:['Items'],
  summary:"To Get Item details",
  body: {
    required: ['Category'],
    properties: {
      Category: {
        type: 'string',
      },
      Name: {
        type: 'string',
      },
    },
  },
  response:{
      200:{
          type: 'object',
          properties:{
              status:{type:'boolean'},
              message:{type:'string'},
              category: {type: 'string'},
              data:{
               type:'array',
             
            },              
          }
      }
  }
}

// Schema for getting all item Bid details

// Schema for getting all Filter details
exports.ItemgetAllFilterSchema = {
  tags: ['Items'],
  summary: "To Get Item Based on Filter",
  body: {
    // Description of the parameters required to get item based on filter
    description: 'Item Info Params',
    properties: {
      Filters: {
        type: 'object',
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
          items: {
            type: 'object',
            properties: {
              "_id": { type: 'string' },
              "Thumb": { type: 'string' },
            },
          },
        },
      },
    },
  },
};

// Schema for getting all Collection Based Item details
exports.CollectionBasedItemgetSchema = {
  tags: ['ArtItems'],
  summary: "To Get Item details Based on Collections",
  body: {
    // Description of the parameters required to get item details based on collections
    description: 'Item Info Params',
    required: ['CollectionId'],
    properties: {
      CollectionId: {
        type: 'string',
        description: 'Collection Id for which Item List is Needed',
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        message: { type: 'string' },
        data: { type: 'array' },
      },
    },
  },
};

exports.MintedCollectionBasedItemgetSchema = {
  tags: ['ArtItems'],
  summary: "To Get Minted & Unminted details Based on Collections",
  body: {
    // Description of the parameters required to get item details based on collections
    description: 'Item Info Params',
    required: ['CollectionId'],
    properties: {
      CollectionId: {
        type: 'string',
        description: 'Collection Id for which Item List is Needed',
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        message: { type: 'string' },
        mintdata: { type: 'array' },
        unmintdata: { type: 'array' },
      },
    },
  },
};

exports.CollectionBasedArtItemgetSchema = {
  tags: ['ArtItems'],
  summary: "To Get Item details Based on Collections",
  body: {
    // Description of the parameters required to get item details based on collections
    description: 'Item Info Params',
    required: ['CollectionId'],
    properties: {
      CollectionId: {
        type: 'string',
        description: 'Collection Id for which Item List is Needed',
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        message: { type: 'string' },
        data: { type: 'array' },
      },
    },
  },
};

// Schema for getting Cart Item details
exports.CartItemgetSchema = {
  tags: ['Purchase Items'],
  summary: "To Get Cart Item details",
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        message: { type: 'string' },
        data: { type: 'array' },
      },
    },
  },
};

// Schema for getting item info
exports.CartItemInfoSchema = {
  tags: ['ArtItems'],
  summary: 'To Get Item Info',
  body: {
    // Description of the request body
    description: 'Item Info Params',
    required: ['CartId'],
    properties: {
      // ItemId property
      CartId: {
        type: 'string',
        description: 'Cart Id For Which Info Is Needed'
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        // Response status property (boolean)
        status: {
          type: 'boolean'
        },
        // Response message property (string)
        message: {
          type: 'string'
        },
        // Data property (array)
        data: {
          type: 'array'
        }
      }
    }
  }
};

exports.UpcomingBidInfoSchema = {
  tags: ['Items'],
  summary: 'To Get Upcoming Bid list',
  response: {
    200: {
      type: 'object',
      properties: {
        // Response status property (boolean)
        status: {
          type: 'boolean'
        },
        // Response message property (string)
        message: {
          type: 'string'
        },
        // Data property (array)
        data: {
          type: 'array'
        }
      }
    }
  }
};

exports.ArtistBasedBidInfoSchema = {
  tags: ['Items'],
  summary: 'To Get Artist Based Bid list',
  body: {
    description: 'To Get Artist Based Bid list',
    required: ['AuthorId'],
    properties: {
      AuthorId: {
        type: 'string'
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        // Response status property (boolean)
        status: {
          type: 'boolean'
        },
        // Response message property (string)
        message: {
          type: 'string'
        },
        // Data property (array)
        data: {
          type: 'array'
        }
      }
    }
  }
};

exports.ArtistBasedBidInterestSchema = {
  tags: ['Items'],
  summary: 'To Get Artist Based Bid Interest',
  body: {
    description: 'To Get Artist Based Bid Interest list',
    required: ['AuthorId'],
    properties: {
      AuthorId: {
        type: 'string'
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        // Response status property (boolean)
        status: {
          type: 'boolean'
        },
        // Response message property (string)
        message: {
          type: 'string'
        },
        // Data property (array)
        data: {
          type: 'array'
        }
      }
    }
  }
};

exports.OngoingBidInfoSchema = {
  tags: ['Items'],
  summary: 'To Get Ongoing Bid list',
  response: {
    200: {
      type: 'object',
      properties: {
        // Response status property (boolean)
        status: {
          type: 'boolean'
        },
        // Response message property (string)
        message: {
          type: 'string'
        },
        // Data property (array)
        data: {
          type: 'array'
        }
      }
    }
  }
};

exports.PastBidInfoSchema = {
  tags: ['Items'],
  summary: 'To Get Past Bid list',
  response: {
    200: {
      type: 'object',
      properties: {
        // Response status property (boolean)
        status: {
          type: 'boolean'
        },
        // Response message property (string)
        message: {
          type: 'string'
        },
        // Data property (array)
        data: {
          type: 'array'
        }
      }
    }
  }
};

exports.BidInterestSchema = {
  tags: ['Items'],
  summary: 'To Add Bid Interest',
  body: {
    description: 'Add Bid Interest Params',
    required: ['ItemId'],
    properties: {
      // ItemId property
      ItemId: {
        type: 'string'
      },
      Email: {
        type: 'string'
      },
      UserId:{
        type: 'string'
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: {
          type: 'boolean'
        },
        data: {
          type: 'string'
        }
      }
    }
  }
};

// Schema for getting item owner list
exports.ItemOwnerListInfoSchema = {
  tags: ['Items'],
  summary: 'To Get Item Owner List',
  body: {
    // Description of the request body
    description: 'Item Owner List Info Params',
    required: ['ItemId'],
    properties: {
      // ItemId property
      ItemId: {
        type: 'string',
        description: 'Item Id For Which Info Is Needed'
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        // Response status property (boolean)
        status: {
          type: 'boolean'
        },
        // Response message property (string)
        message: {
          type: 'string'
        },
        // Data property (array)
        data: {
          type: 'array'
        }
      }
    }
  }
};

// Schema for getting item history list
exports.ItemHistoryListInfoSchema = {
  tags: ['Items'],
  summary: 'To Get Item History List',
  body: {
    // Description of the request body
    description: 'Item History List Info Params',
    required: ['ItemId'],
    properties: {
      // ItemId property
      ItemId: {
        type: 'string',
        description: 'Item Id For Which Info Is Needed'
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        // Response status property (boolean)
        status: {
          type: 'boolean'
        },
        // Response message property (string)
        message: {
          type: 'string'
        },
        // Data property (array)
        data: {
          type: 'array'
        }
      }
    }
  }
};

// Schema for getting item Detail list
exports.ItemInfoDetailedSchema = {
  tags: ['Items'],
  summary: "To Get Item Info Details",
  body: {
    // Description of the parameters required to get item info details
    description: 'Item Info Details Params',
    required: ['ItemId'],
    properties: {
      ItemId: {
        type: 'string',
        description: 'Item Id for which info is needed',
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        message: { type: 'string' },
        data: { type: 'array' },
      },
    },
  },
};

// Schema for getting item Publish list
exports.ItemPublishSchema = {
  tags: ['Items'],
  summary: "To Publish Item",
  body: {
    // Description of the parameters required to publish an item
    description: 'Publish Item Params',
    required: ['ItemId', 'TokenId', 'TransactionHash'],
    properties: {
      ItemId: {
        type: 'string',
        description: 'Item Id which needs to be published',
      },
      TokenId: {
        type: 'number',
        description: 'Generated Token Id after minting',
      },
      TransactionHash: {
        type: 'string',
        description: 'Generated TransactionHash after minting',
        pattern: '^(0x)?[0-9a-fA-F]{64}$',
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  },
};

// Schema for getting item List
exports.ItemListSchema = {
  tags: ['Items'],
  summary: "To List Item",
  body: {
    // Description of the parameters required to list an item
    description: 'List Item Params',
    required: ['ItemId', 'TransactionHash'],
    properties: {
      ItemId: {
        type: 'string',
        description: 'Item Id which needs to be listed',
      },
      TransactionHash: {
        type: 'string',
        description: 'Generated TransactionHash after listing',
        pattern: '^(0x)?[0-9a-fA-F]{64}$',
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  },
};

// Schema for adding item to cart
exports.AddtoCartSchema = {
  tags: ['Purchase Items'],
  summary: 'To Add Item to Cart',
  body: {
    // Description of the request body
    description: 'Add Item to Cart Params',
    required: ['ItemId', 'Edition'],
    properties: {
      // ItemId property
      ItemId: {
        type: 'string',
        description: 'Item Id Which Needs to be Added to Cart'
      },
      Edition: {
        type: 'number',
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        // Response status property (boolean)
        status: {
          type: 'boolean'
        },
        // Response message property (string)
        message: {
          type: 'string'
        }
      }
    }
  }
};

// Schema for adding an offer
exports.AddOfferSchema = {
  tags: ['Purchase Items'],
  summary: 'To Add Offer',
  body: {
    // Description of the request body
    description: 'Add Offer Params',
    required: ['ItemId', 'Price', 'Edition'],
    properties: {
      // ItemId property
      ItemId: {
        type: 'string',
        description: 'Item Id for Which Offer Needs to be Placed'
      },
      // Price property
      Price: {
        type: 'string',
        description: 'Offer Price'
      },
      Edition: {
        type: 'number',
      },
      // Message property
      Message: {
        type: 'string',
        description: 'Message'
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        // Response status property (boolean)
        status: {
          type: 'boolean'
        },
        // Response message property (string)
        message: {
          type: 'string'
        }
      }
    }
  }
};

// Schema for adding an offer
exports.AddPreOfferSchema = {
  tags: ['Purchase Items'],
  summary: 'To Add PreOffer',
  body: {
    // Description of the request body
    description: 'Add PreOffer Params',
    required: ['ItemId', 'Price', 'Edition'],
    properties: {
      // ItemId property
      ItemId: {
        type: 'string',
        description: 'Item Id for Which Offer Needs to be Placed'
      },
      // Price property
      Price: {
        type: 'string',
        description: 'Offer Price'
      },
      Edition: {
        type: 'number',
      },
      // Message property
      Message: {
        type: 'string',
        description: 'Message'
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        // Response status property (boolean)
        status: {
          type: 'boolean'
        },
        // Response message property (string)
        message: {
          type: 'string'
        }
      }
    }
  }
};

// Schema for adding a Bid
exports.AddBidSchema = {
  tags: ['Purchase Items'],
  summary: "To Add Bid",
  body: {
    // Description of the parameters required to add a bid
    description: 'Add Bid Params',
    required: ['ArtworkId', 'Edition', 'Price'],
    properties: {
      ArtworkId: {
        type: 'string',
        description: 'ArtworkId for which bid needs to be placed',
      },
      Edition: {
        type: 'number',
      },
      Price: {
        type: 'string',
        description: 'Bid Price',
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  },
};

// Schema for check a Bid
exports.CheckBidSchema = {
  tags: ['Purchase Items'],
  summary: "To Check Bid",
  body: {
    // Description of the parameters required to check a bid
    description: 'Check Bid Params',
    required: ['ArtworkId', 'Price'],
    properties: {
      ArtworkId: {
        type: 'string',
        description: 'ArtworkId for which bid needs to be checked',
      },
      Price: {
        type: 'string',
        description: 'Bid Price',
      },
      Edition: {
        type : 'number',
        description : 'Item edition'
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  },
};

// Schema for Remove Offer
exports.RemoveOfferSchema = {
  tags: ['Purchase Items'],
  summary: "To Remove Offer",
  body: {
    // Description of the parameters required to remove an offer
    description: 'Remove Offer Params',
    required: ['OfferId'],
    properties: {
      OfferId: {
        type: 'string',
        description: 'OfferId which needs to be removed',
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  },
};

// Schema for removing item from cart
exports.RemoveFromCartSchema = {
  tags: ['Purchase Items'],
  summary: 'To Remove Item from Cart',
  body: {
    // Description of the request body
    description: 'Remove Item from Cart Params',
    required: ['CartId'],
    properties: {
      // CartId property
      CartId: {
        type: 'string',
        description: 'Cart Id Which Needs to be Removed'
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        // Response status property (boolean)
        status: {
          type: 'boolean'
        },
        // Response message property (string)
        message: {
          type: 'string'
        }
      }
    }
  }
};

// Schema for getting item-based offers
exports.ItemBasedOfferSchema = {
  tags: ['Purchase Items'],
  summary: 'To Get Item Based Offer',
  body: {
    // Description of the request body
    description: 'Item Based Offer Params',
    required: ['ItemId', 'Edition'],
    properties: {
      // ItemId property
      ItemId: {
        type: 'string',
        description: 'ItemId Which Needs Offer List'
      },
      Edition:{
        type:'number'
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        // Response status property (boolean)
        status: {
          type: 'boolean'
        },
        // Response message property (string)
        message: {
          type: 'string'
        },
        // Response data property (array)
        data: {
          type: 'object',
          properties: {
            // Response status property (boolean)
            OfferInfo: {
              type: 'array'
            },
            // Response message property (string)
            BidInfo: {
              type: 'array'
            }
          }
        }
      }
    }
  }
};

// Schema for getting item-based bids
exports.ItemBasedBidSchema = {
  tags: ['Purchase Items'],
  summary: 'To Get Item Based Bids',
  body: {
    // Description of the request body
    description: 'Item Based Bid Params',
    required: ['ItemId'],
    properties: {
      // ItemId property
      ItemId: {
        type: 'string',
        description: 'ItemId Which Needs Bid List'
      },
      // Price property
      Price: {
        type: 'number',
        description: 'Item Purchase With Offer Price'
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        // Response status property (boolean)
        status: {
          type: 'boolean'
        },
        // Response message property (string)
        message: {
          type: 'string'
        },
        // Response data property (array)
        data: {
          type: 'array'
        }
      }
    }
  }
};

// Schema for getting Offer Status
exports.OfferStatusSchema = {
  tags: ['Purchase Items'],
  summary: "To Update Offer Status",
  body: {
    // Description of the parameters required to update offer status
    description: 'Update Offer Status Params',
    required: ['OfferId', 'Status'],
    properties: {
      OfferId: {
        type: 'string',
        description: 'OfferId for which status needs to be updated',
      },
      Status: {
        type: 'string',
        description: 'Accepted / Rejected',
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  },
};

// Schema for getting Offer Status
exports.PreOfferStatusSchema = {
  tags: ['Purchase Items'],
  summary: "To Update PreOffer Status",
  body: {
    // Description of the parameters required to update offer status
    description: 'Update PreOffer Status Params',
    required: ['OfferId', 'Status'],
    properties: {
      OfferId: {
        type: 'string',
        description: 'OfferId for which status needs to be updated',
      },
      Status: {
        type: 'string',
        description: 'Accepted / Rejected',
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  },
};

// Schema for getting AuctionStatus
exports.AuctionStatusSchema = {
  tags: ['Purchase Items'],
  summary: "To Update Auction Status",
  body: {
    // Description of the parameters required to update auction status
    description: 'Update Auction Status Params',
    required: ['ItemId', 'Status'],
    properties: {
      ItemId: {
        type: 'string',
        description: 'ItemId for which status needs to be updated',
      },
      Status: {
        type: 'string',
        description: 'Accepted / Rejected',
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  },
};

// Schema for getting Purchase Item
exports.PurchaseItemSchema = {
  tags: ['Purchase Items'],
  summary: "To Purchase Item",
  body: {
    // Description of the parameters required to purchase an item
    description: 'Purchase Item Params',
    required: ['ItemId'],
    properties: {
      ItemId: {
        type: 'string',
        description: 'ItemId which needs to be purchased',
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  },
};

// Schema for purchasing multiple items
exports.PurchaseMultipleItemSchema = {
  tags: ['Purchase Items'],
  summary: 'To Purchase Multiple Items',
  body: {
    // Description of the request body
    description: 'Purchase Multiple Item Params',
    required: ['ItemId'],
    properties: {
      // ItemId property
      ItemId: {
        type: 'string',
        description: 'ItemIds which need to be purchased'
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        // Response status property (boolean)
        status: {
          type: 'boolean'
        },
        // Response message property (string)
        message: {
          type: 'string'
        }
      }
    }
  }
};

// Schema for DHL Products
exports.DHLProductSchema = {
  tags:['DHL'],
  summary:"DHL Products",
  response:{
      200:{
          type: 'object',
          properties:{
              status:{type:'boolean'},
              message:{type:'string'},
              data:{
                type:'array',
          
            },              
          }
      }
  }
}

// Schema for DHL Rates

exports.DHLRatesSchema = {
  tags:['DHL'],
  summary:"DHL Rates",
  response:{
      200:{
          type: 'object',
          properties:{
              status:{type:'boolean'},
              message:{type:'string'},
              data:{
                type:'array',          
            },              
          }
      }
  }
}

exports.DHLAddressValidateSchma = {
  tags:['DHL'],
  summary:"DHL Address",
  response:{
      200:{
          type: 'object',
          properties:{
              status:{type:'boolean'},
              message:{type:'string'},
              data:{
                type:'array',
          
            },              
          }
      }
  }
}

exports.DHLCreateShippmentSchma = {
  tags:['DHL'],
  summary:"DHL shippment",
  response:{
      200:{
          type: 'object',
          properties:{
              status:{type:'boolean'},
              message:{type:'string'},
              data:{
                type:'array',
          
            },              
          }
      }
  }
}