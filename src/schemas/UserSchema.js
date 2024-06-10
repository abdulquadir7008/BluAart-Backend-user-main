/* Schema For to Get Country List */
exports.CountryListSchema = {
  tags: ['User'],
  summary: "Get Countries List",
  response: {
    200: {
      type: 'object',
      properties: {
        status: {
          type: 'boolean'
        },
        info: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: {
                type: 'string'
              },
              code: {
                type: 'string'
              },
              dial_code: {
                type: 'string'
              },
              flag: {
                type: 'string'
              }
            },
            required: ['name', 'code', 'dial_code', 'flag']
          }
        }
      },
      required: ['status', 'info']
    }
  }
};

exports.GetBannerDetails = {
  tags: ["Banner"],
  summary: "To Get Banner Details",
  response: {
    200: {
      type: "object",
      properties: {
        status: { type: "boolean" },
        Info: { type: "array" },
      },
    },
    500: {
      type: "object",
      properties: {
        status: { type: "boolean" },
        info: { type: "string" },
        error: { type: "string" },
      },
    },
  },
};

exports.GetMetamaskDetails = {
  tags: ["Metamask"],
  summary: "To Get Metamask Details",
  response: {
    200: {
      type: "object",
      properties: {
        status: { type: "boolean" },
        Info: { type: "array" },
      },
    },
    500: {
      type: "object",
      properties: {
        status: { type: "boolean" },
        info: { type: "string" },
        error: { type: "string" },
      },
    },
  },
};
exports.GetInnerBannerDetails = {
  tags: ["InnerBanner"],
  summary: "To Get InnerBanner Details",
  response: {
    200: {
      type: "object",
      properties: {
        status: { type: "boolean" },
        Info: { type: "array" },
      },
    },
    500: {
      type: "object",
      properties: {
        status: { type: "boolean" },
        info: { type: "string" },
        error: { type: "string" },
      },
    },
  },
};

/* Schema For to Get Landing Page Details */
exports.LandingPageSchema = {
  tags: ['User'],
  summary: "Get Landing Page Details",
  response: {
    200: {
      type: 'object',
      properties: {
        status: {
          type: 'boolean'
        },
        info: {
          type: 'array',
        },
        artistinfo:{
          type: 'array'
        }
      },
      required: ['status', 'info']
    }
  }
};

exports.AboutusPageSchema = {
  tags: ['User'],
  summary: "Get Aboutus Details",
  response: {
    200: {
      type: 'object',
      properties: {
        status: {
          type: 'boolean'
        },
        info: {
          type: 'array',
        },
        teaminfo:{
          type:"array"
        }
      },
    }
  }
};

exports.EventsPageSchema = {
  tags: ['User'],
  summary: "Get Events Details",
  response: {
    200: {
      type: 'object',
      properties: {
        status: {
          type: 'boolean'
        },
        info: {
          type: 'array',
        }
      },
    }
  }
};

exports.FeaturesPageSchema = {
  tags: ['User'],
  summary: "Get Features Details",
  response: {
    200: {
      type: 'object',
      properties: {
        status: {
          type: 'boolean'
        },
        info: {
          type: 'array',
        }
      },
    }
  }
};

/* Schema For to Get User Role */
exports.UserRoleInfoSchema = {
  tags: ['User'],
  summary: "Get User Role Info",
  body: {
    description: 'UserRole Info params',
    type: 'object',
    required: ['Role'],
    properties: {
      Role: {
        type: 'string',
        description: 'User Role (Artist, Buyer, Collector)'
      }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: {
          type: 'boolean'
        },
        info: {
          type: 'object',
          properties: {
            Agreement: {
              type: 'string'
            }
          },
          required: ['Agreement']
        }
      },
      required: ['status', 'info']
    }
  }
};

exports.CSVSampleSchema = {
  tags: ['ArtItems'],
  summary: "Get CSV Samples",
  body: {
    description: 'Get CSV Samples Info params',
    type: 'object',
    required: ['Type'],
    properties: {
      Type: {
        type: 'string',
        enum: ['Artwork', 'Artproduct'],
        description: 'Artwork / Artproduct'
      }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: {
          type: 'boolean'
        },
        info: {
          type: 'object',
          properties: {
            Sample: {
              type: 'string'
            }
          },
        }
      },
    }
  }
};

/* Schema For to Get Settings */
exports.SettingSchema = {
  tags: ['User'],
  summary: "Get Current System Settings Info",
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        info: {
          type: "array"
        },
      }
    }
  }
};

/* Schema For to Get Network Info */
exports.NetworkInfoSchema = {
  tags: ['User'],
  summary: "To Get Network Info",
  body: {
    description: 'Network Info params',
    type: 'object',
    required: ['Currency'],
    properties: {
      Currency: {
        type: 'string',
        description: 'Currency Symbol For Which Need Network Info (ETH, MATIC)'
      }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        info: {
          type: "object",
          properties: {
            "Name": { type: "string" }, // Network name
            "Currency": { type: "string" }, // Currency symbol
            "RpcUrl": { type: "string" }, // RPC URL
            "ChainID": { type: "number" }, // Chain ID
            "BlockExplorer": { type: "string" }, // Block explorer URL
            "Symbol": { type: "string" }, // Network symbol
            "AdminAddress": { type: "string" }, // Admin address
            "FeeAddress": { type: "string" }, // Fee address
            "FactoryContract": { type: "string" }, // Factory contract address
            "MultiContract": { type: "string" }, // Multi contract address
            "FactoryAbiArray": { type: "string" }, // Factory contract ABI array
            "MultiAbiArray": { type: "string" }, // Multi contract ABI array
            "AdminCommission": { type: "number" } // Admin commission
          }
        },
      }
    }
  }
};

exports.PageInfoSchema = {
  tags: ['User'],
  summary: "To Get Page Info",
  body: {
    description: 'Page Info params',
    type: 'object',
    required: ['Page'],
    properties: {
      Page: {
        type: 'string',
        description: 'Page For Which Need Info (Terms, Privacy)'
      }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        info: {
          type: "string"
        
        },
      }
    }
  }
};

