const ItemController = require('../controllers/ItemController');
const ItemSchema = require('../schemas/ItemSchema.js')

function ItemRoutes(fastify, options, done) {

    // Route to retrieve categories list
    fastify.get('/GetCategories', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit], // Pre-handlers for authentication and rate limiting
        schema: ItemSchema.CategoriesListSchema, // Schema for request validation
        handler: ItemController.CategoryList(fastify) // Handler function for processing the request
    });

    fastify.get('/GiftNftList', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit, fastify.authenticate, fastify.walletauthenticate], // Pre-handlers for domain authentication and rate limiting
        handler: ItemController.GetAllGiftNft(fastify) // Handler function for processing the request
    });
    
    fastify.post('/GetGiftItemInfo', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit, fastify.authenticate, fastify.walletauthenticate], // Pre-handlers for domain authentication and rate limiting
        //schema: ItemSchema.GiftItemInfoSchema, // Schema for request validation
        handler: ItemController.GetGiftItemInfo(fastify) // Handler function for processing the request
    });

    fastify.get('/GetArtProductCategories', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit], // Pre-handlers for authentication and rate limiting
        schema: ItemSchema.APCategoriesListSchema, // Schema for request validation
        handler: ItemController.APCategoryList(fastify) // Handler function for processing the request
    });

    fastify.get('/GetArtProductStyles', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit], // Pre-handlers for authentication and rate limiting
        schema: ItemSchema.APStylesListSchema, // Schema for request validation
        handler: ItemController.APStyleList(fastify) // Handler function for processing the request
    });

    fastify.get('/GetArtProductMaterial', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit], // Pre-handlers for authentication and rate limiting
        schema: ItemSchema.APMaterialsListSchema, // Schema for request validation
        handler: ItemController.APMaterialList(fastify) // Handler function for processing the request
    });

    fastify.get('/GetArtProductFabric', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit], // Pre-handlers for authentication and rate limiting
        schema: ItemSchema.APFabricListSchema, // Schema for request validation
        handler: ItemController.APFabricList(fastify) // Handler function for processing the request
    });

    fastify.get('/GetArtProductBrand', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit], // Pre-handlers for authentication and rate limiting
        schema: ItemSchema.APBrandListSchema, // Schema for request validation
        handler: ItemController.APBrandList(fastify) // Handler function for processing the request
    });

    fastify.get('/GetArtProductType', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit], // Pre-handlers for authentication and rate limiting
        schema: ItemSchema.APTypeListSchema, // Schema for request validation
        handler: ItemController.APTypeList(fastify) // Handler function for processing the request
    });

    fastify.get('/GetArtProductShape', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit], // Pre-handlers for authentication and rate limiting
        schema: ItemSchema.APShapeListSchema, // Schema for request validation
        handler: ItemController.APShapeList(fastify) // Handler function for processing the request
    });

    fastify.get('/GetArtProductTechnique', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit], // Pre-handlers for authentication and rate limiting
        schema: ItemSchema.APTechniqueListSchema, // Schema for request validation
        handler: ItemController.APTechniqueList(fastify) // Handler function for processing the request
    });

    fastify.get('/GetArtProductName', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit], // Pre-handlers for authentication and rate limiting
        schema: ItemSchema.APNameSchema, // Schema for request validation
        handler: ItemController.APNameList(fastify) // Handler function for processing the request
    });

    fastify.get('/GetCushionSize', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit], // Pre-handlers for authentication and rate limiting
        schema: ItemSchema.APCushionsizeSchema, // Schema for request validation
        handler: ItemController.APCushionSizeList(fastify) // Handler function for processing the request
    });

    fastify.get('/GetRugSize', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit], // Pre-handlers for authentication and rate limiting
        schema: ItemSchema.APRugsizeSchema, // Schema for request validation
        handler: ItemController.APRugSizeList(fastify) // Handler function for processing the request
    });

    fastify.post('/GetFurnitureName', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit], // Pre-handlers for authentication and rate limiting
        schema: ItemSchema.APFurnitureNameSchema, // Schema for request validation
        handler: ItemController.APFurnitureNameList(fastify) // Handler function for processing the request
    });

    fastify.post('/GetLightingName', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit], // Pre-handlers for authentication and rate limiting
        schema: ItemSchema.APLightingNameSchema, // Schema for request validation
        handler: ItemController.APLightingNameList(fastify) // Handler function for processing the request
    });

    fastify.post('/GetFurnishingName', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit], // Pre-handlers for authentication and rate limiting
        schema: ItemSchema.APFurnishingNameSchema, // Schema for request validation
        handler: ItemController.APFurnishingNameList(fastify) // Handler function for processing the request
    });

    // Route to retrieve materials list
    fastify.get('/GetMaterials', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit], // Pre-handlers for authentication and rate limiting
        schema: ItemSchema.MaterialListSchema, // Schema for request validation
        handler: ItemController.MaterialList(fastify) // Handler function for processing the request
    });

    // Route to retrieve medium list
    fastify.get('/GetMedium', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit], // Pre-handlers for authentication and rate limiting
        schema: ItemSchema.MediumListSchema, // Schema for request validation
        handler: ItemController.MediumList(fastify) // Handler function for processing the request
    });

    // Route to retrieve artist categories list
    fastify.get('/GetArtistCategories', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit], // Pre-handlers for domain authentication and rate limiting
        schema: ItemSchema.ArtistCategoryListSchema, // Schema for request validation
        handler: ItemController.ArtistCategoryList(fastify) // Handler function for processing the request
    });

    fastify.get('/GetArtistLabels', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit], // Pre-handlers for domain authentication and rate limiting
        schema: ItemSchema.ArtistLabelListSchema, // Schema for request validation
        handler: ItemController.ArtistLabelList(fastify) // Handler function for processing the request
    });

    // Route to get artist medium
    fastify.get('/GetArtistMedium', {
        // Pre-handlers to be executed before the route handler
        preHandler: [fastify.domainauthenticate, fastify.ratelimit],
        // Request schema for input validation
        schema: ItemSchema.ArtistMediumListSchema,
        // Route handler function
        handler: ItemController.ArtistMediumList(fastify)
    });

    // Route to get artist styles
    fastify.get('/GetArtistStyles', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit],
        schema: ItemSchema.ArtistStyleListSchema,
        handler: ItemController.ArtistStyleList(fastify)
    });

    // Route to get styles
    fastify.get('/GetStyles', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit],
        schema: ItemSchema.StyleListSchema,
        handler: ItemController.StylesList(fastify)
    });

    // Route to get keywords
    fastify.get('/GetKeywords', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit, fastify.authenticate, fastify.walletauthenticate],
        schema: ItemSchema.KeywordListSchema,
        handler: ItemController.KeywordsList(fastify)
    });

 
    // Route to create artwork general details

    fastify.post('/CreateArtItemGeneral', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit, fastify.authenticate, fastify.walletauthenticate], // Pre-handlers for authentication and rate limiting
        schema: ItemSchema.AddArtItemGeneralSchema, // Schema for request validation
        handler: ItemController.CreateArtItemGeneral(fastify) // Handler function for processing the request
    });

  
    fastify.post('/CreateArtItemArtistDetail', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit, fastify.authenticate, fastify.walletauthenticate], // Pre-handlers for authentication and rate limiting
        schema: ItemSchema.AddArtItemArtistSchema, // Schema for request validation
        handler: ItemController.CreateArtItemArtistDetail(fastify) // Handler function for processing the request
    });



    fastify.post('/CreateArtItemPriceDetail', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit, fastify.authenticate, fastify.walletauthenticate], // Pre-handlers for authentication and rate limiting
        schema: ItemSchema.AddArtItemPriceSchema, // Schema for request validation
        handler: ItemController.CreateArtItemPriceDetail(fastify) // Handler function for processing the request
    });

    // Route to create artwork logistic detail

    fastify.post('/CreateArtItemLogisticDetail', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit, fastify.authenticate, fastify.walletauthenticate],
        schema: ItemSchema.AddArtItemLogisticSchema,
        handler: ItemController.CreateArtItemLogisticDetail(fastify)
    });

    // Route to create artwork image detail
  
    fastify.post('/CreateArtItemImageDetail', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit, fastify.authenticate, fastify.walletauthenticate],
        schema: ItemSchema.AddArtItemImageSchema,
        handler: ItemController.CreateArtItemImageDetail(fastify)
    });
  
    fastify.post('/SellArtNFT', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit, fastify.authenticate, fastify.walletauthenticate], // Pre-handlers for authentication and rate limiting
        schema: ItemSchema.UpdateArtItemSchema, // Schema for request validation
        handler: ItemController.SellArtNFT(fastify) // Handler function for processing the request
    });

    fastify.post('/DelistArtNFT', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit, fastify.authenticate, fastify.walletauthenticate], // Pre-handlers for authentication and rate limiting
        schema: ItemSchema.DelistArtItemSchema, // Schema for request validation
        handler: ItemController.DelistArtNFT(fastify) // Handler function for processing the request
    });

    fastify.post('/HideArtNFT', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit, fastify.authenticate, fastify.walletauthenticate], // Pre-handlers for authentication and rate limiting
        schema: ItemSchema.HideArtItemSchema, // Schema for request validation
        handler: ItemController.HideArtNFT(fastify) // Handler function for processing the request
    });

    // Route to update the thumbnail image of an item

    fastify.post('/ArtItemThumb', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit, fastify.authenticate, fastify.walletauthenticate,ItemController.ThumbUpdate], // Pre-handlers for authentication, rate limiting, and thumbnail update
        schema: ItemSchema.ArtItemThumbUpdateSchema, // Schema for request validation
        handler: ItemController.ArtItemThumbUpload(fastify) // Handler function for processing the request
    });

    // Route to update the media of an item

    fastify.post('/ArtItemMedia', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit, fastify.authenticate, fastify.walletauthenticate, ItemController.MediaUpdate], // Pre-handlers for authentication, rate limiting, and media update
        schema: ItemSchema.ArtItemMediaUpdateSchema, // Schema for request validation
        handler: ItemController.ArtItemMediaUpload(fastify) // Handler function for processing the request
    });

    // Route to update the Bulk Thumb Images

    fastify.post('/ThumbBulkUpload', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit,ItemController.BulkImageUpdate],
        schema: ItemSchema.BulkThumbUpdateSchema,
        handler: ItemController.BulkThumbUpload(fastify) 
    });

     // Route to Get CSV File Data for Bulk Upload

     fastify.post('/BulkUpload', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit, fastify.authenticate, fastify.walletauthenticate,ItemController.CSVUpdate],
        schema: ItemSchema.BulkCSVUpdateSchema,
        handler: ItemController.BulkCsvUpload(fastify) 
    });

       // Route to update Bulk Mint

    // Route to get a list of items authored by the user
    fastify.get('/GetAuthoredItemList', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit, fastify.authenticate, fastify.walletauthenticate], // Pre-handlers for authentication and rate limiting
        schema: ItemSchema.ItemgetSchema, // Schema for request validation
        handler: ItemController.ItemGetData(fastify) // Handler function for processing the request
    });

    fastify.get('/GetOwnedItemList', {
        // Pre-handlers for authentication and rate limiting
        preHandler: [
            fastify.domainauthenticate,
            fastify.ratelimit,
            fastify.authenticate,
            fastify.walletauthenticate
        ],
        schema: ItemSchema.ItemgetSchema, // Schema for request validation
        handler: ItemController.NewItemGetData(fastify) // Handler function for processing the request
    });

    fastify.post('/GetAllItem', {
        // Pre-handlers for authentication and rate limiting
        preHandler: [
            fastify.domainauthenticate,
            fastify.ratelimit
        ],
        schema: ItemSchema.ItemgetAllSchema, // Schema for request validation
        handler: ItemController.ItemGetAllData(fastify) // Handler function for processing the request
    });

      // Route to get all physical art items
    fastify.post('/GetAllPhysicalArt', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit], // Pre-handlers for domain authentication and rate limiting
        schema: ItemSchema.ItemgetAllSchema, // Schema for request validation
        handler: ItemController.ItemGetPhysicalArt(fastify) // Handler function for processing the request
    });

    // Route to get items based on collection
    fastify.post('/GetCollectionBasedItem', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit], // Pre-handlers for domain authentication and rate limiting
        schema: ItemSchema.CollectionBasedItemgetSchema, // Schema for request validation
        handler: ItemController.ItemCollectionBasedGetData(fastify) // Handler function for processing the request
    });

    fastify.post('/GetCollectionBasedMintedItem', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit], // Pre-handlers for domain authentication and rate limiting
        schema: ItemSchema.MintedCollectionBasedItemgetSchema, // Schema for request validation
        handler: ItemController.MintedItemCollectionBasedGetData(fastify) // Handler function for processing the request
    });

    fastify.post('/GetCollectionBasedArtItem', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit],
        schema: ItemSchema.CollectionBasedArtItemgetSchema,
        handler: ItemController.ItemCollectionBasedArtGetData(fastify) // Handler function for processing the request
    });

    

    // Route to get information about an item
    fastify.post('/GetCartItemInfo', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit], // Pre-handlers for domain authentication and rate limiting
        schema: ItemSchema.CartItemInfoSchema, // Schema for request validation
        handler: ItemController.ItemGetInfo(fastify) // Handler function for processing the request
    });

   
    fastify.post('/BidInterest', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit], // Pre-handlers for domain authentication and rate limiting
        schema: ItemSchema.BidInterestSchema, // Schema for request validation
        handler: ItemController.BidInterest(fastify) // Handler function for processing the request
    });


    fastify.post('/ArtistBasedBids', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit], // Pre-handlers for domain authentication and rate limiting
        schema: ItemSchema.ArtistBasedBidInfoSchema, // Schema for request validation
        handler: ItemController.ArtistBasedBid(fastify) // Handler function for processing the request
    });


    fastify.post('/ArtistBasedBidInterest', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit], // Pre-handlers for domain authentication and rate limiting
        schema: ItemSchema.ArtistBasedBidInterestSchema, // Schema for request validation
        handler: ItemController.ArtistBasedBidInterest(fastify) // Handler function for processing the request
    });

    // Route to get owner list information of an item
    fastify.post('/GetItemOwnerListInfo', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit], // Pre-handlers for domain authentication and rate limiting
        schema: ItemSchema.ItemOwnerListInfoSchema, // Schema for request validation
        handler: ItemController.ItemGetOwnerListInfo(fastify) // Handler function for processing the request
    });

    // Route to get item history list information
    fastify.post('/GetItemHistoryListInfo', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit], // Pre-handlers for domain authentication and rate limiting
        schema: ItemSchema.ItemHistoryListInfoSchema, // Schema for request validation
        handler: ItemController.ItemGetHistoryListInfo(fastify) // Handler function for processing the request
    });

    // Route to get detailed information about an item with authentication
    fastify.post('/GetItemDetailedInfo', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit, fastify.authenticate, fastify.walletauthenticate], // Pre-handlers for domain authentication, rate limiting, authentication, and wallet authentication
        schema: ItemSchema.ItemInfoDetailedSchema, // Schema for request validation
        handler: ItemController.ItemGetInfoWithAuth(fastify) // Handler function for processing the request
    });

    fastify.post('/ItemList', {
        // Pre-handlers for authentication and rate limiting
        preHandler: [
            fastify.domainauthenticate,
            fastify.ratelimit,
            fastify.authenticate,
            fastify.walletauthenticate
        ],
        schema: ItemSchema.ItemListSchema, // Schema for request validation
        handler: ItemController.ListItem(fastify) // Handler function for processing the request
    });

    fastify.post('/AddtoCart', {
        // Pre-handlers for authentication and rate limiting
        preHandler: [
            fastify.domainauthenticate,
            fastify.ratelimit,
            fastify.authenticate,
            fastify.walletauthenticate
        ],
        schema: ItemSchema.AddtoCartSchema, // Schema for request validation
        handler: ItemController.AddToCart(fastify) // Handler function for processing the request
    });

    fastify.post('/AddOffer', {
        // Pre-handlers for authentication and rate limiting
        preHandler: [
            fastify.domainauthenticate,
            fastify.ratelimit,
            fastify.authenticate,
            fastify.walletauthenticate
        ],
        schema: ItemSchema.AddOfferSchema, // Schema for request validation
        handler: ItemController.AddOffer(fastify) // Handler function for processing the request
    });

    fastify.post('/AddPreOffer', {
        // Pre-handlers for authentication and rate limiting
        preHandler: [
            fastify.domainauthenticate,
            fastify.ratelimit,
            fastify.authenticate,
            fastify.walletauthenticate
        ],
        schema: ItemSchema.AddPreOfferSchema, // Schema for request validation
        handler: ItemController.AddPreOffer(fastify) // Handler function for processing the request
    });

    fastify.post('/AddBid', {
        // Pre-handlers for authentication and rate limiting
        preHandler: [
            fastify.domainauthenticate,
            fastify.ratelimit,
            fastify.authenticate,
            fastify.walletauthenticate
        ],
        schema: ItemSchema.AddBidSchema, // Schema for request validation
        handler: ItemController.AddBid(fastify) // Handler function for processing the request
    });

    // Route to check bid
    fastify.post('/CheckBid', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit, fastify.authenticate, fastify.walletauthenticate], // Pre-handlers for domain authentication, rate limiting, authentication, and wallet authentication
        schema: ItemSchema.CheckBidSchema, // Schema for request validation
        handler: ItemController.CheckBid(fastify) // Handler function for processing the request
    });


    // Route to purchase an item
    fastify.post('/PurchaseItem', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit, fastify.authenticate, fastify.walletauthenticate], // Pre-handlers for domain authentication, rate limiting, authentication, and wallet authentication
        schema: ItemSchema.PurchaseItemSchema, // Schema for request validation
        handler: ItemController.PurchaseItem(fastify) // Handler function for processing the request
    });

    // Route to purchase multiple items
    fastify.post('/PurchaseMultipleItem', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit, fastify.authenticate, fastify.walletauthenticate], // Pre-handlers for domain authentication, rate limiting, authentication, and wallet authentication
        schema: ItemSchema.PurchaseMultipleItemSchema, // Schema for request validation
        handler: ItemController.PurchaseMultipleItem(fastify) // Handler function for processing the request
    });

    fastify.post('/RemoveOffer', {
        // Pre-handlers for authentication and rate limiting
        preHandler: [
            fastify.domainauthenticate,
            fastify.ratelimit,
            fastify.authenticate,
            fastify.walletauthenticate
        ],
        schema: ItemSchema.RemoveOfferSchema, // Schema for request validation
        handler: ItemController.RemoveOffer(fastify) // Handler function for processing the request
    });

    fastify.post('/OfferItemBasedList', {
        // Pre-handlers for authentication and rate limiting
        //preHandler: [fastify.domainauthenticate, fastify.ratelimit],
        schema: ItemSchema.ItemBasedOfferSchema, // Schema for request validation
        handler: ItemController.OfferItemBasedGetData(fastify) // Handler function for processing the request
    });

    fastify.post('/PreOfferItemBasedList', {
        // Pre-handlers for authentication and rate limiting
       preHandler: [fastify.domainauthenticate, fastify.ratelimit],
        schema: ItemSchema.ItemBasedOfferSchema, // Schema for request validation
        handler: ItemController.PreOfferItemBasedGetData(fastify) // Handler function for processing the request
    });

    fastify.post('/BidItemBasedList', {
        // Pre-handlers for authentication and rate limiting
        preHandler: [
            fastify.domainauthenticate,
            fastify.ratelimit,
            fastify.authenticate,
            fastify.walletauthenticate
        ],
        schema: ItemSchema.ItemBasedBidSchema, // Schema for request validation
        handler: ItemController.BidItemBasedGetData(fastify) // Handler function for processing the request
    });

    fastify.post('/Offerstatus', {
        // Pre-handlers for authentication and rate limiting
        preHandler: [
            fastify.domainauthenticate,
            fastify.ratelimit,
            fastify.authenticate,
            fastify.walletauthenticate
        ],
        schema: ItemSchema.OfferStatusSchema, // Schema for request validation
        handler: ItemController.OfferStatus(fastify) // Handler function for processing the request
    });

    fastify.post('/PreOfferstatus', {
        // Pre-handlers for authentication and rate limiting
        preHandler: [
            fastify.domainauthenticate,
            fastify.ratelimit,
            fastify.authenticate,
            fastify.walletauthenticate
        ],
        schema: ItemSchema.PreOfferStatusSchema, // Schema for request validation
        handler: ItemController.PreOfferStatus(fastify) // Handler function for processing the request
    });

    // Route to get auction status
    fastify.post('/Auctionstatus', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit, fastify.authenticate, fastify.walletauthenticate], // Pre-handlers for domain authentication, rate limiting, authentication, and wallet authentication
        schema: ItemSchema.AuctionStatusSchema, // Schema for request validation
        handler: ItemController.AuctionStatus(fastify) // Handler function for processing the request
    });

    // Route to get cart item
    fastify.post('/GetCartItem', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit, fastify.authenticate, fastify.walletauthenticate], // Pre-handlers for domain authentication, rate limiting, authentication, and wallet authentication
        schema: ItemSchema.CartItemgetSchema, // Schema for request validation
        handler: ItemController.ItemCartGetData(fastify) // Handler function for processing the request
    });

    // Route to remove item from cart
    fastify.post('/RemoveFromCart', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit, fastify.authenticate, fastify.walletauthenticate], // Pre-handlers for domain authentication, rate limiting, authentication, and wallet authentication
        schema: ItemSchema.RemoveFromCartSchema, // Schema for request validation
        handler: ItemController.RemoveCart(fastify) // Handler function for processing the request
    });

    fastify.post('/DHLRates', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit],
        schema: ItemSchema.DHLRatesSchema,
        handler: ItemController.DHLRates(fastify)
    });
    fastify.post('/DHLAddressValidate', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit],
        schema: ItemSchema.DHLAddressValidateSchma,
        handler: ItemController.DHLAddress(fastify)
    });
    fastify.post('/DHLCreate-shippment', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit],
        schema: ItemSchema.DHLCreateShippmentSchma,
        handler: ItemController.DHLShipment(fastify)
    });

    done()
}

module.exports = ItemRoutes;