const CollectionController = require('../controllers/CollectionController');
const CollectionSchema = require('../schemas/CollectionSchema.js');

function CollectionRoutes(fastify, options, done) {
    // Create Collection
   
    fastify.post('/CreateCollection', {
        preHandler: [
            fastify.domainauthenticate,
            fastify.ratelimit,
            fastify.authenticate,
            fastify.walletauthenticate,
            CollectionController.CollectionImageUpdate
        ],
        schema: CollectionSchema.AddCollectionSchema,
        handler: CollectionController.CreateCollection(fastify)
    });

    fastify.post('/UpdateCollection', {
        preHandler: [
            fastify.domainauthenticate,
            fastify.ratelimit,
            fastify.authenticate,
            fastify.walletauthenticate,
            CollectionController.CollectionImageUpdate
        ],
        schema: CollectionSchema.UpdateCollectionSchema,
        handler: CollectionController.UpdateCollection(fastify)
    });

 
    // Get Collection Data
    fastify.get('/GetCollection', {
        // Pre-handlers for authentication and rate limiting
        preHandler: [
            fastify.domainauthenticate,
            fastify.ratelimit,
            fastify.authenticate,
            fastify.walletauthenticate
        ],
        // Request schema for validation
        schema: CollectionSchema.CollectiongetSchema,
        // Handler function for getting collection data
        handler: CollectionController.CollectionGetData(fastify)
    });

    fastify.post('/GetUserBasedCollection', {
        // Pre-handlers for authentication and rate limiting
        preHandler: [
            fastify.domainauthenticate,
            fastify.ratelimit
        ],
        // Request schema for validation
        schema: CollectionSchema.UserCollectionallgetSchema,
        // Handler function for getting collection data
        handler: CollectionController.UserCollectionGetData(fastify)
    });

    fastify.post('/GetAllCollection', {
        // Pre-handlers for authentication and rate limiting
        preHandler: [
            fastify.domainauthenticate,
            fastify.ratelimit
        ],
        // Request schema for validation
        schema: CollectionSchema.CollectionallgetSchema,
        // Handler function for getting all collections data
        handler: CollectionController.CollectionAllGetData(fastify)
    });

    fastify.post('/GetCollectionInfo', {
        // Pre-handlers for authentication and rate limiting
        preHandler: [
            fastify.domainauthenticate,
            fastify.ratelimit
        ],
        // Request schema for validation
        schema: CollectionSchema.CollectionInfoSchema,
        // Handler function for getting collection info
        handler: CollectionController.CollectionGetInfo(fastify)
    });

    done()
}

module.exports = CollectionRoutes;