exports.NewsInfoSchema = {
  tags: ['News'],
  summary: "To Get News Info",
  body: {
    description: 'News Info params',
    type: 'object',
    required: ['NewsId'],
    properties: {
      NewsId: {
        type: 'string',
      }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        info: {
          type: "array"
        
        },
      }
    }
  }
};

/* Schema For to Get Media Limit Info */
exports.MediaLimitInfoSchema = {
  tags: ['User'],
  summary: "To Get Media Limit Info",
  body: {
    description: 'Media Limit Info params',
    type: 'object',
    required: ['Type'],
    properties: {
      Type: {
        type: 'string',
        description: 'Type For Which Need Medium Limit Info (Artwork)'
      }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        info: {
          type: "object",
          properties: {
            "Width": { type: "number" }, 
            "Height": { type: "number" }, 
            "Size": { type: "number" }, 
          }
        },
      }
    }
  }
};

/* Register API Schema */
exports.RegisterSchema = {
  tags: ['User'],
  summary: "To Register New User",
  body: {
    description: 'Register params',
    type: 'object',
    required: ['UserName', 'Email', 'Password', 'Terms', 'Subscription'],
    properties: {
      UserName: {
        type: 'string',
        description: 'User Name'
      },
      Email: {
        type: 'string',
        format: 'email',
        description: 'Email ID'
      },
      Password: {
        type: 'string',
        description: 'Password length should be at least 10 with a combination of letters and numbers'
      },
      Terms: {
        type: 'number',
        description: 'Terms Accept 1 or 0'
      },
      Subscription: {
        type: 'number',
        description: 'If Subscribed 1 or 0'
      },
      Recaptcha: {
        type: 'string',
        description: 'Recaptcha Token'
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        message: { type: 'string' },
        response: { type: 'string' }
      }
    }
  }
};

/* Resend Register OTP API Schema */
exports.ResendRegisterOTPSchema = {
  tags: ['User'],
  summary: "To Resend OTP",
  body: {
    description: 'Resend OTP Params',
    type: 'object',
    required: ['Token'],
    properties: {
      Token: {
        type: 'string',
        description: 'Auth Token'
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        message: { type: 'string' },
        response: { type: 'string' }
      }
    }
  }
};

/* Register OTP Confirmation Schema */
exports.ConfirmationSchema = {
  tags: ['User'],
  summary: "To Confirm Registration",
  body: {
    description: 'Confirm Registration params',
    type: 'object',
    required: ['Token', 'OTP'],
    properties: {
      Token: {
        type: 'string',
      },
      OTP: {
        type: 'number',
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        message: { type: 'string' },
        response: { type: 'string' }
      }
    }
  }
};

/* Select Role Schema */
exports.RoleSelectSchema = {
  tags: ['User'],
  summary: "To Select Role",
  body: {
    description: 'Select Role params',
    type: 'object',
    required: ['Auth', 'Role'],
    properties: {
      Auth: {
        type: 'string',
        description: 'Auth Token'
      },
      Role: {
        type: 'string',
        description: 'User Role (Artist, Buyer, Collector)'
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        token: { type: 'string' },
        response: { type: 'string' }
      }
    }
  }
};

/* Update Address Schema */
exports.UpdateAddressSchema = {
  tags: ['User'],
  summary: "To Update Address",
  body: {
    description: 'Update Address Params',
    type: 'object',
    required: ['Auth', 'Address1', 'Address2', 'State', 'Pincode', 'City', 'CountryCode', 'MobileNo'],
    properties: {
      Auth: {
        type: 'string',
        description: 'Auth Token'
      },
      Address1: {
        type: 'string',
        description: 'Address Line 1'
      },
      Address2: {
        type: 'string',
        description: 'Address Line 2'
      },
      City: {
        type: 'string',
        description: 'City'
      },
      State: {
        type: 'string',
        description: 'State'
      },
      Pincode: {
        type: 'string',
        description: 'Pincode'
      },
      CountryCode: {
        type: 'string',
        description: 'Country Code'
      },
      MobileNo: {
        type: 'number',
        description: 'Mobile Number'
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        token: { type: 'string' },
        response: { type: 'string' }
      }
    }
  }
};

//To Get Role Based User
exports.RoleBasedUserSchema = {
  tags: ['User'],
  summary: "To Get Role Based User",
  body: {
    description: 'Get Role Based Users params',
    type: 'object',
    required: ['Role'],
    properties: {
      Role: {
        type: 'string',
        description: 'User Role (Artist, Buyer, Collector)'
      },
      Style: {
        type: 'string',
        description: 'User Style (optional)'
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        info: {
          type: 'array'
        },
      }
    }
  }
}

exports.LabelBasedUserSchema = {
  tags: ['User'],
  summary: "To Get Label Based User",
  body: {
    description: 'Get Label Based Users params',
    type: 'object',
    required: ['Label'],
    properties: {
      Label: {
        type: 'string'
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        info: {
          type: 'array'
        },
        lableName : { type : 'string' }
      }
    }
  }
}

/* Login API Schema */
exports.LoginSchema = {
  tags: ['User'],
  summary: "To Login",
  body: {
    description: 'Login params',
    type: 'object',
    required: ['Email', 'Password'],
    properties: {
      Email: {
        type: 'string',
        format: 'email',
        description: 'Email ID'
      },
      Password: {
        type: 'string',
        description: 'Password'
      },
      Recaptcha: {
        type: 'string',
        description: 'Recaptcha'
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        role: {type:'string'},
        token: { type: 'string' },
        Steps: { type: 'string' },
        UserId: { type: 'string' },
        UserName: { type: 'string' },
        response: { type: 'string' }
      }
    }
  }
}

