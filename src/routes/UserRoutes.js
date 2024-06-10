const UserController = require('../controllers/UserController');
const UserSchema = require('../schemas/UserSchema.js')

function UserRoutes(fastify, options, done) {
   
    // Route to get countries
    fastify.route({
        method: 'GET',
        url: '/GetBannerDetails',
        preHandler: [fastify.domainauthenticate, fastify.ratelimit],
        schema: UserSchema.GetBannerDetails,
        handler: UserController.GetBannerDetails(fastify)
    });

    fastify.route({
        method: 'GET',
        url: '/GetMetamaskVideo',
        //preHandler: [fastify.domainauthenticate, fastify.ratelimit],
        schema: UserSchema.GetMetamaskDetails,
        handler: UserController.GetMetamaskDetails(fastify)
    });

    fastify.route({
        method: 'POST',
        url: '/UploadFlag',
        preHandler: [
            UserController.FlagUpdate
        ],
        handler: UserController.uploadflag(fastify)
    });

    fastify.route({
        method: 'GET',
        url: '/GetInnerBannerDetails',
        preHandler: [fastify.domainauthenticate, fastify.ratelimit],
        schema: UserSchema.GetInnerBannerDetails,
        handler: UserController.GetInnerBannerDetails(fastify)
    });


    // Route to get countries
    fastify.route({
        method: 'GET',
        url: '/GetCountries',
        preHandler: [fastify.domainauthenticate, fastify.ratelimit],
        schema: UserSchema.CountryListSchema,
        handler: UserController.GetCountries
    });

    // Route to get landing page information
    fastify.route({
        method: 'GET',
        url: '/LandingPageInfo',
        preHandler: [fastify.domainauthenticate, fastify.ratelimit],
        schema: UserSchema.LandingPageSchema,
        handler: UserController.GetLandingPageDetails
    });

    fastify.route({
        method: 'GET',
        url: '/AboutusPageInfo',
        preHandler: [fastify.domainauthenticate, fastify.ratelimit],
        schema: UserSchema.AboutusPageSchema,
        handler: UserController.GetAboutusPageDetails
    });

    fastify.route({
        method: 'GET',
        url: '/EventsPageInfo',
        preHandler: [fastify.domainauthenticate, fastify.ratelimit],
        schema: UserSchema.EventsPageSchema,
        handler: UserController.GetEventsPageDetails
    });

    fastify.route({
        method: 'GET',
        url: '/FeaturesPageInfo',
        preHandler: [fastify.domainauthenticate, fastify.ratelimit],
        schema: UserSchema.FeaturesPageSchema,
        handler: UserController.GetFeaturePageDetails
    });

    // Route to get user role information
    fastify.route({
        method: 'POST',
        url: '/GetUserRoleInfo',
        preHandler: [fastify.domainauthenticate, fastify.ratelimit],
        schema: UserSchema.UserRoleInfoSchema,
        handler: UserController.GetUserRoles
    });

    fastify.route({
        method: 'POST',
        url: '/GetCSVSamples',
        preHandler: [fastify.domainauthenticate, fastify.ratelimit],
        schema: UserSchema.CSVSampleSchema,
        handler: UserController.GetCSVSamples
    });

    // Route to get site settings
    fastify.route({
        method: 'GET',
        url: '/GetSiteSettings',
        preHandler: [fastify.domainauthenticate, fastify.ratelimit],
        schema: UserSchema.SettingSchema,
        handler: UserController.GetSiteSettings
    });

    // Route to get network information
    fastify.route({
        method: 'POST',
        url: '/GetNetworkInfo',
        preHandler: [fastify.domainauthenticate, fastify.ratelimit],
        schema: UserSchema.NetworkInfoSchema,
        handler: UserController.GetNetworkInfo
    });


    fastify.route({
        method: 'POST',
        url: '/GetPageInfo',
        preHandler: [fastify.domainauthenticate, fastify.ratelimit],
        //schema: UserSchema.PageInfoSchema,
        handler: UserController.GetPageInfo
    });

    fastify.route({
        method: 'POST',
        url: '/GetNewsInfo',
        preHandler: [fastify.domainauthenticate, fastify.ratelimit],
        schema: UserSchema.NewsInfoSchema,
        handler: UserController.NewsInfo
    });

    

        // Route to get Media Limit information
        fastify.route({
            method: 'POST',
            url: '/GetMediaLimitInfo',
            preHandler: [fastify.domainauthenticate, fastify.ratelimit],
            schema: UserSchema.MediaLimitInfoSchema,
            handler: UserController.GetMediaLimitInfo
        });

    // Route: POST /Register
    fastify.route({
        method: 'POST',
        url: '/Register',
        preHandler: [fastify.domainauthenticate, fastify.ratelimit],
        schema: UserSchema.RegisterSchema,
        handler: UserController.Register(fastify)
    });

    // Route: POST /ResendRegisterVerifyOTP
    fastify.post('/ResendRegisterVerifyOTP', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit],
        schema: UserSchema.ResendRegisterOTPSchema,
        handler: UserController.ResendRegisterOTP(fastify)
    });
    // Route: POST /VerifyOTP
    fastify.post('/VerifyOTP', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit],
        schema: UserSchema.ConfirmationSchema,
        handler: UserController.Confirmation(fastify)
    });

    // Route: POST /SelectRole
    fastify.post('/SelectRole', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit],
        schema: UserSchema.RoleSelectSchema,
        handler: UserController.RoleSelect(fastify)
    });

    // Route: POST /UpdateAddress
    fastify.post('/UpdateAddress', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit],
        schema: UserSchema.UpdateAddressSchema,
        handler: UserController.UpdateAddress(fastify)
    });

    // Route: POST /AgreementAcceptance
    fastify.post('/AgreementAcceptance', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit],
        schema: UserSchema.AgreementAcceptSchema,
        handler: UserController.UpdateAgreement(fastify)
    });

    // Role Based Users API
    fastify.post('/RoleBasedUsers', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit],
        schema: UserSchema.RoleBasedUserSchema,
        handler: UserController.RoleBasedUsers(fastify)
    });

    fastify.post('/ArtistLabelBasedUsers', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit],
        schema: UserSchema.LabelBasedUserSchema,
        handler: UserController.LabelBasedUsers(fastify)
    });

    // Login API
    fastify.post('/Login', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit],
        schema: UserSchema.LoginSchema,
        handler: UserController.Login(fastify)
    });

    // Verify Login 2FA API
    fastify.post('/VerifyLogin2FA', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit],
        schema: UserSchema.Verify2FASchema,
        handler: UserController.Verify2FA(fastify)
    });

    // Forgot Password API
    fastify.post('/ForgotPassword', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit],
        schema: UserSchema.ForgotPasswordSchema,
        handler: UserController.ForgotPassword(fastify)
    });

    // Reset Password API
    fastify.post('/ResetPassword', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit],
        schema: UserSchema.ResetPasswordSchema,
        handler: UserController.ResetPassword
    });

    // Connect Wallet API
    fastify.post('/ConnectWallet', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit, fastify.authenticate, fastify.serverauthenticate],
        schema: UserSchema.ConnectWalletSchema,
        handler: UserController.WalletConnect(fastify)
    });

    // GetProfileInfo API - Get user profile information
    fastify.get('/GetProfileInfo', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit, fastify.authenticate, fastify.walletauthenticate],
        schema: UserSchema.ProfileSchema,
        handler: UserController.ProfileInfo
    });




    // GetArtistInfo API - Get artist information
    fastify.post('/GetArtistInfo', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit],
        schema: UserSchema.ArtistSchema,
        handler: UserController.ArtistInfo
    });

 
    //// Card routes

    // Add or edit bio
    fastify.post('/AddEditBio', {
        preHandler: [
            fastify.domainauthenticate, fastify.ratelimit, fastify.authenticate, fastify.walletauthenticate
        ],
        schema: UserSchema.AddBioSchema,
        handler: UserController.AddBio
    });

    fastify.post('/Notifications', {
        preHandler: [
        fastify.domainauthenticate, fastify.ratelimit, fastify.authenticate, fastify.walletauthenticate],
        schema: UserSchema.GetNotificationSchema,
        handler: UserController.NotificationList
    });

    // Get bio
    fastify.get('/GetBio', {
        preHandler: [
            fastify.domainauthenticate, fastify.ratelimit, fastify.authenticate, fastify.walletauthenticate
        ],
        schema: UserSchema.GetBioSchema,
        handler: UserController.GetBio
    });
    // Delete bio
    fastify.get('/DeleteBio', {
        preHandler: [
            fastify.domainauthenticate, fastify.ratelimit, fastify.authenticate, fastify.walletauthenticate
        ],
        schema: UserSchema.DeleteBioSchema,
        handler: UserController.DeleteBio
    });

    // Add Testimonial
    fastify.post('/AddTestimonial', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit, fastify.authenticate, fastify.walletauthenticate],
        schema: UserSchema.AddTestimonialSchema,
        handler: UserController.AddTestimonials
    });

    // Edit Testimonial
    fastify.post('/EditTestimonial', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit, fastify.authenticate, fastify.walletauthenticate],
        schema: UserSchema.EditTestimonialSchema,
        handler: UserController.EditTestimonials
    });

    // Get Testimonials
    fastify.get('/GetTestimonials', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit, fastify.authenticate, fastify.walletauthenticate],
        schema: UserSchema.GetTestimonialSchema,
        handler: UserController.GetTestimonials
    });

    // Delete Get One Testimonial
    fastify.post('/GetOneTestimonial', {
        preHandler: [
            fastify.domainauthenticate,
            fastify.ratelimit,
            fastify.authenticate,
            fastify.walletauthenticate
        ],
        schema: UserSchema.GetOneTestimonialSchema,
        handler: UserController.GetOneTestimonial
    });

    // Delete Testimonial
    fastify.post('/DeleteTestimonial', {
        preHandler: [fastify.domainauthenticate, fastify.ratelimit, fastify.authenticate, fastify.walletauthenticate],
        schema: UserSchema.DeleteTestimonialSchema,
        handler: UserController.DeleteTestimonials
    });

    // Add Exhibition route
    fastify.post('/AddExhibition', {
        preHandler: [
            fastify.domainauthenticate, // Pre-handler for domain authentication
            fastify.ratelimit, // Pre-handler for rate limiting
            fastify.authenticate, // Pre-handler for user authentication
            fastify.walletauthenticate // Pre-handler for wallet authentication
        ],
        schema: UserSchema.AddExhibitionSchema, // Request schema validation for adding an exhibition
        handler: UserController.AddExhibitions // Route handler for adding an exhibition
    });

    // Get One Exhibition route
    fastify.post('/GetOneExhibition', {
        preHandler: [
            fastify.domainauthenticate, // Pre-handler for domain authentication
            fastify.ratelimit, // Pre-handler for rate limiting
            fastify.authenticate, // Pre-handler for user authentication
            fastify.walletauthenticate // Pre-handler for wallet authentication
        ],
        schema: UserSchema.GetOneExhibitionSchema, // Request schema validation for getting a single exhibition
        handler: UserController.GetOneExhibition // Route handler for getting a single exhibition
    });

    // Get Exhibitions route
    fastify.get('/GetExhibitions', {
        preHandler: [
            fastify.domainauthenticate, // Pre-handler for domain authentication
            fastify.ratelimit, // Pre-handler for rate limiting
            fastify.authenticate, // Pre-handler for user authentication
            fastify.walletauthenticate // Pre-handler for wallet authentication
        ],
        schema: UserSchema.GetExhibitionSchema, // Request schema validation for getting all exhibitions
        handler: UserController.GetExhibitions // Route handler for getting all exhibitions
    });

    // Edit Exhibition route
    fastify.post('/EditExhibition', {
        preHandler: [
            fastify.domainauthenticate, // Pre-handler for domain authentication
            fastify.ratelimit, // Pre-handler for rate limiting
            fastify.authenticate, // Pre-handler for user authentication
            fastify.walletauthenticate // Pre-handler for wallet authentication
        ],
        schema: UserSchema.EditExhibitionSchema, // Request schema validation for editing an exhibition
        handler: UserController.EditExhibitions // Route handler for editing an exhibition
    });

    // Delete Exhibition route
    fastify.post('/DeleteExhibition', {
        preHandler: [
            fastify.domainauthenticate, // Pre-handler for domain authentication
            fastify.ratelimit, // Pre-handler for rate limiting
            fastify.authenticate, // Pre-handler for user authentication
            fastify.walletauthenticate // Pre-handler for wallet authentication
        ],
        schema: UserSchema.DeleteExhibitionSchema, // Request schema validation for deleting an exhibition
        handler: UserController.DeleteExhibitions // Route handler for deleting an exhibition
    });

    fastify.post('/AddMediaPublications', {
        // Pre-handler functions executed before the main handler
        preHandler: [
            fastify.domainauthenticate,     // Authenticates the domain
            fastify.ratelimit,              // Applies rate limiting
            fastify.authenticate,           // Authenticates the user
            fastify.walletauthenticate      // Authenticates the wallet
        ],
        schema: UserSchema.AddMediasSchema, // Validation schema for the request body
        handler: UserController.AddMedias   // Request handler for this route
    });

    fastify.post('/EditMediaPublications', {
        // Pre-handler functions executed before the main handler
        preHandler: [
            fastify.domainauthenticate,     // Authenticates the domain
            fastify.ratelimit,              // Applies rate limiting
            fastify.authenticate,           // Authenticates the user
            fastify.walletauthenticate      // Authenticates the wallet
        ],
        schema: UserSchema.EditMediasSchema, // Validation schema for the request body
        handler: UserController.EditMedias   // Request handler for this route
    });

    // Get MediaPublications route

    fastify.get('/GetMediaPublications', {
        preHandler: [
            fastify.domainauthenticate, // Pre-handler for domain authentication
            fastify.ratelimit, // Pre-handler for rate limiting
            fastify.authenticate, // Pre-handler for user authentication
            fastify.walletauthenticate // Pre-handler for wallet authentication
        ],
        schema: UserSchema.GetMediaSchema, // Request schema validation for getting all Medias
        handler: UserController.GetMedias // Route handler for getting all medias
    });

    // Get One Media route
    fastify.post('/GetOneMediaPublications', {
        preHandler: [
            fastify.domainauthenticate, // Pre-handler for domain authentication
            fastify.ratelimit, // Pre-handler for rate limiting
            fastify.authenticate, // Pre-handler for user authentication
            fastify.walletauthenticate // Pre-handler for wallet authentication
        ],
        schema: UserSchema.GetOneMediaSchema, // Request schema validation for getting a single media
        handler: UserController.GetOneMedias // Route handler for getting a single media
    });

    // Delete Exhibition route
    fastify.post('/DeleteMediaPublications', {
        preHandler: [
            fastify.domainauthenticate, // Pre-handler for domain authentication
            fastify.ratelimit, // Pre-handler for rate limiting
            fastify.authenticate, // Pre-handler for user authentication
            fastify.walletauthenticate // Pre-handler for wallet authentication
        ],
        schema: UserSchema.DeleteMediaSchema, // Request schema validation for deleting an media
        handler: UserController.DeleteMedias // Route handler for deleting an media
    });
  
    // AddAddress route
    fastify.post('/AddAddress', {
        preHandler: [
            fastify.domainauthenticate,
            fastify.ratelimit,
            fastify.authenticate,
            fastify.walletauthenticate,
        ],
        schema: UserSchema.AddAddressSchema,
        handler: UserController.AddAddress,
    });

    // EditAddress route
    fastify.post('/EditAddress', {
        preHandler: [
            fastify.domainauthenticate,
            fastify.ratelimit,
            fastify.authenticate,
            fastify.walletauthenticate,
        ],
        schema: UserSchema.EditAddressSchema,
        handler: UserController.EditAddress,
    });

    // GetOneAddress route
    fastify.post('/GetOneAddress', {
        preHandler: [
            fastify.domainauthenticate,
            fastify.ratelimit,
            fastify.authenticate,
            fastify.walletauthenticate,
        ],
        schema: UserSchema.GetOneAddressSchema,
        handler: UserController.GetOneAddress,
    });

    // GetAddressList route
    fastify.get('/GetAddressList', {
        preHandler: [
            fastify.domainauthenticate,
            fastify.ratelimit,
            fastify.authenticate,
            fastify.walletauthenticate,
        ],
        schema: UserSchema.AddressListSchema,
        handler: UserController.GetAddressList,
    });

    // DeleteAddress route
    fastify.post('/DeleteAddress', {
        preHandler: [
            fastify.domainauthenticate,
            fastify.ratelimit,
            fastify.authenticate,
            fastify.walletauthenticate,
        ],
        schema: UserSchema.DeleteAddressSchema,
        handler: UserController.DeleteOneAddress,
    });

    // Change password
    fastify.post('/ChangePassword', {
        preHandler: [
            fastify.domainauthenticate,
            fastify.ratelimit,
            fastify.authenticate,
            fastify.walletauthenticate
        ],
        schema: UserSchema.ChangePasswordSchema,
        handler: UserController.ChangePassword
    });

    // Enable or disable 2FA
    fastify.post('/EnableDisable2FA', {
        preHandler: [
            fastify.domainauthenticate,
            fastify.ratelimit,
            fastify.authenticate,
            fastify.walletauthenticate
        ],
        schema: UserSchema.EnableDisable2FASchema,
        handler: UserController.EnableDisable2FA
    });

    // Common image upload
    fastify.post('/CommonImageUpload', {
        preHandler: [
            fastify.domainauthenticate,
            fastify.ratelimit,
            fastify.authenticate,
            fastify.walletauthenticate,
            UserController.ImageUpdate
        ],
        schema: UserSchema.CommonThumbUpdateSchema,
        handler: UserController.CommonImageUpload(fastify)
    });

    // Update KYC information
    fastify.post('/UpdateKyc', {
        preHandler: [
            fastify.domainauthenticate,
            fastify.ratelimit,
            UserController.KycImageUpload
        ],
        schema: UserSchema.KycUpdateSchema,
        handler: UserController.KycUpdate(fastify)
    });

    // Update registered profile media
    fastify.post('/UpdateRegisterProfilemedia', {
        preHandler: [
            fastify.domainauthenticate,
            fastify.ratelimit,
            UserController.ProfileImageUpload
        ],
        
        schema: UserSchema.ProfileImageUpdateSchema,
        handler: UserController.RegisterProfilemedia(fastify)
    });

    fastify.post('/UpdateProfilemedia', {
        preHandler: [
            fastify.domainauthenticate,
            fastify.ratelimit,
            fastify.authenticate,
            fastify.walletauthenticate,
            UserController.ProfileImageUpload
        ],
        schema: UserSchema.UpdateProfileSchema,
        handler: UserController.UpdateProfilemedia(fastify)
    });

    // Google registration
    fastify.post('/GoogleRegister', {
        preHandler: [
            fastify.domainauthenticate,
            fastify.ratelimit
        ],
        schema: UserSchema.GoogleRegisterSchema,
        handler: UserController.GoogleRegister(fastify)
    });

    // Google login
    fastify.post('/GoogleLogin', {
        preHandler: [
            fastify.domainauthenticate,
            fastify.ratelimit
        ],
        schema: UserSchema.GoogleLoginSchema,
        handler: UserController.GoogleLogin(fastify)
    });

    // Facebook registration
    fastify.post('/FacebookRegister', {
        preHandler: [
            fastify.domainauthenticate,
            fastify.ratelimit
        ],
        schema: UserSchema.FacebookRegisterSchema,
        handler: UserController.FacebookRegister(fastify)
    });

    // Facebook login
    fastify.post('/FacebookLogin', {
        preHandler: [
            fastify.domainauthenticate,
            fastify.ratelimit
        ],
        schema: UserSchema.FacebookLoginSchema,
        handler: UserController.FacebookLogin(fastify)
    });

    // Get news list
    fastify.get('/GetNewsList', {
        preHandler: [
            fastify.domainauthenticate,
            fastify.ratelimit
        ],
        schema: UserSchema.NewsSchema,
        handler: UserController.NewsList
    });

    // Logout
    fastify.post('/Logout', {
        // Pre-handlers to execute before the request handler
        preHandler: [
            fastify.domainauthenticate, // Domain authentication
            fastify.ratelimit, // Rate limiting
            fastify.authenticate // User authentication
        ],
        schema: UserSchema.LogoutSchema, // Request schema validation
        handler: UserController.Logout(fastify) // Request handler for logout
    });

  
    done()
}

module.exports = UserRoutes;