/* Login Verify 2FA Schema */
exports.Verify2FASchema = {
  tags: ['User'],
  summary: "To Verify 2FA",
  body: {
    description: 'Verify 2FA params',
    type: 'object',
    required: ['Token', 'OTP'],
    properties: {
      Token: {
        type: 'string',
        description: 'Token'
      },
      OTP: {
        type: 'number',
        description: 'OTP'
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        token: { type: 'string' },
        Steps: { type: 'string' },
        role: {type: 'string'},
        UserId: { type: 'string' },
        UserName: { type: 'string' },
        response: { type: 'string' }
      }
    }
  }
}

/* Forgot Password Schema */
exports.ForgotPasswordSchema = {
  tags: ['User'],
  summary: "Forgot Password",
  body: {
    description: 'Forgot Password Params',
    type: 'object',
    required: ['Email', 'Recaptcha'],
    properties: {
      Email: {
        type: 'string',
        format: 'email',
        description: 'Email ID of the Account'
      },
      Recaptcha: {
        type: 'string',
        description: 'Recaptcha Token'
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
}

/* Reset Password Schema */
exports.ResetPasswordSchema = {
  tags: ['User'],
  summary: "Reset Password",
  body: {
    description: 'Reset Password Params',
    type: 'object',
    required: ['ResetToken', 'NewPassword'],
    properties: {
      ResetToken: {
        type: 'string'
      },
      NewPassword: {
        type: 'string'
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
}

/* Connect Wallet API Schema */
exports.ConnectWalletSchema = {
  tags: ['User'],
  summary: "To Connect Wallet",
  body: {
    description: 'Connect Wallet params',
    type: 'object',
    required: ['WalletAddress'],
    properties: {
      WalletAddress: {
        type: 'string',
        description: "Ethereum Wallet Address",
        pattern: "^0x[0-9a-fA-F]{40}$"
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        token: { type: 'string' },
        role: { type: 'string' },
        info: { type: 'string' }
      }
    }
  }
}

/* Agreement Accept Schema */
exports.AgreementAcceptSchema = {
  tags: ['User'],
  summary: "To Accept Agreement",
  body: {
    description: 'Agreement Accept Params',
    type: 'object',
    required: ['Auth', 'Agreement'],
    properties: {
      Auth: {
        type: 'string',
        description: 'Auth Token'
      },
      Agreement: {
        type: 'number',
        description: 'Agreement Acceptance'
      }

    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        token: { type: 'string' },
        response: { type: 'string' }
      }
    }
  }
}

/* Profile Info Schema */
exports.ProfileSchema = {
  tags: ['User'],
  summary: "Get User's Info",
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        info: {
          type: "array"
        },
      }
    }
  }
};

// Schema for getting user profile views by month
exports.ProfileViewbyMonthSchema = {
  tags: ['Dashboard'],
  summary: "Get User Profile View By Month",
  body: {
    description: 'Filter Params',
    type: 'object',
    required: ['Period'],
    properties: {
      Period: {
        type: 'number',
        description: 'Period for which info is needed'
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        info: {
          type: "array"
        },
      }
    }
  }
};

// Schema for getting user profile views by country
exports.ProfileViewbyCountrySchema = {
  tags: ['Dashboard'],
  summary: "Get User Profile View By Country",
  body: {
    description: 'Filter Params',
    type: 'object',
    required: ['Period'],
    properties: {
      Period: {
        type: 'number',
        description: 'Period for which info is needed'
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        info: {
          type: "array"
        },
      }
    }
  }
};

// Schema for getting Artist details
exports.ArtistSchema = {
  tags: ['User'],
  summary: "Get Artist's Info",
  body: {
    description: 'Artist Info Params',
    type: 'object',
    required: ['UserId'],
    properties: {
      UserId: {
        type: 'string',
        description: 'User ID for which info is needed'
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        userdata: {
          type: "array"
        },
        itemdata: {
          type: "array"
        }
      }
    }
  }
};


//Add card schema
exports.AddCardSchema = {
  tags: ['Card'],
  summary: "Add Card",
  body: {
    description: "Add Card",
    type: 'object',
    properties: {
      CardNumber: { type: "string" },
      Cvv: { type: "string" },
      Description: { type: "string" },
      Expiry: { type: "string" },
      BillingDetails: {
        type: 'object',
        properties: {
          CardholderName: { type: 'string' },
          AddressLine1: { type: 'string' },
          AddressLine2: { type: 'string' },
          PostalCode: { type: 'string' },
          City: { type: 'string' },
          District: { type: 'string' },
          CountryCode: { type: 'string' },
          Phone: { type: 'string' },
          Email: { type: 'string' },
        },
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        info: { type: 'string' }
      }
    },
    403: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        info: { type: 'string' }
      }
    },
    500: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        message: { type: 'string' },
        error: { type: 'string' }
      }
    }
  }
}

//Edit card schema
exports.EditCardSchema = {
  tags: ['Card'],
  summary: "Edit Card",
  body: {
    description: "Edit Card",
    type: 'object',
    required: ['Id'],
    properties: {
      CardNumber: { type: "string" },
      Cvv: { type: "string" },
      Description: { type: "string" },
      Expiry: { type: "string" },
      BillingDetails: {
        type: 'object',
        properties: {
          CardholderName: { type: 'string' },
          AddressLine1: { type: 'string' },
          AddressLine2: { type: 'string' },
          PostalCode: { type: 'string' },
          City: { type: 'string' },
          District: { type: 'string' },
          CountryCode: { type: 'string' },
          Phone: { type: 'string' },
          Email: { type: 'string' },
        },
      },
      Id: {
        type: "string"
      }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        info: { type: 'string' }
      }
    },
    403: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        info: { type: 'string' }
      }
    },
    500: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        message: { type: 'string' },
        error: { type: 'string' }
      }
    }
  }
}

//Get one card schema
exports.GetOneCardSchema = {
  tags: ['Card'],
  summary: "Get Single Card",
  body: {
    description: "Get Single Card",
    type: 'object',
    required: ['Id'],
    properties: {
      Id: {
        type: "string"
      }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        info: {
          type: 'object',
          properties: {
            CardNumber: { type: 'string' },
            Cvv: { type: 'string' },
            Description: { type: 'string' },
            Expiry: { type: 'string' },
            BillingDetails: {
              type: 'object',
              properties: {
                CardholderName: { type: 'string' },
                AddressLine1: { type: 'string' },
                AddressLine2: { type: 'string' },
                PostalCode: { type: 'string' },
                City: { type: 'string' },
                District: { type: 'string' },
                CountryCode: { type: 'string' },
                Phone: { type: 'string' },
                Email: { type: 'string' },
              },
            },
          }
        }
      }
    },
    403: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        info: { type: 'string' }
      }
    },
    500: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        message: { type: 'string' },
        error: { type: 'string' }
      }
    }
  }
};

//Get card List schema
exports.CardListSchema = {
  tags: ['Card'],
  summary: "Get Card List",
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        info: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              CardNumber: { type: 'string' },
              Cvv: { type: 'string' },
              Description: { type: 'string' },
              Expiry: { type: 'string' },
              BillingDetails: {
                type: 'object',
                properties: {
                  CardholderName: { type: 'string' },
                  AddressLine1: { type: 'string' },
                  AddressLine2: { type: 'string' },
                  PostalCode: { type: 'string' },
                  City: { type: 'string' },
                  District: { type: 'string' },
                  CountryCode: { type: 'string' },
                  Phone: { type: 'string' },
                  Email: { type: 'string' },
                },
              },
            }
          }
        }
      }
    },
    403: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        info: { type: 'string' }
      }
    },
    500: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        message: { type: 'string' },
        error: { type: 'string' }
      }
    }
  }
};

// Delete Card Schema
exports.DeleteCardSchema = {
  tags: ['Card'],
  summary: "Delete Card",
  body: {
    description: "Delete Card",
    type: 'object',
    required: ['Id'],
    properties: {
      Id: {
        type: "string"
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        info: { type: 'string' }
      }
    }
  }
}

// Schema for adding an art collection
exports.AddArtcollectionSchema = {
  tags: ['Artcollection'],
  summary: "Add Artcollection",
  body: {
    description: "Add Artcollection",
    type: 'object',
    properties: {
      Title: { type: "string" },     // Title of the art collection
      Year: { type: "string" },      // Year of creation
      Location: { type: "string" },  // Location of the art collection
      OwnerId: { type: "string" }    // ID of the owner
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' }, // Status indicating success or failure
        info: { type: 'string' }     // Additional information
      }
    },
    403: {
      type: 'object',
      properties: {
        status: { type: 'boolean' }, // Status indicating access denied
        info: { type: 'string' }     // Error message
      }
    },
    500: {
      type: 'object',
      properties: {
        status: { type: 'boolean' }, // Status indicating server error
        message: { type: 'string' }, // Error message
        error: { type: 'string' }    // Error details
      }
    }
  }
}

// Schema for editing an art collection
exports.EditArtcollectionSchema = {
  tags: ['Artcollection'],
  summary: "Edit Artcollection",
  body: {
    description: "Edit Artcollection",
    type: 'object',
    required: ['Id'],  // ID of the art collection to be edited
    properties: {
      Title: { type: "string" },     // Updated title
      Year: { type: "string" },      // Updated year
      Location: { type: "string" },  // Updated location
      OwnerId: { type: "string" },   // Updated owner ID
      Id: { type: "string" }         // ID of the art collection to be edited
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' }, // Status indicating success or failure
        info: { type: 'string' }     // Additional information
      }
    },
    403: {
      type: 'object',
      properties: {
        status: { type: 'boolean' }, // Status indicating access denied
        info: { type: 'string' }     // Error message
      }
    },
    500: {
      type: 'object',
      properties: {
        status: { type: 'boolean' }, // Status indicating server error
        message: { type: 'string' }, // Error message
        error: { type: 'string' }    // Error details
      }
    }
  }
}

// Schema for getting a single art collection
exports.GetOneArtcollectionSchema = {
  tags: ['Artcollection'],
  summary: "Get Single Artcollection",
  body: {
    description: "Get Single Artcollection",
    type: 'object',
    required: ['Id'],  // ID of the art collection to retrieve
    properties: {
      Id: { type: "string" }  // ID of the art collection to retrieve
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },  // Status indicating success or failure
        info: {
          type: 'object',
          properties: {
            Title: { type: 'string' },    // Title of the art collection
            Year: { type: 'string' },     // Year of creation
            Location: { type: 'string' }, // Location of the art collection
            OwnerId: { type: 'string' }   // ID of the owner
          }
        }
      }
    },
    403: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },  // Status indicating access denied
        info: { type: 'string' }      // Error message
      }
    },
    500: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },  // Status indicating server error
        message: { type: 'string' },  // Error message
        error: { type: 'string' }     // Error details
      }
    }
  }
};

// Schema for getting a list of art collections
exports.ArtcollectionListSchema = {
  tags: ['Artcollection'],
  summary: "Get Artcollection List",
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },  // Status indicating success or failure
        info: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              Title: { type: 'string' },    // Title of the art collection
              Year: { type: 'string' },     // Year of creation
              Location: { type: 'string' }, // Location of the art collection
              OwnerId: { type: 'string' }   // ID of the owner
            }
          }
        }
      }
    },
    403: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },  // Status indicating access denied
        info: { type: 'string' }      // Error message
      }
    },
    500: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },  // Status indicating server error
        message: { type: 'string' },  // Error message
        error: { type: 'string' }     // Error details
      }
    }
  }
};

//Schema for deleting an art collection.
exports.DeleteArtcollectionSchema = {
  tags: ['Artcollection'],
  summary: "Delete Artcollection",
  body: {
    description: "Delete Artcollection",
    type: 'object',
    required: ['Id'],  // ID of the art collection to delete
    properties: {
      Id: {
        type: "string"
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },  // Status indicating success or failure
        info: { type: 'string' }      // Information message
      }
    }
  }
};

// Schema for adding a bio
exports.AddBioSchema = {
  tags: ['Bio'],
  summary: "Add Bio",
  body: {
    description: "Add Bio",
    type: 'object',
    required: ['Overview'],
    properties: {
      Overview: {
        type: "string",
        description: "OverView of Length 100 - 1000",
        minLength: 100,
        maxLength: 1000
      },
      Inspired: {
        type: "string"
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
}

// Schema for getting a bio
exports.GetBioSchema = {
  tags: ['Bio'],
  summary: "Get Bio",
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        info: {
          type: 'object',
          properties: {
            Overview: { type: 'string' },
            Inspired: { type: 'string' }
          }
        }
      }
    }
  }
}

// Schema for deleting a bio
exports.DeleteBioSchema = {
  tags: ['Bio'],
  summary: "Delete Bio",
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        message: { type: 'string' }
      }
    }
  }
}

// Add Testimonial Schema
exports.AddTestimonialSchema = {
  tags: ['Testimonial'],
  summary: "Add Testimonial",
  body: {
    description: "Add Testimonial",
    type: 'object',
    required: ['Provider', 'Description'],
    properties: {
      Provider: {
        type: "string",
        description: "Provider of Length 3 - 20",
        minLength: 3,
        maxLength: 20
      },
      Description: {
        type: "string",
        description: "Description of Length 10 - 2000",
        minLength: 10,
        maxLength: 2000
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
}

// Get Testimonial Schema
exports.GetTestimonialSchema = {
  tags: ['Testimonial'],
  summary: "Get Testimonial",
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        info: {
          type: 'array'
        }
      }
    }
  }
}

// Get One Testimonial Schema
exports.GetOneTestimonialSchema = {
  tags: ['Testimonial'],
  summary: "Get One Testimonial",
  body: {
    description: "Get One Testimonial",
    type: 'object',
    required: ['Id'],
    properties: {
      Id: {
        type: "string"
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        message: { type: 'string' },
        Info: {
          type: 'object',
          properties: {
            Provider: { type: 'string' },
            Description: { type: 'string' },
          }
        }
      }
    }
  }
}

// Edit Testimonial Schema
exports.EditTestimonialSchema = {
  tags: ['Testimonial'],
  summary: "Edit Testimonial",
  body: {
    description: "Edit Testimonial",
    type: 'object',
    required: ['Provider', 'Description', 'Id'],
    properties: {
      Id: {
        type: "string",
      },
      Provider: {
        type: "string",
        description: "Provider of Length 3 - 20",
        minLength: 3,
        maxLength: 20
      },
      Description: {
        type: "string",
        description: "Description of Length 10 - 2000",
        minLength: 10,
        maxLength: 2000
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
}

// Delete Testimonial Schema
exports.DeleteTestimonialSchema = {
  tags: ['Testimonial'],
  summary: "Delete Testimonial",
  body: {
    description: "Delete Testimonial",
    type: 'object',
    required: ['Id'],
    properties: {
      Id: {
        type: "string",
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
}

// Add Exhibition Schema
exports.AddExhibitionSchema = {
  tags: ['Exhibition'],
  summary: "Add Exhibition",
  body: {
    description: "Add Exhibition",
    type: 'object',
    required: ['Title', 'Type', 'Year', 'Institude', 'Location', 'Image'],
    properties: {
      Title: {
        type: "string",
      },
      Type: {
        type: "string",
      },
      Year: {
        type: "number",
      },
      Institude: {
        type: 'string'
      },
      Location: {
        type: 'string'
      },
      Image: {
        type: 'string',
       
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
}

// Edit Exhibition Schema
exports.EditExhibitionSchema = {
  tags: ['Exhibition'],
  summary: "Edit Exhibition",
  body: {
    description: "Edit Exhibition",
    type: 'object',
    required: ['Id'],
    properties: {
      Id: {
        type: "string",
      },
      Title: {
        type: "string",
      },
      Type: {
        type: "string",
      },
      Year: {
        type: "number",
      },
      Institude: {
        type: 'string'
      },
      Location: {
        type: 'string'
      },
      Image: {
        type: 'string',
       
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
}

// Get One Exhibition Schema
exports.GetOneExhibitionSchema = {
  tags: ['Exhibition'],
  summary: "Get One Exhibition",
  body: {
    description: "Get One Exhibition",
    type: 'object',
    required: ['Id'],
    properties: {
      Id: {
        type: "string"
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        message: { type: 'string' },
        Info: {
          type: 'object',
          properties: {
            Title: { type: 'string' },
            Type: { type: 'string' },
            Year: { type: 'number' },
            Institude: { type: 'string' },
            Location: { type: 'string' },
            Image: {
              type: 'string',
           
            }
          }
        }
      }
    }
  }
}

// Get Exhibitions Schema
exports.GetExhibitionSchema = {
  tags: ['Exhibition'],
  summary: "Get Exhibitions",
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        info: {
          type: 'array'
        }
      }
    }
  }
}

// Delete Exhibition Schema
exports.DeleteExhibitionSchema = {
  tags: ['Exhibition'],
  summary: "Delete Exhibition",
  body: {
    description: "Delete Exhibition",
    type: 'object',
    required: ['Id'],
    properties: {
      Id: {
        type: "string",
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
}

exports.AddMediasSchema = {
  tags: ['Media & Publications'],
  summary: "Add Media & Publications",
  body: {
    description: "Add Media & Publications",
    type: 'object',
    required: ['Title', 'Type', 'Year', 'Author', 'Published', 'Image', 'Link', 'Description'],
    properties: {
      Title: {
        type: "string",
      },
      Description: {
        type: "string",
        minLength: 100,
        maxLength: 1000
      },
      Type: {
        type: "string",
      },
      Year: {
        type: "number",
      },
      Author: {
        type: 'string'
      },
      Published: {
        type: 'string'
      },
      Link: {
        type: 'string'
      },
      Image: {
        type: 'string',
        
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
}

exports.EditMediasSchema = {
  tags: ['Media & Publications'],
  summary: "Edit Media & Publications",
  body: {
    description: "Edit Media & Publications",
    type: 'object',
    required: ['Id'],
    properties: {
      Title: {
        type: "string",
      },
      Description: {
        type: "string",
        minLength: 100,
        maxLength: 1000
      },
      Id: {
        type: "string",
      },
      Type: {
        type: "string",
      },
      Year: {
        type: "number",
      },
      Author: {
        type: 'string'
      },
      Published: {
        type: 'string'
      },
      Link: {
        type: 'string'
      },
      Image: {
        type: 'string',
      
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
}

// Get One Media Schema
exports.GetOneMediaSchema = {
  tags: ['Media & Publications'],
  summary: "Get One Media & Publications",
  body: {
    description: "Get One Media & Publications",
    type: 'object',
    required: ['Id'],
    properties: {
      Id: {
        type: "string"
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        message: { type: 'string' },
        Info: {
          type: 'object',
          properties: {
            Title: { type: 'string' },
            Description: { type: 'string' },
            Link: { type: 'string' },
            Author: { type: 'string' },
            Published: { type: 'string' },
            Type: { type: 'string' },
            Year: { type: 'number' },
            Location: { type: 'string' },
            Image: {
              type: 'string',
           
            }
          }
        }
      }
    }
  }
}

//Get Media Schema
exports.GetMediaSchema = {
  tags: ['Media & Publications'],
  summary: "Get Media & Publications",
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        info: {
          type: 'array'
        }
      }
    }
  }
}

exports.GetNotificationSchema = {
  tags: ['Users'],
  summary: "Get Notifications",
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        info: {
          type: 'array'
        }
      }
    }
  }
}

// Delete Media Schema
exports.DeleteMediaSchema = {
  tags: ['Media & Publications'],
  summary: "Delete Media & Publications",
  body: {
    description: "Delete Media & Publications",
    type: 'object',
    required: ['Id'],
    properties: {
      Id: {
        type: "string",
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
}

// Add Address Schema
exports.AddAddressSchema = {
  tags: ['Address'],
  summary: "Add Address",
  body: {
    description: "Add Address",
    type: 'object',
    required: ['CityName', 'CountryCode', 'PostalCode', 'AddressLine1', 'CountryName' ,'State', 'PrimaryAddress', 'MobileNo'],
    properties: {
      MobileNo: {
        type: 'number',
        description: 'Mobile Number'
      },
      CityName: {
        type: "string",
        minLength: 1,
        maxLength: 100
      },
      CountryCode: {
        type: "string",
      },
      PostalCode: {
        type: "number",
        minLength: 1,
        maxLength: 20
      },
      AddressLine1: {
        type: "string",
        minLength: 1,
        maxLength: 100
      },
      AddressLine2: {
        type: "string"
      },
      CountryName: {
        type: "string",
        minLength: 1,
        maxLength: 100
      },
      State:{
        type:"string"
      },
      PrimaryAddress:{
        type: "boolean",
        default: false
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        info: { type: 'string' }
      }
    }
  }
}

// Edit Address Schema
exports.EditAddressSchema = {
  tags: ['Address'],
  summary: "Edit Address",
  body: {
    description: "Edit Address",
    type: 'object',
    required: ['Id', 'CityName', 'CountryCode', 'PostalCode', 'AddressLine1', 'CountryName' ,'State', 'PrimaryAddress', 'MobileNo'],
    properties: {
      MobileNo:{
        type:'number'
      },
      Id: {
        type: "string"
      },
      CityName: {
        type: "string",
        minLength: 1,
        maxLength: 100
      },
      CountryCode: {
        type: "string",
      },
      PostalCode: {
        type: "number",
        minLength: 1,
        maxLength: 20
      },
      AddressLine1: {
        type: "string",
        minLength: 1,
        maxLength: 100
      },
      CountryName: {
        type: "string",
        minLength: 1,
        maxLength: 100
      },
      State:{
        type: "string"
      },
      PrimaryAddress:{
        type:'boolean'
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        info: { type: 'string' }
      }
    }
  }
}

// Get One Address Schema
exports.GetOneAddressSchema = {
  tags: ['Address'],
  summary: "Get One Address",
  body: {
    description: "Get One Address",
    type: 'object',
    required: ['Id'],
    properties: {
      Id: {
        type: "string"
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        info: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            CityName: { type: 'string' },
            CountryCode: { type: 'string' },
            PostalCode: { type: 'number' },
            AddressLine1: { type: 'string' },
            AddressLine2: {type: 'string'},
            CountryName: { type: 'string' },
            State: { type: 'string'},
            MobileNo: {type: 'number'},
            PrimaryAddress: {type: 'boolean'}
          }
        }
      }
    }
  }
}

// Get List Address Schema
exports.AddressListSchema = {
  tags: ['Address'],
  summary: "Get List Address",
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        info: {
          type: 'array'
        }
      }
    }
  }
}

// Delete Address Schema
exports.DeleteAddressSchema = {
  tags: ['Address'],
  summary: "Delete Address",
  body: {
    description: "Delete Address",
    type: 'object',
    required: ['Id'],
    properties: {
      Id: {
        type: "string"
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        info: { type: 'string' }
      }
    }
  }
}

// Change Password Schema
exports.ChangePasswordSchema = {
  tags: ['User'],
  summary: "To Change Password",
  body: {
    description: 'Change Password Params',
    type: 'object',
    required: ['NewPassword'],
    properties: {
      NewPassword: {
        type: 'string',
        description: 'Password length should be atleast 10 with combination of letters and numbers'
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
}

// Enable or Disable 2FA Schema
exports.EnableDisable2FASchema = {
  tags: ['User'],
  summary: "To Enable / Disable 2FA",
  body: {
    description: 'Enable / Disable 2FA Params',
    type: 'object',
    required: ['Enable2FA'],
    properties: {
      Enable2FA: {
        type: 'boolean',
        description: '2FA Status'
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
}

//Common Thumb Image Update
exports.CommonThumbUpdateSchema = {
  tags: ['User'], // Tags for categorizing the schema
  summary: "To Update Image", // Summary of the schema's purpose
  body: {
    description: 'Image Update Params', // Description of the request body
    required: ['Image', 'Type'], // Required properties in the request body
    properties: {
      Type: {
        type: 'string',
        description: 'Type for which image upload' // Description of the 'Type' property
      },
      Image: {
        type: 'string',
        description: 'The Image should contain binary data such as a file upload' // Description of the 'Image' property
      }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        message: { type: 'string' },
        Image: {
          type: 'string',
        
        }
      }
    }
  }
};

/* Update Profile Picture */
exports.ProfileImageUpdateSchema = {
  tags: ['User'],
  summary: "To Update Profile Image",
  body: {
    description: 'Profile Image Update Params',
    required: ['ProfileImage'],
    properties: {
      ProfileImage: {
        type: 'string',
        description: 'The Profile Image should contain binary data such as a file upload'
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
}

exports.UpdateProfileSchema = {
  tags: ['User'],
  summary: "To Update Profile Schema",
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        message: { type: 'string' }
      }
    }
  }
}

/* Kyc Update Schema */
exports.KycUpdateSchema = {
  tags: ['User'],
  summary: "To Update KYC",
  body: {
    description: 'KYC Update Params',
    required: ['Type', 'FrontProof', 'BackProof'],
    properties: {
      Type: {
        type: 'string',
        description: 'Document Type (Passport / Driver License / National Id Card)'
      },
      FrontProof: {
        type: 'string',
        description: 'The FrontProof should contain binary data such as a file upload'
      },
      BackProof: {
        type: 'string',
        description: 'The BackProof should contain binary data such as a file upload'
      }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        message: { type: 'string' },
        token: { type: 'string' },
        role: { type: 'string' }
      }
    }
  }
};

//Google Register Schema
exports.GoogleRegisterSchema = {
  tags: ['User'],
  summary: "To Register Via Google",
  body: {
    description: 'Register params',
    type: 'object',
    required: ['UserName', 'Email', 'Token', 'Terms', 'Subscription'],
    properties: {
      UserName: {
        type: 'string',
        description: 'User Name'
      },
      Email: {
        type: 'string',
        format: 'email',
        description: 'Email ID'
      },
      Token: {
        type: 'string',
        description: 'Token'
      },
      Terms: {
        type: 'number',
        description: 'Terms Accept 1 or 0'
      },
      Subscription: {
        type: 'number',
        description: 'If Subscribed 1 or 0'
      }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        message: { type: 'string' },
        response: { type: 'string' }
      }
    }
  }
};

// Google Login Schema
exports.GoogleLoginSchema = {
  tags: ['User'],
  summary: "To Login Via Google",
  body: {
    description: 'Google Login params',
    type: 'object',
    required: ['Email', 'Token'],
    properties: {
      Email: {
        type: 'string',
        format: 'email',
        description: 'Email ID'
      },
      Token: {
        type: 'string',
        description: 'Token'
      }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        token: { type: 'string' },
        role: { type: 'string' },
        Steps: { type: 'string' },
        UserId: { type: 'string' },
        response: { type: 'string' }
      }
    }
  }
};

// Facebook Register Schema
exports.FacebookRegisterSchema = {
  tags: ['User'],
  summary: "To Register Via Facebook",
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        message: { type: 'string' },
        response: { type: 'string' }
      }
    }
  }
};

// Facebook Login Schema
exports.FacebookLoginSchema = {
  tags: ['User'],
  summary: "To Login Via Facebook",
  body: {
    description: 'Google Facebook params',
    type: 'object',
    required: ['Email', 'Token'],
    properties: {
      Email: {
        type: 'string',
        format: 'email',
        description: 'Email ID'
      },
      Token: {
        type: 'string',
        description: 'Token'
      }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        token: { type: 'string' },
        role: { type: 'string' },
        Steps: { type: 'string' },
        UserId: { type: 'string' },
        response: { type: 'string' }
      }
    }
  }
};

/* Schema for getting news */
exports.NewsSchema = {
  tags: ['News'],
  summary: "Get News",
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        info: {
          type: "array",
          items: {
            type: "object",
            properties: {
              "Title": { type: 'string' },
              "Content": { type: 'string' },
              "Image": { type: 'string' },
              "_id": { type: 'string' },
            }
          }
        }
      }
    }
  }
};

/* Schema for getting NFT blockchain info */
exports.NFTBlockchainInfoSchema = {
  tags: ['NFTBlockchainInfo'],
  summary: "Get NFTBlockchainInfo",
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        info: {
          type: "array",
          items: {
            type: "object",
            properties: {
              "Title": { type: 'string' },
              "Content": { type: 'string' }
            }
          }
        }
      }
    }
  }
};

/* Schema for logging out */
exports.LogoutSchema = {
  tags: ['User'],
  summary: "To Logout",
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        response: { type: 'string' }
      }
    }
  }
};

exports.AddArtfairSchema = {
  tags: ['Artfair'],
  summary: "Add Artfair",
  body: {
    description: "Add Artfair",
    type: 'object',
    properties: {
      Title: { type: "string" },
      Year: { type: "string" },
      Location: { type: "string" },
      OwnerId: { type: "string" },
      Image: {
        type: "object",
        properties: {
          CDN: { type: "string" },
          IPFS: { type: "string" },
          Local: { type: "string" },
          CLocal: { type: "string" }
        }
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        info: { type: 'string' }
      }
    },
    403: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        info: { type: 'string' }
      }
    },
    500: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        message: { type: 'string' },
        error: { type: 'string' }
      }
    }
  }
}

exports.EditArtfairSchema = {
  tags: ['Artfair'],
  summary: "Edit Artfair",
  body: {
    description: "Edit Artfair",
    type: 'object',
    required: ['Id'],
    properties: {
      Title: { type: "string" },
      Year: { type: "string" },
      Location: { type: "string" },
      OwnerId: { type: "string" },
      Image: {
        type: "object",
        properties: {
          CDN: { type: "string" },
          IPFS: { type: "string" },
          Local: { type: "string" },
          CLocal: { type: "string" }
        }
      },
      Id: {
        type: "string"
      }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        info: { type: 'string' }
      }
    },
    403: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        info: { type: 'string' }
      }
    },
    500: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        message: { type: 'string' },
        error: { type: 'string' }
      }
    }
  }
}

exports.GetOneArtfairSchema = {
  tags: ['Artfair'],
  summary: "Get Single Artfair",
  body: {
    description: "Get Single Artfair",
    type: 'object',
    required: ['Id'],
    properties: {
      Id: {
        type: "string"
      }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        info: {
          type: 'object',
          properties: {
            Title: { type: 'string' },
            Year: { type: 'string' },
            Location: { type: 'string' },
            OwnerId: { type: 'string' },
            Image: {
              type: 'object',
              properties: {
                CDN: { type: "string" },
                IPFS: { type: "string" },
                Local: { type: "string" },
                CLocal: { type: "string" }
              }
            }
          }
        }
      }
    },
    403: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        info: { type: 'string' }
      }
    },
    500: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        message: { type: 'string' },
        error: { type: 'string' }
      }
    }
  }
};

exports.ArtfairListSchema = {
  tags: ['Artfair'],
  summary: "Get Artfair List",
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        info: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              Title: { type: 'string' },
              Year: { type: 'string' },
              Location: { type: 'string' },
              OwnerId: { type: 'string' },
              Image: {
                type: 'object',
                properties: {
                  CDN: { type: "string" },
                  IPFS: { type: "string" },
                  Local: { type: "string" },
                  CLocal: { type: "string" }
                }
              }
            }
          }
        }
      }
    },
    403: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        info: { type: 'string' }
      }
    },
    500: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        message: { type: 'string' },
        error: { type: 'string' }
      }
    }
  }
};

// Delete Artfair Schema
exports.DeleteArtfairSchema = {
  tags: ['Artfair'],
  summary: "Delete Artfair",
  body: {
    description: "Delete Artfair",
    type: 'object',
    required: ['Id'],
    properties: {
      Id: {
        type: "string"
      }
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: { type: 'boolean' },
        info: { type: 'string' }
      }
    }
  }
}

// /* Profile Info Update Schema */
// exports.ProfilemediaUpdateSchema = {
//   tags: ['User'],
//   summary: "To Update Profile Info",
//   type: 'object',
//   properties: {
//     coverVideo: { type: 'string' },
//     ProfileImage: { type: 'string' },
//     profileName: { type: 'string' },
//   },
//   response: {
//     200: {
//       type: 'object',
//       properties: {
//         status: { type: 'boolean' },
//         message: { type: 'string' }
//       }
//     }
//   }
// }

// /* Update Collection Thumb */
// exports.CollectionThumbUpdateSchema = {
//   tags: ['Collection'],
//   summary: "To Update Collection Thumb Image",
//   body: {
//     description: 'Collection Thumb Image Update Params',
//     required: ['Thumb'],
//     properties: {
//       Thumb: {
//         type: 'string',
//         description: 'The Image should contain binary data such as a file upload'
//       }
//     },
//   },
//   response: {
//     200: {
//       type: 'object',
//       properties: {
//         status: { type: 'boolean' },
//         message: { type: 'string' }
//       }
//     }
//   }
// }

// exports.profileupdate_schemanew = {
//   params: {
//     type: 'object',
//     in: 'query',
//     properties: {
//       firstname: {
//         type: 'string'
//       },
//       lastname: {
//         type: 'string',
//       },
//       phoneno: {
//         type: 'number',
//       },
//       countrycode: {
//         type: 'string',
//       }
//     }
//   },
//   response: {
//     200: {
//       type: 'object',
//       properties: {
//         status: { type: 'boolean' },
//         message: { type: 'string' }
//       }
//     }
//   }

// }

// exports.LanguageListSchema = {
//   tags: ['User'],
//   summary: "To Get Languages List",
//   response: {
//     200: {
//       type: 'object',
//       properties: {
//         status: { type: 'boolean' },
//         info: {
//           type: "array",
//           items: {
//             type: "object",
//             properties: {
//               "Name": { type: "string" },
//               "Value": { type: "string" },
//               "Status": { type: "boolean" }
//             }
//           }
//         }
//       }
//     }
//   }
// }

// /* Add Collection Schema */
// exports.AddCollectionSchema = {
//   tags: ['Collection'],
//   summary: "To Create New Collection",
//   body: {
//     description: 'New Collection Creation params',
//     type: 'object',
//     required: ['Name', 'Description', 'Banner', 'Thumb', 'Currency'],
//     properties: {
//       Currency: {
//         type: 'string',
//         description: 'By which Currency Collection needs to create'
//       },
//       Name: {
//         type: 'string',
//         description: 'Collection Name (3 to 255 characters)',
//         minLength: 3,
//         maxLength: 255
//       },
//       Description: {
//         type: 'string',
//         minLength: 100,
//         maxLength: 1000,
//         description: 'Collection Description (100 to 1000 characters)'
//       },
//       Banner: {
//         type: 'string',
//         description: 'Uploaded Banner Image'
//       },
//       Thumb: {
//         type: 'string',
//         description: 'Uploaded Thumb Image'
//       },
//       Royalties: {
//         type: 'number',
//         minimum: 0,
//         maximum: 10,
//         description: 'Royalty Percentage (0 - 10%)'
//       }
//     },
//   },
//   response: {
//     200: {
//       type: 'object',
//       properties: {
//         status: { type: 'boolean' },
//         message: { type: 'string' }
//       }
//     }
//   }
// }