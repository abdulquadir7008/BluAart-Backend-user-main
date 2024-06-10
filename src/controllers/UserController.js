const sanitizeHtml = require('sanitize-html');
const Axios = require('axios');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const { OAuth2Client } = require('google-auth-library');
const { Pool } = require('pg');
const Config = require('../Config');
const { v4: Uuidv4 } = require('uuid');
const Multer = require("fastify-multer");

const pool = new Pool(Config.sqldb);

const mime = require('mime-types');
const FormData = require('form-data');

const {
    Schema,
    Recaptchaverify,
    Encrypt,
    ActivityUpdate,
    FileFilter,
    storage,
    videoFileFilter,
    ProfileViews,
    sanitizeObject,
    sanitizeArray,
    NotifySocketCall,
    UploadFlagFile
} = require("../Helper");

const ProfileUpload = Multer({ storage: storage, fileFilter: videoFileFilter });
let ProfileImageUpload = ProfileUpload.fields([
    { name: 'ProfileImage', maxCount: 1 },
    { name: 'coverVideo', maxCount: 1 },
    { name: 'ArtWork', maxCount: 1 }
]);

const KycUpload = Multer({ storage: storage, fileFilter: FileFilter });
const KycImageUpload = KycUpload.fields([
    { name: 'IdentityProof', maxCount: 1 },
    { name: 'AddressProof', maxCount: 1 }
]);

const ImageUpload = Multer({ storage: storage, fileFilter: FileFilter });
let ImageUpdate = ImageUpload.single('Image');

const FlagUpload = Multer({ storage: storage });
let FlagUpdate = FlagUpload.single('Flags');



const getFlagUrl = (code) => {
    const url = `https://${Config.S3.Bucket}.s3.amazonaws.com/uploads/Flags/${code.toLowerCase()}.svg`
    return url;
};

/* Controller to Get Countries with country code and flag */
const GetCountries = async (req, res) => {
    try {
        const countryInfo = await pool.query(`Select id::text, name, dial_code, code from "Country" ORDER BY name ASC `);
       
        if (countryInfo.rowCount > 0) {
            // Sanitize country information and add flag URLs
            const sanitizedCountryInfo = countryInfo.rows.map((country) => ({
                ...country,
                flag: sanitizeHtml(getFlagUrl(country.code)),
            }));

            // Send the sanitized country information as a response
            res.code(200).send({
                status: true,
                info: sanitizedCountryInfo,
            });
        } else {
            // No country information found
            res.code(403).send({
                status: false,
                info: [],
            });
        }
    } catch (error) {
        console.log('error-/getcountrycode', error);
        // Handle and report any errors that occurred
        res.code(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error',
        });
    }
};

// Get Banner Details
const GetBannerDetails = (fastify) => async (req, res) => {
    try {
        // Retrieve landing page details
        let Info = await pool.query('Select _id::text, "updatedAt","Art", "ArtProduct","CorporateCollection","PrivateCollector","Artist","ArtCollection","ArtPageBanner","AuctionBannerImage" from "Banners"');

        res.code(200).send({
            status: true,
            Info: Info.rows,
        });
        return;
    } catch (error) {
        console.log('error-/getBannerdetails', error);
        res.code(500).send({
            status: false,
            info: 'Error Occurred',
            error: 'error',
        });
    }
}

// Get Banner Details
const GetMetamaskDetails = (fastify) => async (req, res) => {
    try {
        // Retrieve landing page details
        let Info = await pool.query(`Select _id::text, "MetamaskETH" AS "Metamasketh" , "MetamaskMatic" AS "Metamask","updatedAt" from "Banners"`)
        res.code(200).send({
            status: true,
            Info: Info.rows,
        });
        return;
    } catch (error) {
        console.log('error-/getMetamaskdetails', error);
        res.code(500).send({
            status: false,
            info: 'Error Occurred',
            error: 'error',
        });
    }
}

const GetInnerBannerDetails = (fastify) => async (req, res) => {
    try {
        // Retrieve landing page details
        const query = `SELECT * FROM "InnerBanners";`;
        const result = await pool.query(query);
        const Info = result.rows;
        res.code(200).send({
            status: true,
            Info: Info,
        });
        return;
    } catch (error) {
        console.log('error-/getBannerdetails', error);
        res.code(500).send({
            status: false,
            info: 'Error Occurred',
            error: 'error',
        });
    }
}

/* Controller to Get Landing Page Details */
const GetLandingPageDetails = async (req, res) => {
    try {

        const info = await pool.query(`SELECT "Section1Image","Section2Description",json_build_object('Image1', "Section2Image1", 'Image2', "Section2Image2", 'Image3',"Section2Image3", 'Image4', "Section2Image4") AS "Section2Images", "Section2Text", "Section2Title", "Section3Description", "Section3Image" , "Section3Text", "Section3Title" from "Landing" where _id=1`);

        const query = `SELECT u._id, u."ProfileName", "ArtistLabels"._id , "ArtistLabels"."Title"  AS  "Label",
            u."ProfilePicture" FROM "Users" u LEFT JOIN "ArtistLabels" ON  u."Label" =  "ArtistLabels"._id WHERE u."FeaturedArtist" = true ORDER BY u._id DESC LIMIT 3;`;
        const result = await pool.query(query);

        const ArtistInfo = result.rows

        if (info) {
            // Sanitize landing page details
            const sanitizedInfo = sanitizeArray(info.rows);
            const sanitizedArtistInfo = sanitizeArray(ArtistInfo)

            // Send the sanitized landing page details as a response
            res.code(200).send({
                status: true,
                info: sanitizedInfo,
                artistinfo: sanitizedArtistInfo
            });
        } else {
            // No landing page details found
            res.code(403).send({
                status: false,
                info: '',
            });
        }
    } catch (error) {
        console.log('error-/getlandingpage', error);

        // Handle and report any errors that occurred
        res.code(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error',
        });
    }
};

const GetAboutusPageDetails = async (req, res) => {
    try {

        const info = await pool.query(`Select _id::text,"Section1Text","Section3Content","Section3Title","Section1Image" from "AboutUs" where _id = '1'`);

        const TeamInfo = await pool.query(`Select _id::text, "Name","Position", "Info", "Instagram", "Linkedin" , "Facebook" , "Image" from "Teams"`);


        if (info) {
            // Sanitize landing page details
            const sanitizedInfo = info.rows;
            const sanitizedTeam = TeamInfo.rows;

            // Send the sanitized landing page details as a response
            res.code(200).send({
                status: true,
                info: sanitizedInfo,
                teaminfo: sanitizedTeam
            });
        } else {
            // No landing page details found
            res.code(403).send({
                status: false,
                info: '',
            });
        }
    } catch (error) {
        console.log('error-/getlandingpage', error);

        // Handle and report any errors that occurred
        res.code(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error',
        });
    }
};

const GetEventsPageDetails = async (req, res) => {
    try {

        const info = await pool.query(`Select _id::text,"Image","Info","Name", TO_CHAR("PublishDate", 'YYYY-MM-DD') AS  "PublishDate" from  "Events" where "Status" = 'Active'`);


        if (info) {
            // Sanitize landing page details
            const sanitizedInfo = sanitizeArray(info.rows);

            // Send the sanitized landing page details as a response
            res.code(200).send({
                status: true,
                info: sanitizedInfo
            });
        } else {
            // No landing page details found
            res.code(403).send({
                status: false,
                info: '',
            });
        }
    } catch (error) {
        console.log('error-/getlandingpage', error);

        // Handle and report any errors that occurred
        res.code(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error',
        });
    }
};

const GetFeaturePageDetails = async (req, res) => {
    try {

        const info = await pool.query(`Select _id::text AS _id, "Name" , "Info" , "Image", TO_CHAR("PublishDate",'YYYY-MM-DD') AS "PublishDate" from "Features" where "Status"= 'Active'`);


        if (info) {
            // Sanitize landing page details
            const sanitizedInfo = sanitizeArray(info.rows);

            // Send the sanitized landing page details as a response
            res.code(200).send({
                status: true,
                info: sanitizedInfo
            });
        } else {
            // No landing page details found
            res.code(403).send({
                status: false,
                info: '',
            });
        }
    } catch (error) {
        console.log('error-/getlandingpage', error);

        // Handle and report any errors that occurred
        res.code(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error',
        });
    }
};

/* Controller to Get User Role */
const GetUserRoles = async (req, res) => {
    try {
        let { Role } = req.body;

        // Sanitize the Role parameter to prevent HTML injection
        Role = sanitizeHtml(Role);

        // Find the user role information based on the sanitized Role
        let userRoleInfo = await pool.query(`Select "Agreement" from "UserRole" where "Role" = '${Role}'`);
        userRoleInfo = userRoleInfo.rows[0];
        if (userRoleInfo) {
            // Sanitize the user role information
            const sanitizedUserRoleInfo = sanitizeObject(userRoleInfo);

            // Send the sanitized user role information as a response with status code 200
            return res.code(200).send({
                status: true,
                info: sanitizedUserRoleInfo,
            });
        } else {
            // No user role information found for the specified Role, send a response with status code 403
            return res.code(403).send({
                status: false,
                info: '',
            });
        }
    } catch (error) {
        console.log('error-/getuserole', error);

        // Handle and report any errors that occurred, send a response with status code 500
        return res.code(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error',
        });
    }
};

const GetCSVSamples = async (req, res) => {
    try {
        let { Type } = req.body;

        Type = sanitizeHtml(Type);

        const getTypeInfoQuery = `
    SELECT *
    FROM "CSVSamples"
    WHERE "Type" = $1
    LIMIT 1;
`;

        const result = await pool.query(getTypeInfoQuery, [Type]);
        const Info = result.rows[0];

        if (Info) {
            // Sanitize the user role information
            const sanitizedInfo = sanitizeObject(Info);

            // Send the sanitized user role information as a response with status code 200
            return res.code(200).send({
                status: true,
                info: sanitizedInfo,
            });
        } else {
            // No user role information found for the specified Role, send a response with status code 403
            return res.code(403).send({
                status: false,
                info: '',
            });
        }
    } catch (error) {
        console.log('error-/getuserole', error);

        // Handle and report any errors that occurred, send a response with status code 500
        return res.code(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error',
        });
    }
};

/* Controller to Get Site Settings */
const GetSiteSettings = async (req, res) => {
    try {
        // Find the site settings information

        const Info = await pool.query(`Select _id::text, 
        json_build_object('Facebook',"Facebook",'Twitter',"Twitter",'Linkedin',"Linkedin",'Pinterest',"Pinterest",'Youtube',"Youtube",'Instagram',"Instagram") AS "SocialLinks", 
        json_build_object('SiteKey',"CaptchaSiteKey",'SecretKey',"CaptchaSecretKey") AS "Captcha",
        json_build_object('Logo',"Logo",'Favicon',"Favicon",'GoogleRecaptchaStatus',"GoogleRecaptchaStatus",'ProjectName',"ProjectName") AS "ProjectDetails",
        json_build_object('GoogleClientId',"GoogleClientId",'GoogleSecret', "GoogleSecret", 'FacebookId',"FacebookId",'FacebookSecret',"FacebookSecret",'AppleId',"AppleId",'AppleSecret',"AppleSecret") AS "SocialLoginDetails"        
        from  "Settings"`);


        return res.status(200).send({
            status: true,
            info: Info.rows,
        });



    } catch (error) {
        console.log('error-/getsitesettings', error);

        // Handle and report any errors that occurred, send a response with status code 500
        return res.status(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error',
        });
    }
};

/* Controller to Get Network Info */
const GetNetworkInfo = async (req, res) => {
    try {

        let { Currency } = req.body;

        // Sanitize the Currency parameter to prevent HTML injection
        Currency = sanitizeHtml(Currency);

        // Find the network information based on the sanitized Currency
        const result = await pool.query('SELECT * FROM "Networks" WHERE "Currency" = $1', [Currency]);
        const networkInfo = result.rows[0];


        if (networkInfo) {
            // Sanitize the network information
            const sanitizedNetworkInfo = sanitizeObject(networkInfo);

            // Send the sanitized network information as a response with status code 200
            return res.status(200).send({
                status: true,
                info: sanitizedNetworkInfo,
            });
        }

        // No network information found for the specified Currency, send a response with status code 403
        return res.status(403).send({
            status: false,
            info: "",
        });
    } catch (error) {
        console.log('error-/getnetworkinfo', error);

        // Handle and report any errors that occurred, send a response with status code 500
        res.status(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error',
        });
    }
};

const GetPageInfo = async (req, res) => {
    try {
        let { Page } = req.body;
        Page = sanitizeHtml(Page);
        const Info = await pool.query(`Select "Content" from "CMS" where "Page" = '${Page}'`);

        if (Info) {
        
            return res.status(200).send({
                status: true,
                info: Info.rows[0].Content,
            });
        }

        return res.status(403).send({
            status: false,
            info: "",
        });
    } catch (error) {
        console.log('error-/getpageinfo', error);

        // Handle and report any errors that occurred, send a response with status code 500
        res.status(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error',
        });
    }
};

/* Controller to Get Media Limit Info */
const GetMediaLimitInfo = async (req, res) => {
    try {
        let { Type } = req.body;

        // Sanitize the Type parameter to prevent HTML injection
        Type = sanitizeHtml(Type);

        // Find the Media Limit information based on the sanitized Type

        const result = await pool.query('SELECT * FROM "MediaLimit" WHERE "Type" = $1', [Type]);
        const Info = result.rows[0];


        if (Info) {
            // Sanitize the Media Limit information
            const sanitizedInfo = sanitizeObject(Info);

            // Send the sanitized Media Limit information as a response with status code 200
            return res.status(200).send({
                status: true,
                info: sanitizedInfo,
            });
        }

        // No network information found for the specified Currency, send a response with status code 403
        return res.status(403).send({
            status: false,
            info: "",
        });
    } catch (error) {
        console.log('error-/getmedialimitinfo', error);

        // Handle and report any errors that occurred, send a response with status code 500
        res.status(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error',
        });
    }
};

/* To Register New User */
const Register = (fastify) => async (req, res) => {
    try {
        let { Email, Password, Terms, Subscription, UserName, Recaptcha } = req.body;

        // Sanitize input data
        Email = Email.toLowerCase().trim();
        Email = sanitizeHtml(Email);
        Password = sanitizeHtml(Password);
        Terms = sanitizeHtml(Terms);
        Subscription = sanitizeHtml(Subscription);
        UserName = UserName.toLowerCase().trim();
        Recaptcha = sanitizeHtml(Recaptcha);

        // Check if the provided username already exists
        let usernameExists = await pool.query(`Select "UserName" from "Users" where "UserName" = '${UserName}'`);

        if (usernameExists.rowCount > 0) {
            return res.code(200).send({
                status: false,
                message: "UserName Already Taken"
            });
        }
        let useremailExists = await pool.query(`Select "Email" from "Users" where "Email" = '${Email}'`);

        if (useremailExists.rowCount > 0) {
            return res.code(200).send({
                status: false,
                message: "Email Already Taken"
            });
        }

        // Validate the password length and format
        if (!Schema.validate(Password)) {
            return res.code(200).send({
                status: false,
                message: "Password length should be at least 10 with a combination of letters and numbers"
            });
        }

        // Check if the terms and conditions are accepted
        if (!Terms) {
            return res.code(200).send({
                status: false,
                message: "Terms & Conditions Not Accepted"
            });
        }
        let settings = await pool.query(`Select "Register" from  "Settings"`);
        if (!settings.rows[0].Register) {
            return res.code(200).send({
                status: false,
                message: "Register Disabled by Admin"
            });
        }
        let userExists = await pool.query(`Select "Email" from "Users" where "Email" = '${Email}'`);
        // Check if the email is already registered
        if (userExists.rowCount > 0) {
            return res.code(200).send({
                status: false,
                message: "Email ID Already Registered"
            });
        }

        //Verify reCAPTCHA if it's active in the project settings
        if (settings.GoogleRecaptchaStatus == 'active') {
            let captchaStatus = await Recaptchaverify(Recaptcha, settings.Captcha.SecretKey);
            if (!captchaStatus) {
                return res.code(200).send({
                    status: false,
                    message: "Recaptcha Verification Failed"
                });
            }
        }

        // Encrypt the password
        let encryptedPassword = await Encrypt(Password);

        // Generate a random OTP
        let OTP = Math.floor(100000 + Math.random() * 900000);

        let userData = {
            "Email": Email,
            "Password": encryptedPassword,
            "Terms": Terms,
            "Subscription": Subscription,
            "UserName": UserName,
            "AuthOTP": OTP
        };

        // Generate a JWT token
        const token = await fastify.jwt.sign(userData, { expiresIn: '24h' });

        // Send registration confirmation email with OTP
        let regEmail = await Axios.post(Config.Services.EmailService + "/RegisterEmail", {
            To: Email,
            OTP: OTP,
            UserName: UserName
        });

        if (regEmail.status) {
            return res.code(200).send({
                status: true,
                message: "Verification OTP has been sent to your email.",
                response: token
            });
        }
    } catch (error) {
        console.log('error-/register', error);
        res.code(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error',
        });
    }
};

/* Resend Register OTP */
const ResendRegisterOTP = (fastify) => async (req, res) => {
    try {
        let { Token } = req.body;

        // Sanitize token
        const sanitizedToken = sanitizeHtml(Token);

        let decodedToken;
        try {
            decodedToken = await fastify.jwt.verify(sanitizedToken);
        } catch (err) {
            res.code(200).send({
                status: false,
                message: "Invalid Token or Token Expired",
            });
            return;
        }

        const { Email, Password, Terms, Subscription, UserName } = await fastify.jwt.verify(sanitizedToken);

        // Check if user already exists
        const existingUser = await pool.query(`Select "Email" from "Users" where "Email" = '${Email}'`);

        if (existingUser.rowCount > 0) {
            res.code(200).send({
                status: false,
                message: "User Already Registered",
            });
            return;
        }

        // Generate a new OTP
        const OTP = Math.floor(100000 + Math.random() * 900000);
        const InsData = {
            "Email": Email,
            "Password": Password,
            "Terms": Terms,
            "Subscription": Subscription,
            "UserName": UserName,
            "AuthOTP": OTP,
        };

        const tokenNew = await fastify.jwt.sign(InsData, { expiresIn: '30m' });

        // Send registration confirmation email with OTP
        const RegEmail = await Axios.post(Config.Services.EmailService + "/RegisterEmail", {
            To: Email,
            OTP: OTP,
            UserName: UserName,
        });

        if (RegEmail.status) {
            res.code(200).send({
                status: true,
                message: "Registration Confirmation OTP Resent",
                response: tokenNew,
            });
            return;
        }
    } catch (error) {
        console.log('error-/registerotpresent', error);
        res.code(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error',
        });
    }
};

/* Registration Confirmation */
const Confirmation = (fastify) => async (req, res) => {
    let { Token, OTP } = req.body;

    Token = sanitizeHtml(Token);
    OTP = sanitizeHtml(OTP);

    try {
        let Tkn;
        try {
            Tkn = await fastify.jwt.verify(Token);
        } catch (err) {
            return res.code(401).send({
                status: false,
                message: "Invalid Token or Token Expired"
            });
        }

        const { Email, Password, Terms, Subscription, UserName, AuthOTP } = await fastify.jwt.verify(Token);

        if (AuthOTP != OTP) {
            return res.code(400).send({
                status: false,
                message: "Incorrect OTP"
            });
        }
        let userExists = await pool.query(`Select "Email" from "Users" where "Email"='${Email}'`);

        if (userExists.rowCount > 0) {
            return res.code(400).send({
                status: true,
                message: "User Already Registered"
            });
        }
        let query = `INSERT INTO "Users" ("Email","Password","Terms","Subscription","Steps","UserName","RegisterMode") Values ($1,$2,$3,$4,$5,$6,$7) RETURNING _id`;
        let values = [Email, Password, Terms, Subscription, 1, UserName, "Normal"];
        let ins = await pool.query(query, values);

        if (ins) {
            let InsData = {
                "Email": Email,
                "UserId": ins.rows[0]._id,
                "Steps": 1,
                "UserName": UserName
            };
            const tokenNew = await fastify.jwt.sign(InsData, { expiresIn: '30m' });

            await ActivityUpdate(req, Email, 'Registration OTP Verification', 'success', '');

            return res.code(200).send({
                status: true,
                message: "OTP Verified",
                response: tokenNew
            });
        } else {
            await ActivityUpdate(req, Email, 'Registration OTP Verification', 'failed', '');

            return res.code(403).send({
                status: false,
                message: "Registration Failed"
            });
        }
    } catch (error) {
        console.log('error-/confirm', error);
        return res.code(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error',
        });
    }
};

/* Role Selection */
const RoleSelect = (fastify) => async (req, res) => {
    let { Auth, Role } = req.body;

    Auth = sanitizeHtml(Auth);
    Role = sanitizeHtml(Role);

    try {
        let roleInfo = await pool.query(`Select _id, "Role" from "UserRole" where "Role" = '${Role}'`)

        if (roleInfo.rowCount < 1) {
            return res.code(400).send({
                status: false,
                message: "Invalid Role"
            });
        }

        let Tkn;
        try {
            Tkn = await fastify.jwt.verify(Auth);
        } catch (err) {
            return res.code(401).send({
                status: false,
                message: "Invalid Token or Token Expired"
            });
        }

        const { Email, UserName, Steps, UserId } = await fastify.jwt.verify(Auth);
        let user = await pool.query(`Select COUNT(*) from "Users" where "Email" = '${Email}' and "UserName" = '${UserName}' and "Steps" = '${Steps}' and _id = '${UserId}'`)

        if (user.rows[0].count < 1) {
            return res.code(400).send({
                status: true,
                message: "Invalid Auth Passed"
            });
        }
        let query = `UPDATE "Users" SET "RoleId" = $1 , "Steps" = 2 WHERE "Email" = '${Email}' AND "UserName" =  '${UserName}'`;
        let values = [roleInfo.rows[0]._id]
        let ins = await pool.query(query, values)


        if (ins) {
            let InsData = {
                "Email": Email,
                "UserId": UserId,
                "Steps": 2,
                "UserName": UserName
            };

            const tokenNew = await fastify.jwt.sign(InsData, { expiresIn: '30m' });

            await ActivityUpdate(req, Email, `Role Selected to ${Role}`, 'success', '');

            return res.code(200).send({
                status: true,
                message: "Role Selected Successfully",
                response: tokenNew
            });
        } else {
            await ActivityUpdate(req, Email, 'Role Selection', 'failed', '');

            return res.code(403).send({
                status: false,
                message: "Role Selection Failed"
            });
        }
    } catch (error) {
        console.log('error-/roleselection', error);
        return res.code(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error',
        });
    }
};

/* Update Address */
const UpdateAddress = (fastify) => async (req, res) => {
    let { Auth, Address1, Address2, State, Pincode, City, CountryCode, Country, MobileNo } = req.body;

    // Sanitize inputs
    Auth = sanitizeHtml(Auth);
    Address1 = sanitizeHtml(Address1);
    Address2 = sanitizeHtml(Address2);
    State = sanitizeHtml(State);
    Pincode = sanitizeHtml(Pincode);
    City = sanitizeHtml(City);
    CountryCode = sanitizeHtml(CountryCode);
    Country = sanitizeHtml(Country);
    MobileNo = sanitizeHtml(MobileNo);

    try {
        let Tkn;
        try {
            Tkn = await fastify.jwt.verify(Auth);
        } catch (err) {
            return res.code(200).send({
                status: false,
                message: "Invalid Token or Token Expired"
            });
        }

        const { Email, UserName, Steps, UserId } = await fastify.jwt.verify(Auth);
        let user = await pool.query(`Select _id, "Email","UserName","Steps", _id from "Users" where "Email"= '${Email}' and "UserName"= '${UserName}' and "Steps" = '${Steps}' and _id = '${UserId}'`)

        if (user.rowCount === 0) {
            return res.code(200).send({
                status: false,
                message: "Invalid Auth Passed"
            });
        }
        let query = `Insert into "Address" ("UserId","CityName","State","AddressLine1","AddressLine2","CountryName","PrimaryAddress","PostalCode","CountryCode","MobileNo") Values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`;
        let values = [user.rows[0]._id, City, State, Address1, Address2, Country, true, Pincode, CountryCode, MobileNo];
        await pool.query(query, values);
        const insertAddressQuery = `
    INSERT INTO "Address" ("UserId", "CityName", "State", "AddressLine1", "AddressLine2", "CountryName", "PrimaryAddress", "PostalCode", "CountryCode", "MobileNo")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
`;

        const addrvalues = [user._id, City, State, Address1, Address2, Country, true, Pincode, CountryCode, MobileNo];
        await pool.query(insertAddressQuery, addrvalues);

        let ins = await pool.query(`UPDATE "Users" SET "Address1" = '${Address1}', "Address2" = '${Address2}' , "City" = '${City}', "State" = '${State}', "Pincode" = '${Pincode}',"Country" = '${Country}', "CountryCode" = '${CountryCode}', "MobileNo" = '${MobileNo}', "Steps" = '3' where "Email" = '${Email}'`)


        if (ins) {


            let InsData = {
                "Email": Email,
                "UserId": UserId,
                "Steps": 3,
                "UserName": UserName
            };

            const tokenNew = await fastify.jwt.sign(InsData, { expiresIn: '30m' });

            await ActivityUpdate(req, Email, 'Address Details Updated Successfully', 'success', '');

            return res.code(200).send({
                status: true,
                message: "Address Details Updated Successfully",
                response: tokenNew
            });
        } else {
            await ActivityUpdate(req, Email, 'Address Updation Failed', 'failed', '');

            return res.code(200).send({
                status: false,
                message: "Address Update Error"
            });
        }
    } catch (error) {
        console.log('error-/updateaddress', error);
        return res.code(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error',
        });
    }
};

/* Update Agreement */
const UpdateAgreement = (fastify) => async (req, res) => {
    try {
        const { Auth, Agreement } = req.body;

        // Sanitize inputs
        const sanitizedAuth = sanitizeHtml(Auth);
        const sanitizedAgreement = sanitizeHtml(Agreement);

        if (!sanitizedAgreement) {
            res.code(200).send({
                status: false,
                message: "Agreement Not Accepted",
            });
            return;
        }

        let token;
        try {
            token = await fastify.jwt.verify(sanitizedAuth);
        } catch (err) {
            res.code(401).send({
                status: false,
                message: "Invalid Token or Token Expired",
            });
            return;
        }

        const { Email, UserName, Steps, UserId } = await fastify.jwt.verify(sanitizedAuth);

        // Check if the user exists
        const alreadyUser = await pool.query(`Select "Email","UserName","Steps",_id from "Users" where "Email" = '${Email}' and "UserName" =  '${UserName}' and "Steps" = '${Steps}' and  _id = '${UserId}'`)

        if (alreadyUser.rowCount === 0) {
            res.code(200).send({
                status: false,
                message: "Invalid Auth Passed",
            });
            return;
        }

        // Update the agreement and steps for the user
        const updateResult = await pool.query(`Update "Users" SET  "Agreement" = '${sanitizedAgreement}', "Steps" = 4 where "Email" = '${Email}' and  "UserName" = '${UserName}'`)


        if (updateResult) {
            const InsData = {
                "Email": Email,
                "UserId": UserId,
                "Steps": 4,
                "UserName": UserName,
            };

            const tokenNew = await fastify.jwt.sign(InsData, { expiresIn: '30m' });

            await ActivityUpdate(req, Email, 'Agreement Updated Successfully', 'success', '');

            res.code(200).send({
                status: true,
                message: "Agreement Updated Successfully",
                response: tokenNew,
            });
            return;
        } else {
            await ActivityUpdate(req, Email, 'Agreement Updation Failed', 'failed', '');

            res.code(200).send({
                status: false,
                message: "Agreement Update Error",
            });
            return;
        }
    } catch (error) {
        console.log('error-/updateagreement', error);
        res.code(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error',
        });
    }
};

/* Role Based Users */
const RoleBasedUsers = (fastify) => async (req, res) => {

    let { Role, Style } = req.body;

    // Sanitize input values
    Style = sanitizeHtml(Style);
    Role = sanitizeHtml(Role);


    try {
        const query = `
            SELECT
                u._id,
                u."ProfilePicture",
                u."ProfileName"
            FROM
                "Users" u
            INNER JOIN "UserRole" ON u."RoleId" = "UserRole"._id
            WHERE
            "UserRole"."Role" = '${Role}' AND
                u."AccountStatus" = 1 AND
                u."Steps" = 6 AND               
                ${Style} = ANY (u."Styles")               
            ORDER BY
                u._id DESC;
        `;

        const result = await pool.query(query);
        let responseResult = {
            info : result.rows
        }
        return responseResult;
    } catch (error) {
        console.error('Error fetching role-based users:', error);
        throw error;
    }
};

const LabelBasedUsers = (fastify) => async (req, res) => {

    let { Label } = req.body;

    try {

        const query = `
            SELECT
                u._id,
                u."ProfileName",
                u."ProfilePicture",
                "ArtistLabels"."Title"
            FROM
                "Users" u
            LEFT JOIN "ArtistLabels" ON u."Label" = "ArtistLabels"._id
            WHERE
                u."Label" = $1 AND
                u."AccountStatus" = 1 AND
                u."Steps" = 6
            ORDER BY
                u._id DESC;
        `;

        const values = [Label];
        const result = await pool.query(query, values);

        const labelNameGet = await pool.query(`Select "Title" from "ArtistLabels" where _id = '${Label}'`)

        res.code(200).send({
            status: true,
            info: result.rows,
            lableName : labelNameGet.rows[0].Title
        });

    } catch (error) {
        console.log('error-/rolebasedusers', error);
        return res.code(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error',
        });
    }
};

/* Login Process */
const Login = (fastify) => async (req, res) => {
    try {
        let { Email, Password, Recaptcha } = req.body;

        // Sanitize input values
        const sanitizedEmail = sanitizeHtml(Email);
        const sanitizedPassword = sanitizeHtml(Password);
        const sanitizedRecaptcha = sanitizeHtml(Recaptcha);

        // Trim and convert email to lowercase
        const email = sanitizedEmail.toLowerCase().trim();
        const password = Encrypt(sanitizedPassword);

        // Retrieve login settings from the database
        let Settings = await pool.query(`Select "Login", jsonb_build_object('GoogleRecaptchaStatus',"GoogleRecaptchaStatus") AS "ProjectDetails",jsonb_build_object('SecretKey',"CaptchaSecretKey") AS "Captcha" from "Settings" where _id = 1`)
        Settings = Settings.rows[0];
        if (!Settings.Login) {
            // Login is disabled by the admin
            res.code(200).send({
                status: false,
                response: "Login Disabled by Admin",
            });
            return;
        }

        if (Settings.ProjectDetails.GoogleRecaptchaStatus === 'active') {
            //Verify reCAPTCHA if it is active
            let captchaStatus = await Recaptchaverify(sanitizedRecaptcha, Settings.Captcha.SecretKey);
            if (!captchaStatus) {
                // ReCAPTCHA verification failed
                res.code(200).send({
                    status: false,
                    response: "Recaptcha Verification Failed",
                });
                return;
            }
        }
        // Find the user based on the provided email
        let Alrdy_User = await pool.query(`Select "Password","Email","Users"._id As "UserId", "Steps", "UserName" , "KycStatus" ,"AccountStatus" , "Enable2FA" , "UserRole"."Role" AS "Role" from "Users" LEFT JOIN "UserRole" ON "Users"."RoleId" = "UserRole"._id where "Email" = '${email}'`)

        Alrdy_User = Alrdy_User.rows[0];
        if (!Alrdy_User) {
            // User is not registered
            res.code(200).send({
                status: false,
                response: "Not a Registered User",
            });
            return;
        }

        if (Alrdy_User && Alrdy_User.Password !== password) {
            // Invalid credentials provided
            await ActivityUpdate(req, email, 'Login Failed', 'fail', 'Invalid Credentials');
            res.code(200).send({
                status: false,
                response: "Invalid Credentials",
            });
            return;
        }

        // Prepare user data for token generation
        let InsData = {
            "Email": Alrdy_User.Email,
            "UserId": Alrdy_User.UserId,
            "Steps": Alrdy_User.Steps,
            "UserName": Alrdy_User.UserName,
        };

        // Generate tokens with expiration time of 30 minutes
        const Tokennw = await fastify.jwt.sign(InsData, { expiresIn: '30m' });
        const Token = fastify.jwt.sign({ "Email": Alrdy_User.Email }, { expiresIn: '30m' });

        if (Alrdy_User.Steps === 6) {
            if (Alrdy_User.KycStatus === "Pending" || Alrdy_User.KycStatus === "pending") {
                // User's KYC is pending for admin approval
                await ActivityUpdate(req, email, 'Login Failed', 'fail', 'Account Identity Proof Awaiting For Admin Approval');
                res.code(200).send({
                    status: false,
                    response: "Account Identity Proof Awaiting For Admin Approval",
                });
                return;
            }

            if (Alrdy_User.AccountStatus === 0) {
                // User's account is awaiting admin approval
                await ActivityUpdate(req, email, 'Login Failed', 'fail', 'Account Awaiting For Admin Approval');
                res.code(200).send({
                    status: false,
                    response: "Account Awaiting For Admin Approval",
                });
                return;
            }
            if (Alrdy_User.Enable2FA) {

                // User has enabled 2FA
                let OTP = Math.floor(100000 + Math.random() * 900000);
                let OTP_Verify_Email = await Axios.post(Config.Services.EmailService + "/Login2FAVerifyEmail", {
                    To: email,
                    OTP: OTP,
                });
                let InssData = {
                    "UserId": Alrdy_User.UserId,
                    "AuthOTP": OTP,
                };

                const Tokennnw = await fastify.jwt.sign(InssData, { expiresIn: '30m' });

                if (OTP_Verify_Email.status) {
                    res.code(200).send({
                        status: true,
                        token: Tokennnw,
                        response: "2FA Code Sent to Registered Mail"
                    });
                    return;
                } else {
                    res.code(500).send({
                        status: false,
                        response: ""
                    });
                    return;
                }
            }

            res.code(200).send({
                status: true,
                Enable2FA: Alrdy_User.Enable2FA,
                token: Token,
                UserId: Alrdy_User.UserId,
                UserName: Alrdy_User.UserName,
                response: "Login success"
            });
            return;
        } else if(Alrdy_User.Steps === 5 && Alrdy_User.AccountStatus === 1) {
            res.code(200).send({
                status: true,
                token: Tokennw,
                role: Alrdy_User.Role,
                UserId: Alrdy_User.UserId,
                Steps: Alrdy_User.Steps,
                response: "Please update your profile",
            });
            return;
        }else {
            res.code(200).send({
                status: true,
                token: Tokennw,
                role: Alrdy_User.Role,
                UserId: Alrdy_User.UserId,
                Steps: Alrdy_User.Steps,
            });
            return;
        }



    } catch (error) {
        console.log('error-/login', error);
        res.code(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error',
        });
    }

}

/* Login 2FA Verification */

const Verify2FA = (fastify) => async (req, res) => {
    try {
        let { Token, OTP } = req.body;
        // Sanitize input values
        const sanitizedToken = sanitizeHtml(Token);

        let Tkn;
        try {
            Tkn = await fastify.jwt.verify(sanitizedToken);
        } catch (err) {
            // Token has expired
            res.code(400).send({
                status: false,
                response: "OTP Expired",
            });
            return;
        }

        const { UserId, AuthOTP } = await fastify.jwt.verify(sanitizedToken);

        if (AuthOTP !== OTP) {
            // Incorrect OTP provided
            res.code(400).send({
                status: false,
                response: "Incorrect OTP",
            });
            return;
        }

        // Find the user based on the provided UserId


        let Alrdy_User = (await pool.query('SELECT * FROM "Users" WHERE "_id" = $1 LIMIT 1;', [UserId])).rows[0];


        // Prepare user data for token generation
        let InsData = {
            "Email": Alrdy_User.Email,
            "UserId": Alrdy_User._id,
            "Steps": Alrdy_User.Steps,
            "UserName": Alrdy_User.UserName,
        };

        // Generate tokens with expiration time of 30 minutes
        const Tokennw = await fastify.jwt.sign(InsData, { expiresIn: '30m' });
        const Tokenn = fastify.jwt.sign({ "Email": Alrdy_User.Email }, { expiresIn: '30m' });

        if (Alrdy_User.Steps === 6) {
            if (Alrdy_User.KycStatus === "Pending" || Alrdy_User.KycStatus === "pending") {
                // User's KYC is pending for admin approval
                await ActivityUpdate(req, Alrdy_User.Email, 'Login Failed', 'fail', 'Account Identity Proof Awaiting For Admin Approval');
                res.code(200).send({
                    status: false,
                    response: "Account Identity Proof Awaiting For Admin Approval",
                });
                return;
            }

            if (Alrdy_User.AccountStatus === 0) {
                // User's account is awaiting admin approval
                await ActivityUpdate(req, Alrdy_User.Email, 'Login Failed', 'fail', 'Account Awaiting For Admin Approval');
                res.code(200).send({
                    status: false,
                    response: "Account Awaiting For Admin Approval",
                });
                return;
            }

            res.code(200).send({
                status: true,
                token: Tokenn,
                role: Alrdy_User.Role,
                UserName: Alrdy_User.UserName,
                UserId: Alrdy_User._id,
                response: "Login success",
            });
            return;
        } else {
            res.code(200).send({
                status: true,
                token: Tokennw,
                UserId: Alrdy_User._id,
                UserName: Alrdy_User.UserName,
                Steps: Alrdy_User.Steps,
                role: Alrdy_User.Role
            });
            return;
        }
    } catch (error) {
        console.log('error-/verify2fA', error);
        res.code(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error',
        });
    }
}

/* To Get Password Update Link if Forgot */
const ForgotPassword = (fastify) => async (req, res) => {
    try {
        const { Email, Recaptcha } = req.body;

        // Sanitize input values (you might want to do this in your application)
        const sanitizedEmail = Email.toLowerCase().trim();
        const sanitizedRecaptcha = Recaptcha;

        // Find user information based on the email
        const userInfoQuery = 'SELECT * FROM "Users" WHERE "Email" = $1 LIMIT 1';
        const userInfoResult = await pool.query(userInfoQuery, [sanitizedEmail]);
        const usrInfo = userInfoResult.rows[0];

        if (!usrInfo) {
            res.status(200).send({
                status: false,
                message: 'Not a Registered Email ID',
            });
            return;
        }

        // Fetch project settings (you would need to store settings in the database)
        const settingsQuery = 'SELECT * FROM "Settings" LIMIT 1';
        const settingsResult = await pool.query(settingsQuery);
        const settings = settingsResult.rows[0];

        if (settings.GoogleRecaptchaStatus === 'active') {
            // Verify reCAPTCHA if it is active (you would need to implement this)
            const captchaStatus = await Recaptchaverify(sanitizedRecaptcha, settings.CaptchaSecretKey);
            if (!captchaStatus) {
                res.status(200).send({
                    status: false,
                    message: 'Recaptcha Verification Failed',
                });
                return;
            }
        }

        // Generate a reset token and set its expiration time
        const resetToken = Uuidv4(); // You would need to implement this
        const resetTokenExpiresAt = new Date(Date.now() + 900 * 1000); // 15 mins

        // Update the user's reset token and expiry in the database
        const updateQuery = 'UPDATE "Users" SET "ResetToken" = $1, "ResetExpiry" = $2 WHERE "Email" = $3';
        await pool.query(updateQuery, [resetToken, resetTokenExpiresAt, sanitizedEmail]);

        let org = req.headers['origin'];

        let ResetUrl = org + '/reset-password/' + resetToken;

        // Send the password reset email to the user (you would need to implement this)
        let ResetEmail = await Axios.post(Config.Services.EmailService + "/ResetPasswordEmail", {
            To: sanitizedEmail,
            ResetUrl: ResetUrl,
        });
        if (ResetEmail.status) {
            res.status(200).send({
                status: true,
                message: 'Password Reset Email Sent',
            });
            return;
        }


    } catch (error) {
        console.log('error-/forgotpassword', error);
        res.code(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error',
        });
    }
};

/* To Reset Password */
const ResetPassword = async (req, res) => {
    try {
        let { ResetToken, NewPassword } = req.body;

        // Sanitize input values (you might want to do this in your application)
        const sanitizedResetToken = ResetToken;
        const sanitizedNewPassword = NewPassword;

        // Find the user based on the reset token and check its validity
        const userQuery = `
            SELECT * 
            FROM "Users" 
            WHERE "ResetToken" = $1 
            AND "ResetExpiry" > NOW() 
            LIMIT 1;
        `;
        const userResult = await pool.query(userQuery, [sanitizedResetToken]);
        const user = userResult.rows[0];

        if (!user) {
            return res.status(200).send({
                status: false,
                message: "Invalid or Expired Reset Token",
            });
        }

        // Validate the new password using a schema (you would need to implement this)
        if (!Schema.validate(sanitizedNewPassword)) {
            res.status(400).send({
                status: false,
                message: "Password length should be at least 10 with a combination of letters and numbers",
            });
            return;
        }

        // Update the user's password and reset token in the database
        const updateQuery = `
            UPDATE "Users" 
            SET "Password" = $1, "ResetToken" = $2, "ResetExpiry" = $3 
            WHERE "ResetToken" = $4;
        `;
        await pool.query(updateQuery, [Encrypt(sanitizedNewPassword), '', '1970-01-01 00:00:00', sanitizedResetToken]);

        return res.status(200).send({
            status: true,
            message: "Password Reset Successful",
        });
    } catch (error) {
        console.log('error-/resetpassword', error);
        res.code(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error',
        });
    }
};

/* To connect wallet */
const WalletConnect = (fastify) => async (req, res) => {
    let { WalletAddress } = req.body;

    // Sanitize wallet address
    const sanitizedWalletAddress = sanitizeHtml(WalletAddress);

    const walletAddress = sanitizedWalletAddress.toLowerCase();

    try {
        let DupInfo = await pool.query(`Select "WalletAddress" from "Users" where "WalletAddress" = '${walletAddress}' AND "Email" != '${req.user.Email}'`);


        if (DupInfo.rowCount > 0) {
            res.code(200).send({
                status: false,
                info: "Wallet Already Get Linked to Another Account",
            });
            return;
        }
        let UserInfo = await pool.query(`Select "Users".*,"UserRole"."Role" from "Users" INNER JOIN "UserRole" ON "Users"."RoleId" =  "UserRole"._id where "Email" = '${req.user.Email}'`)
        UserInfo = UserInfo.rows[0];

        if (UserInfo) {
            if (!UserInfo.WalletAddress || UserInfo.WalletAddress === "") {
                await pool.query(`Update "Users" Set "WalletAddress" = '${walletAddress}' where "Email" = '${req.user.Email}'`);

            }

            if (UserInfo.WalletAddress && UserInfo.WalletAddress !== walletAddress) {
                res.code(200).send({
                    status: false,
                    info: "Please Connect With Appropriate Wallet Address",
                });
                return;
            }

            const Token = fastify.jwt.sign({ "Email": UserInfo.Email, "UserId": UserInfo._id, "Role": UserInfo.Role, "WalletAddress": walletAddress }, { expiresIn: '3h' });

            await ActivityUpdate(req, UserInfo.Email, 'Wallet Connect', 'success', '');
            await NotifySocketCall(fastify, UserInfo._id);

            res.setCookie('token', Token, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
            });

            req.session.user = UserInfo;

            res.code(200).send({
                status: true,
                token: Token,
                role: UserInfo.Role,
                info: "Wallet Connection Successful",
            });
        } else {
            res.code(403).send({
                status: false,
                info: "",
            });
            return;
        }
    } catch (error) {
        console.log('error-/walletconnect', error);
        res.code(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error',
        });
    }
};

/* To Get ProfileInfo */
const ProfileInfo = async (req, res) => {
    try {
        const query = `SELECT "Email", "WalletAddress", "UserName",
                "ProfileName", "RoleId", "UrlLink", "Styles", "Medium",
                "Enable2FA", "Label", "ProfilePicture", "CoverVideo",
                "ArtWork" FROM "Users" WHERE "Email" = $1 ORDER BY _id DESC
            LIMIT 1;`;
        const values = [req.user.Email];

        const result = await pool.query(query, values);

        if (result.rows.length > 0) {
            const userInfo = result.rows;
            res.status(200).send({
                status: true,
                info: userInfo,
            });
        } else {
            res.status(403).send({
                status: false,
                info: "",
            });
        }
    } catch (error) {
        console.log('error-/profileinfo', error);
        res.status(500).send({
            status: false,
            message: 'Error Occurred',
            error: error.message,
        });
    }
};


const NewsInfo = async (req, res) => {
    try {

        let { NewsId } = req.body;
        let Info = await pool.query(`Select 
        json_build_object(
            '_id',"News"._id::text,
            'Title',"News"."Title",
            'Content',"News"."Content",
            'Image',"News"."Image",
            'Author',"News"."AuthorId"::text
        )AS "NewsInfo" , 
        json_build_object(
            'Name',"NewsAuthor"."Name",
            'Image',"NewsAuthor"."Image",
            'Content',"NewsAuthor"."Content"
        ) AS "UserInfo" 
        from "News" 
        LEFT JOIN "NewsAuthor" ON "News"."AuthorId" = "NewsAuthor"._id where "News"._id = ${NewsId}`);
      

        if (Info) {

            Info = sanitizeArray(Info.rows);

            res.code(200).send({
                status: true,
                info: Info,
            });
        } else {
            res.code(403).send({
                status: false,
                info: "",
            });
        }
    } catch (error) {
        console.log('error-/profileinfo', error);
        res.code(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error',
        });
    }
};



/* To Get Artist Info */
const ArtistInfo = async (req, res) => {
    try {
        let { UserId } = req.body;

        // Sanitize the UserId value

        let BioInfo = await pool.query(`SELECT "Overview", "Inspired" FROM "Bio" WHERE "UserId" = '${UserId}' AND "Status" = 'Active'`);
        BioInfo = BioInfo.rows[0];

        const query = `SELECT "Title", "Type", "Year", "Institude", "Location", "Image" FROM "Exhibitions"
        WHERE "UserId" = $1 AND "Status" = 'Active'`;
        const values = [UserId];
        const result = await pool.query(query, values);
        const EventInfo = result.rows;

        const mquery = `SELECT "Title", "Type", "Year",        "Description", "Published", "Link", "Author",           "Image" FROM "Medias" WHERE "UserId" = $1 AND "Status" = 'Active'`;
        const mvalues = [UserId];
        const mresult = await pool.query(mquery, mvalues);
        const MediaInfo = mresult.rows;

        const testimonialInfoQuery = `SELECT "Provider", "Description" FROM "Testimonials" WHERE "UserId" = $1 AND "Status" = 'Active';`;
        const TestimonialInfo = await pool.query(testimonialInfoQuery, [UserId]);

        const uquery = `SELECT u._id, u."UserName",  u."ProfilePicture",  u."ProfileName",  ur."Role" AS "Role" FROM "Users" u LEFT JOIN "UserRole" ur ON u."RoleId" = ur._id WHERE u._id = $1;`;
        const uresult = await pool.query(uquery, [UserId]);
        const UInfo = uresult.rows[0];

        const Iquery = `SELECT ai._id AS "_id", ai."Thumb" AS "Thumb",
        ai."Media" AS "Media" FROM "ArtItems" ai WHERE ai."AuthorId" = $1 ORDER BY ai._id DESC;`;
        const Iresult = await pool.query(Iquery, [UserId]);
        const ItemInfo = Iresult.rows;


        let Info = [];

        let UserInfo = {
          
            UserInfo:{
              _id: UInfo._id,
              UserName: UInfo.UserName,
              ProfilePicture: UInfo.ProfilePicture,
              ProfileName: UInfo.ProfileName,
              Role: UInfo.Role,
              BioInfo: BioInfo || "",
              EventInfo: EventInfo || "",
              MediaInfo: MediaInfo || "",
              TestimonialInfo: TestimonialInfo || ""
            }
            
        }

        Info.push(UserInfo);

        const sanitizedInfo = sanitizeArray(Info);
        const sanitizedItemInfo = sanitizeArray(ItemInfo);

        // Update profile views for the artist
        await ProfileViews(req, UserId);

        res.code(200).send({
            status: true,
            message: "Artist details get successfully",
            userdata: sanitizedInfo,
            itemdata: sanitizedItemInfo
        });
    } catch (error) {
        console.log('error-/profileinfo', error);
        res.code(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error',
        });
    }
};



const NotificationList = async (req, res) => {
    try {
        const UserId = req.user.UserId;

        // Fetch notification details along with user and item details
        const query = `SELECT nm.*, u."UserName" AS "ToUserName",
                u."Email" AS "ToEmail",  u._id AS "ToUserId", i."Title" AS "ItemName", i."Thumb" AS "ItemImage", i."Currency" FROM "Notifications" nm LEFT JOIN
                "Users" u ON nm."UserId" = u._id  LEFT JOIN
                "ArtItems" i ON nm."ItemId" = i._id WHERE
                nm."UserId" = $1;
        `;
        const result = await pool.query(query, [UserId]);
        const InfoWithDetails = result.rows;

        if (!InfoWithDetails.length) {
            return res.code(200).send({
                status: false,
                info: [],
                count: 0,
            });
        }

        // Update notification status to 'Read'
        const updateQuery = `
            UPDATE "Notifications"
            SET "Status" = 'Read'
            WHERE "UserId" = $1;
        `;
        await pool.query(updateQuery, [UserId]);

        res.code(200).send({
            status: true,
            info: InfoWithDetails
        });
    } catch (error) {
        console.log("error-/getnotificationlist", error);
        res.code(500).send({
            status: false,
            message: "Error Occurred",
            error: "error",
        });
    }
};


// Add Bio
const AddBio = async (req, res) => {
    try {
        const { Overview, Inspired } = req.body;
        const ownerId = req.user.UserId;

        const existingBio = await pool.query('SELECT * FROM "Bio" WHERE "UserId" = $1 ORDER BY _id DESC LIMIT 1', [ownerId]);

        if (existingBio.rows.length > 0) {
            // Update existing bio information
            await pool.query('UPDATE "Bio" SET "Overview" = $1, "Inspired" = $2, "Status" = $3 WHERE _id = $4', [Overview, Inspired, 'InActive', existingBio.rows[0].id]);

            res.status(200).send({
                status: true,
                message: 'Bio Info Updated Successfully. Info Will Get Displayed After Admin Approval',
            });
        } else {
            // Create new bio information
            await pool.query('INSERT INTO "Bio" ("Overview", "Inspired", "UserId", "Status") VALUES ($1, $2, $3, $4)', [Overview, Inspired, ownerId, 'Active']);

            res.status(200).send({
                status: true,
                message: 'Bio Info Added Successfully. Info Will Get Displayed After Admin Approval',
            });
        }
    } catch (error) {
        console.error('Error - /addbio', error);
        res.status(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error',
        });
    }
};

// Get Bio
const GetBio = async (req, res) => {
    try {
        const ownerId = req.user.UserId;
        const query = 'SELECT * FROM "Bio" WHERE "UserId" = $1 AND "Status" = $2 ORDER BY _id DESC LIMIT 1';
        const values = [ownerId, 'Active'];

        const result = await pool.query(query, values);

        if (result.rows.length > 0) {
            const bioInfo = sanitizeObject(result.rows[0]); // You would define the sanitizeObject function

            res.status(200).send({
                status: true,
                info: bioInfo,
            });
        } else {
            res.status(200).send({
                status: false,
                info: {},
            });
        }
    } catch (error) {
        console.error('Error - /getbio', error);
        res.status(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error',
        });
    }
};

// Delete Bio
const DeleteBio = async (req, res) => {
    try {
        const ownerId = req.user.UserId;

        const bioInfo = await pool.query('SELECT * FROM "Bio" WHERE "UserId" = $1 ORDER BY _id DESC LIMIT 1', [ownerId]);

        if (!bioInfo.rows.length) {
            res.status(200).send({
                status: false,
                message: 'No Bio Information Available',
            });
            return;
        }

        const deleteResult = await pool.query('DELETE FROM "Bio" WHERE "UserId" = $1', [ownerId]);

        if (deleteResult.rowCount > 0) {
            res.status(200).send({
                status: true,
                message: 'Bio Info Deleted Successfully',
            });
        } else {
            res.status(200).send({
                status: false,
                message: 'Error in Delete Bio',
            });
        }
    } catch (error) {
        console.error('Error - /deletebio', error);
        res.status(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error',
        });
    }
};

// Add Testimonials
const AddTestimonials = async (req, res) => {
    try {
        let { Provider, Description } = req.body;

        // Check if the testimonial already exists
        const checkTestimonialQuery = `
            SELECT *
            FROM "Testimonials" 
            WHERE "Provider" = $1 AND "Description" = $2 
            LIMIT 1;
        `;
        const checkResult = await pool.query(checkTestimonialQuery, [Provider, Description]);

        if (checkResult.rowCount > 0) {
            res.status(200).send({
                status: false,
                message: "Duplicate Testimonial"
            });
            return;
        }

        // Sanitize input values (you might want to do this in your application)
        Provider = sanitizeHtml(Provider);
        Description = sanitizeHtml(Description);

        // Insert new testimonial
        const insertQuery = `
            INSERT INTO "Testimonials" ("Provider", "Description", "UserId", "Status") VALUES ($1, $2, $3, 'Inactive');`;
        const insertResult = await pool.query(insertQuery, [Provider, Description, req.user.UserId]);

        if (insertResult.rowCount > 0) {
            res.status(200).send({
                status: true,
                message: "Testimonials Added Successfully. Will get Display Once Admin Approved it"
            });
        } else {
            res.status(200).send({
                status: false,
                message: "Error in Add Testimonials"
            });
        }
    } catch (error) {
        console.error('Error - /addtestimonials', error);
        res.status(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error',
        });
    }
};


// Get Testimonials
const GetTestimonials = async (req, res) => {
    try {
        const getTestimonialsQuery = `
            SELECT * 
            FROM "Testimonials" 
            WHERE "UserId" = $1 AND "Status" = 'Active'
            ORDER BY _id DESC;
        `;

        const result = await pool.query(getTestimonialsQuery, [req.user.UserId]);

        if (result.rowCount > 0) {
            res.status(200).send({
                status: true,
                info: result.rows
            });
        } else {
            res.status(200).send({
                status: false,
                info: []
            });
        }
    } catch (error) {
        console.error('Error - /gettestimonials', error);
        res.status(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error',
        });
    }
};


// Get One Testimonial
const GetOneTestimonial = async (req, res) => {
    try {
        const testimonialId = req.body.Id; // Replace with the actual testimonial ID

        const getTestimonialQuery = `
            SELECT *
            FROM "Testimonials"
            WHERE "_id" = $1;
        `;

        try {
            const result = await pool.query(getTestimonialQuery, [testimonialId]);

            if (result.rowCount > 0) {
                const testimonialInfo = result.rows[0];
                // Use testimonialInfo as needed
                res.code(200).send({
                    status: true,
                    message: "Testimonial Info Available",
                    Info: testimonialInfo
                });
            } else {
                res.code(200).send({
                    status: false,
                    message: "No Testimonial Available"
                });
            }
        } catch (error) {
            console.error('Error - Getting testimonial info', error);
            res.code(500).send({
                status: false,
                message: 'Error Occurred',
                error: 'error',
            });
        }

    } catch (error) {
        console.log('error-/addbio', error);
        res.code(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error',
        });
    }
};

// Edit Testimonials
const EditTestimonials = async (req, res) => {
    try {
        const { Provider, Description, Id } = req.body;

        const updateTestimonialQuery = `
    UPDATE "Testimonials"
    SET "Provider" = $1, "Description" = $2, "Status" = "Inactive"
    WHERE "_id" = $3;
`;

        try {
            const result = await pool.query(updateTestimonialQuery, [Provider, Description, Id]);

            if (result.rowCount > 0) {
                res.code(200).send({
                    status: true,
                    message: "Testimonial Updated Successfully. Will get Display Once Admin Approved it"
                });
            } else {
                res.code(200).send({
                    status: false,
                    message: "Error in Update Testimonial"
                });
            }
        } catch (error) {
            console.error('Error - Updating testimonial', error);
            res.code(500).send({
                status: false,
                message: 'Error Occurred',
                error: 'error',
            });
        }

    } catch (error) {
        console.log('error-/updatetestimonials', error);
        res.code(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error',
        });
    }
};

// Delete Testimonials
const DeleteTestimonials = async (req, res) => {
    try {
        const deleteTestimonialQuery = `
            DELETE FROM "Testimonials" 
            WHERE "_id" = $1;
        `;

        const result = await pool.query(deleteTestimonialQuery, [req.body.Id]);

        if (result.rowCount > 0) {
            res.status(200).send({
                status: true,
                message: "Testimonials Deleted Successfully"
            });
        } else {
            res.status(200).send({
                status: false,
                message: "No Testimonial Available"
            });
        }
    } catch (error) {
        console.error('Error - /deletetestimonials', error);
        res.status(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error',
        });
    }
};


// Add Exhibition
const AddExhibitions = async (req, res) => {
    try {
        const { Title, Type, Year, Institude, Location, Image } = req.body;

        const alreadyExistsQuery = `
            SELECT * FROM "Exhibitions"
            WHERE "Title" = $1 AND "Type" = $2 AND "Year" = $3
        `;

        const result = await pool.query(alreadyExistsQuery, [Title, Type, Year]);

        if (result.rowCount > 0) {
            res.status(200).send({
                status: false,
                message: "Duplicate Exhibition"
            });
            return;
        }

        const insertQuery = `
            INSERT INTO "Exhibitions" ("Title", "Type", "Year", "Institude", "Location", "Image", "UserId", "Status")
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'Inactive')
        `;

        await pool.query(insertQuery, [Title, Type, Year, Institude, Location, Image, req.user.UserId]);

        res.status(200).send({
            status: true,
            message: "Exhibition Added Successfully. Will get Display Once Admin Approved it"
        });
    } catch (error) {
        console.log('error-/addexhibition', error);
        res.status(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error'
        });
    }
};

// Get Exhibitions
const GetExhibitions = async (req, res) => {
    try {

        try {
            const query = `
                SELECT * FROM "Exhibitions"
                WHERE "UserId" = $1 AND "Status" = 'Active'
                ORDER BY "_id" DESC
            `;

            const result = await pool.query(query, [req.user.UserId]);

            if (result.rowCount > 0) {
                const sanitizedInfo = result.rows.map(row => ({
                    Title: row.Title,
                    _id: row._id,
                    Institude: row.Institude,
                    Author: row.Author,
                    Location: row.Location,
                    Type: row.Type,
                    Year: row.Year,
                    Link: row.Link,
                    Image: row.Image
                }));

                res.status(200).send({
                    status: true,
                    info: sanitizedInfo
                });
            } else {
                res.status(200).send({
                    status: false,
                    info: []
                });
            }
        } catch (error) {
            console.log('error-/getexhibitions', error);
            res.status(500).send({
                status: false,
                message: 'Error Occurred',
                error: 'error'
            });
        }

    } catch (error) {
        console.log('error-/getexhibitions', error);
        res.code(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error',
        });
    }
};

// Get One Exhibition
const GetOneExhibition = async (req, res) => {
    try {
        const query = `
            SELECT * 
            FROM "Exhibitions"
            WHERE "_id" = $1
        `;

        const result = await pool.query(query, [req.body.Id]);

        if (result.rowCount > 0) {
            const exhibition = result.rows[0];

            // Sanitize exhibition info
            const sanitizedInfo = {
                Title: exhibition.Title,
                _id: exhibition._id,
                Institude: exhibition.Institude,
                Author: exhibition.Author,
                Location: exhibition.Location,
                Type: exhibition.Type,
                Year: exhibition.Year,
                Link: exhibition.Link,
                Image: exhibition.Image
            };

            res.status(200).send({
                status: true,
                message: "Exhibition Info Available",
                Info: sanitizedInfo
            });
        } else {
            res.status(200).send({
                status: false,
                message: "No Exhibition Available"
            });
        }
    } catch (error) {
        console.log('error-/getoneexhibition', error);
        res.status(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error'
        });
    }
};

// Edit Exhibition
const EditExhibitions = async (req, res) => {
    try {
        const { Title, Type, Year, Institude, Location, Image, Id } = req.body;

        const query = `
            UPDATE "Exhibitions"
            SET "Title" = $1, "Type" = $2, "Year" = $3, "Institude" = $4,
                "Location" = $5, "Status" = 'Inactive', "Image" = $6
            WHERE "_id" = $7
        `;

        const values = [Title, Type, Year, Institude, Location, Image, Id];

        const result = await pool.query(query, values);

        if (result.rowCount > 0) {
            res.status(200).send({
                status: true,
                message: "Exhibition Updated Successfully. Will get Display Once Admin Approved it"
            });
        } else {
            res.status(200).send({
                status: false,
                message: "Error in Update Exhibition"
            });
        }
    } catch (error) {
        console.log('error-/updateexhibition', error);
        res.status(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error'
        });
    }

};

// Delete Exhibition
const DeleteExhibitions = async (req, res) => {
    try {
        const { Id } = req.body;

        const query = `
            DELETE FROM "Exhibitions"
            WHERE "_id" = $1
        `;

        const values = [Id];

        const result = await pool.query(query, values);

        if (result.rowCount > 0) {
            res.status(200).send({
                status: true,
                message: "Exhibitions Deleted Successfully"
            });
        } else {
            res.status(200).send({
                status: false,
                message: "Error in Delete Exhibitions"
            });
        }
    } catch (error) {
        console.log('error-/deleteexhibitions', error);
        res.status(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error'
        });
    }

};

// Add Medias
const AddMedias = async (req, res) => {

    let { Title, Author, Published, Type, Year, Link, Image, Description } = req.body;

    try {
        const query = `
            INSERT INTO "Medias" ("Title", "Author", "Published", "Type", "Year", "Link", "Image", "Description", "UserId", "Status")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,'Inactive')
        `;

        const values = [Title, Author, Published, Type, Year, Link, Image, Description, req.user.UserId];

        const result = await pool.query(query, values);

        if (result.rowCount === 1) {
            res.status(200).send({
                status: true,
                message: "Media and Publications Added Successfully. Will get Display Once Admin Approved it"
            });
        } else {
            res.status(200).send({
                status: false,
                message: "Error in Add Medias and Publications"
            });
        }
    } catch (error) {
        console.log('error-/addmedias', error);
        res.status(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error'
        });
    }

};

// Edit Medias
const EditMedias = async (req, res) => {

    let { Title, Author, Published, Type, Description, Year, Link, Image, Id } = req.body;


    try {
        const query = `
            UPDATE "Medias"
            SET "Title" = $1,
                "Author" = $2,
                "Published" = $3,
                "Type" = $4,
                "Description" = $5,
                "Year" = $6,
                "Link" = $7,
                "Image" = $8,
                "Status" = 'Inactive'
            WHERE "_id" = $9
        `;

        const values = [
            Title || Upd_Info.Title,
            Author || Upd_Info.Author,
            Published || Upd_Info.Published,
            Type || Upd_Info.Type,
            Description || Upd_Info.Description,
            Year || Upd_Info.Year,
            Link || Upd_Info.Link,
            Image || Upd_Info.Image,
            Id
        ];

        const result = await pool.query(query, values);

        if (result.rowCount === 1) {
            res.status(200).send({
                status: true,
                message: "Media and Publications Updated Successfully. Will get Display Once Admin Approved it"
            });
        } else {
            res.status(200).send({
                status: false,
                message: "Error in Update Medias and Publications"
            });
        }
    } catch (error) {
        console.log('error-/editmedias', error);
        res.status(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error'
        });
    }


};

// Get One Medias
const GetOneMedias = async (req, res) => {
    try {
        const query = `
            SELECT "Title", "Author", "Published", "Type", "Description", "Year", "Link", "Image"
            FROM "Medias"
            WHERE "_id" = $1
            ORDER BY "_id" DESC
            LIMIT 1
        `;

        const values = [req.body.Id];

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            res.status(200).send({
                status: false,
                message: "No Media and Publication Available"
            });
        } else {
            const Info = result.rows[0];

            res.status(200).send({
                status: true,
                message: "Media Info Available",
                Info: Info
            });
        }
    } catch (error) {
        console.log('error-/addbio', error);
        res.status(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error'
        });
    }

};

// Get Medias
const GetMedias = async (req, res) => {
    try {
        const query = `
            SELECT * FROM "Medias"
            WHERE "UserId" = $1 AND "Status" = 'Active'
            ORDER BY _id DESC`;

        const values = [req.user.UserId];

        const result = await pool.query(query, values);

        const mediaInfo = result.rows;

        res.status(200).send({
            status: true,
            info: mediaInfo
        });
    } catch (error) {
        console.log('error-/getmedias', error);
        res.status(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error'
        });
    }

};

// Delete Medias
const DeleteMedias = async (req, res) => {
    try {
        const query = `
            DELETE FROM "Medias"
            WHERE "_id" = $1
        `;

        const values = [req.body.Id];

        const result = await pool.query(query, values);

        if (result.rowCount > 0) {
            res.status(200).send({
                status: true,
                message: "Media & Publication Deleted Successfully"
            });
        } else {
            res.status(200).send({
                status: false,
                message: "No Media and Publications Available"
            });
        }

    } catch (error) {
        console.log('error-/deleteMedias', error);
        res.status(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error'
        });
    }

};

// Add Address
const AddAddress = async (req, res) => {
    // Extract address data from the request body
    let { CityName, CountryCode, PostalCode, AddressLine1, AddressLine2, CountryName, State, PrimaryAddress, MobileNo } = req.body;

    // Sanitize the extracted data
    CityName = sanitizeHtml(CityName);
    CountryCode = sanitizeHtml(CountryCode);
    AddressLine1 = sanitizeHtml(AddressLine1);
    AddressLine2 = sanitizeHtml(AddressLine2);
    CountryName = sanitizeHtml(CountryName);
    State = sanitizeHtml(State);

    try {
        // Create an address instance with the provided data
        const userId = req.user.UserId;

        if (PrimaryAddress) {
            const updatePrimaryQuery = `
                UPDATE "Address"
                SET "PrimaryAddress" = false
                WHERE "UserId" = $1;
            `;
            await pool.query(updatePrimaryQuery, [userId]);
        }

        const insertQuery = `
            INSERT INTO "Address" ("UserId", "CityName", "CountryCode", "PostalCode", "AddressLine1", "AddressLine2", "State", "MobileNo", "CountryName", "PrimaryAddress")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
        `;
        const insertValues = [userId, CityName, CountryCode, PostalCode, AddressLine1, AddressLine2, State, MobileNo, CountryName, PrimaryAddress];
        const result = await pool.query(insertQuery, insertValues);

        const address = result.rowCount;

        if (address) {
            res.status(200).send({
                status: true,
                info: 'Address added successfully'
            });
        } else {
            res.status(403).send({
                status: false,
                info: 'Error in processing request'
            });
        }
    } catch (error) {
        console.log('error - /addAddress', error);
        res.status(500).send({
            status: false,
            message: 'Error occurred',
            error: 'error',
        });
    }
};


// Edit Address
const EditAddress = async (req, res) => {
    // Extract address data from the request body
    let { CityName, CountryCode, PostalCode, AddressLine1, AddressLine2, State, MobileNo, PrimaryAddress, CountryName, Id } = req.body;

    try {
        // Find the address by its ID
        const findAddressQuery = `
            SELECT * FROM "Address"
            WHERE "_id" = $1 AND "UserId" = $2
            LIMIT 1;
        `;
        const findAddressValues = [Id, req.user.UserId];
        const addressResult = await pool.query(findAddressQuery, findAddressValues);

        const address = addressResult.rows[0];

        // Sanitize the extracted data
        CityName = sanitizeHtml(CityName);
        AddressLine1 = sanitizeHtml(AddressLine1);
        AddressLine2 = sanitizeHtml(AddressLine2);
        CountryName = sanitizeHtml(CountryName);
        State = sanitizeHtml(State);
        Id = sanitizeHtml(Id);

        if (!address) {
            res.status(200).send({
                status: false,
                info: "Address for this ID does not exist"
            });
            return;
        }

        if (PrimaryAddress) {
            const updatePrimaryQuery = `
                UPDATE "Address"
                SET "PrimaryAddress" = false
                WHERE "UserId" = $1;
            `;
            await pool.query(updatePrimaryQuery, [req.user.UserId]);
        }

        // Update the address data
        const updateAddressQuery = `
            UPDATE "Address"
            SET
                "CityName" = $1,
                "CountryCode" = $2,
                "PostalCode" = $3,
                "State" = $4,
                "PrimaryAddress" = $5,
                "MobileNo" = $6,
                "AddressLine1" = $7,
                "AddressLine2" = $8,
                "CountryName" = $9
            WHERE "_id" = $10 AND "UserId" = $11
            RETURNING *;
        `;
        const updateAddressValues = [CityName, CountryCode, PostalCode, State, PrimaryAddress, MobileNo, AddressLine1, AddressLine2, CountryName, Id, req.user.UserId];
        const updateResult = await pool.query(updateAddressQuery, updateAddressValues);

        if (updateResult.rowCount > 0) {
            res.status(200).send({
                status: true,
                info: 'Address updated successfully'
            });
        } else {
            res.status(403).send({
                status: false,
                info: 'Error in processing request'
            });
        }
    } catch (error) {
        console.log('error - /editAddress', error);
        res.status(500).send({
            status: false,
            message: 'Invalid ID',
            error: 'error',
        });
    }
};


// Get one Address
const GetOneAddress = async (req, res) => {
    let { Id } = req.body;

    // Sanitize the extracted data

    try {
        // Find the address by its ID and email
        const findAddressQuery = `
            SELECT * FROM "Address"
            WHERE "_id" = $1 AND "UserId" = $2
            LIMIT 1;
        `;
        const findAddressValues = [Id, req.user.UserId];
        const addressResult = await pool.query(findAddressQuery, findAddressValues);

        const address = addressResult.rows[0];

        if (address) {
            res.status(200).send({
                status: true,
                info: sanitizeObject(address)
            });
        } else {
            res.status(403).send({
                status: false,
                info: "Address for this ID does not exist"
            });
        }
    } catch (error) {
        console.log('error - /getOneAddress', error);
        res.status(500).send({
            status: false,
            message: 'Invalid ID',
            error: 'error',
        });
    }
};


// Get Address List
const GetAddressList = async (req, res) => {
    try {
        // Retrieve all addresses for the user's UserId from the database
        const userId = req.user.UserId;
        const query = `
            SELECT * FROM "Address" WHERE "UserId" = $1;
        `;
        const result = await pool.query(query, [userId]);

        const addresses = result.rows;

        if (addresses.length > 0) {

            res.status(200).send({
                status: true,
                info: addresses,
            });
        } else {
            res.status(403).send({
                status: false,
                info: "No addresses found",
            });
        }
    } catch (error) {
        console.log('error - /getAddressList', error);
        res.status(500).send({
            status: false,
            message: 'Error occurred',
            error: 'error',
        });
    }
};


// Delete Address
const DeleteOneAddress = async (req, res) => {
    const { Id } = req.body;

    try {
        // Find the address by its ID and UserId
        const userId = req.user.UserId;
        const query = `
            SELECT * FROM "Address" WHERE "_id" = $1 AND "UserId" = $2;
        `;
        const result = await pool.query(query, [Id, userId]);

        const address = result.rows[0];

        if (!address) {
            res.status(200).send({
                status: false,
                info: "Address for this ID does not exist",
            });
            return;
        }

        // Delete the address
        const deleteQuery = `
            DELETE FROM "Address" WHERE "_id" = $1;
        `;
        await pool.query(deleteQuery, [Id]);

        res.status(200).send({
            status: true,
            info: "Address deleted successfully",
        });
    } catch (error) {
        console.log('error - /deleteOneAddress', error);
        res.status(500).send({
            status: false,
            message: 'Invalid ID',
            error: 'error',
        });
    }
};


// Change Password
const ChangePassword = async (req, res) => {

    try {
        let { NewPassword } = req.body;
        NewPassword = sanitizeHtml(NewPassword);

        // Find the user by email

        let Alrdy_User = (await pool.query('SELECT * FROM "Users" WHERE "Email" = $1 LIMIT 1;', [req.user.Email])).rows[0];

        if (!Alrdy_User) {
            res.code(200).send({
                status: false,
                message: "User Not Exist"
            });
            return;
        }

        // Validate the new password
        if (!Schema.validate(NewPassword)) {
            res.code(200).send({
                status: false,
                message: "Password length should be at least 10 with a combination of letters and numbers"
            });
            return;
        }

        // Encrypt the new password
        let EncPassword = await Encrypt(NewPassword);

        // Update the user's password
        const query = `UPDATE "Users" SET Password = $1
            WHERE Email = $2;`;
        const values = [EncPassword, req.user.Email];

        const result = await pool.query(query, values);

        if (result.rowCount > 0) {
            await ActivityUpdate(req, req.user.Email, 'Password Update', 'success', '');
            res.code(200).send({
                status: true,
                message: "Password Updated Successfully"
            });
            return;
        } else {
            await ActivityUpdate(req, req.user.Email, 'Password Update', 'failed', '');
            res.code(403).send({
                status: false,
                message: "Password Update Failed"
            });
            return;
        }
    } catch (error) {
        console.log('error-/passwordupdate', error);
        res.code(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error',
        });
    }
}

//Enable and Disable 2FA
const EnableDisable2FA = async (req, res) => {
    try {
        let { Enable2FA } = req.body;

        let Email = req.user.Email.toLowerCase().trim();

        // Find the user by email

        let Alrdy_User = (await pool.query('SELECT * FROM "Users" WHERE "Email" = $1 LIMIT 1;', [Email])).rows[0];

        if (!Alrdy_User) {
            res.code(200).send({
                status: false,
                message: "User Not Exist"
            });
            return;
        }

        // Check if 2FA is already enabled or disabled
        if (Alrdy_User.Enable2FA == Enable2FA) {
            res.code(200).send({
                status: false,
                message: Enable2FA ? "Already 2FA is Enabled" : "Already 2FA is Disabled"
            });
            return;
        }

        // Update the user's 2FA status
        const query = `UPDATE "Users" SET "Enable2FA" = $1    WHERE "Email" = $2;`;
        const values = [Enable2FA, req.user.Email];

        try {
            const result = await pool.query(query, values);
            if (result.rowCount > 0) {
                await ActivityUpdate(req, req.user.Email, '2FA Update', 'success', '');
                res.code(200).send({
                    status: true,
                    message: Enable2FA ? "2FA Enabled Successfully" : "2FA Disabled Successfully"
                });
                return;
            } else {
                await ActivityUpdate(req, req.user.Email, '2FA Update', 'failed', '');
                res.code(200).send({
                    status: false,
                    message: "2FA Update Failed"
                });
                return;
            }
            // Handle the result as needed
        } catch (error) {
            console.error('Error occurred:', error);
        }


    } catch (error) {
        console.log('error-/2faupdate', error);
        res.code(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error',
        });
    }
}

//Common Image Upload
const CommonImageUpload = (fastify) => async (req, res) => {
    try {
        let { Type } = req.body;

        let UserId = req.user.UserId;

        let UserInfo = (await pool.query('SELECT * FROM "Users" WHERE _id = $1 LIMIT 1;', [UserId])).rows[0];


        if (!req.file) {
            // If no file is provided, return an error response
            return res.code(200).send({
                status: false,
                message: "Image is required",
            });
        }

        let ThumbImage = req.file.filename;


        let Local = "";

        if (ThumbImage) {
            // Upload based on Type
            if (Type == "Exhibition") {


                try {
                    // Upload locally using FileServiceApi
                    let file = req.file;
                    let formData = new FormData();
                    filename = file.filename + "." + mime.extension(file.mimetype);
                    formData.append('Image', fs.createReadStream(file.path), filename);
                    let folderlocation = "uploads/" + UserInfo.UserName + "/Exhibition";
                    formData.append('Location', folderlocation);
                    let s3Store = await Axios.post(Config.Services.FileServiceApi, formData);
                    Local = s3Store.data.s3Image;
                } catch (error) {
                    console.error(`Error occurred during local upload`);
                }
            }


            if (Type == "Media") {

                try {
                    let file = req.file
                    let formData = new FormData();
                    filename = file.filename + "." + mime.extension(file.mimetype)
                    formData.append('Image', fs.createReadStream(file.path), filename);
                    let folderlocation = "uploads/" + UserInfo.UserName + "/Mediapublications";
                    formData.append('Location', folderlocation);
                    let s3Store = await Axios.post(Config.Services.FileServiceApi, formData);
                    Local = s3Store.data.s3Image
                } catch (error) {
                    console.error(`Error occurred during local upload`);
                }
            }


            return res.code(200).send({
                status: true,
                Image: Local,
                message: 'Image Uploaded Successfully',
            });
        } else {
            return res.code(403).send({
                status: false,
                info: "Something Went Wrong",
            });
        }
    } catch (error) {
        console.log('error-/collectionthumb', error);
        return res.code(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error',
        });
    }
};

/* To Update Profile Image */

//Kyc Update
const KycUpdate = (fastify) => async (req, res) => {

    let { Auth, ProofName, Type } = req.body;
    // Sanitize input data
    Auth = sanitizeHtml(Auth);
    ProofName = sanitizeHtml(ProofName);

    try {
        let Tkn;
        try {
            Tkn = await fastify.jwt.verify(Auth);
        } catch (err) {
            // Invalid or expired token
            res.code(200).send({
                status: false,
                message: "Invalid Token or Token Expired",
            });
            return;
        }

        // Verify token and extract necessary information
        const { Email, UserId } = await fastify.jwt.verify(Auth);

        // Find the user based on UserId
        let Alrdy_User = await pool.query(`Select _id, "Email" from "Users" where _id =  '${UserId}'`)


        // Generate a new token
        const Tokennw = fastify.jwt.sign({ "Email": Alrdy_User.rows[0].Email }, { expiresIn: '1h' });

        // Find the user based on Email
        let UserInfo = await pool.query(`Select "Email", "KycStatus", "UserName", "UserRole"."Role" from "Users" INNER JOIN "UserRole" ON "Users"."RoleId" = "UserRole"._id where "Email" =  '${Email}'`)


        if (UserInfo.rowCount === 0) {
            // Invalid user
            res.code(200).send({
                status: false,
                message: "Invalid User",
            });
            return;
        }

        // Get settings
        let Settings = await pool.query(`Select "KycUpdate" from "Settings"`);

        if (!Settings.rows[0].KycUpdate) {
            // KYC Update disabled by admin
            res.code(200).send({
                status: false,
                message: "KYC Update Disabled by Admin",
            });
            return;
        }

        if (UserInfo.rows[0].KycStatus == 'Approved') {
            // KYC already approved
            res.code(200).send({
                status: false,
                token: Tokennw,
                message: "Identity Proof Already Approved",
            });
            return;
        }

        // Update KYC status to 'Pending'
        await pool.query(`Update "Users" SET "KycStatus" = 'Pending' where "Email" = '${Email}'`)

        let s3AImage = "";
        let s3IImage = "";


        let KycStatus = '';

        // Upload Address Proof
        if (req.files.AddressProof) {

            try {
                let file = req.files.AddressProof[0];
                let formData = new FormData();
                filename = file.filename + "." + mime.extension(file.mimetype)
                formData.append('Image', fs.createReadStream(file.path), filename);
                let folderlocation = "uploads/KYCDetails/" + UserInfo.rows[0].UserName + "/AddressProof";
                formData.append('Location', folderlocation);
                let s3Store = await Axios.post(Config.Services.FileServiceApi, formData);

                s3AImage = s3Store.data.s3Image;
                

            } catch (error) {
                console.log("error", error)
                console.error(`Error occurred during local upload`);
            }

        } else {
            res.code(200).send({
                status: false,
                message: "Address Proof is required",
            });
            return;
        }
        // Upload Identity Proof
        if (req.files.IdentityProof) {

            try {
                let file = req.files.IdentityProof[0]
                let formData = new FormData();
                filename = file.filename + "." + mime.extension(file.mimetype)
                formData.append('Image', fs.createReadStream(file.path), filename);
                let folderlocation = "uploads/KYCDetails/" + UserInfo.rows[0].UserName + "/IdentityProof";
                formData.append('Location', folderlocation);
                let s3Store = await Axios.post(Config.Services.FileServiceApi, formData);
                s3IImage = s3Store.data.s3Image;
            } catch (error) {
                console.error(`Error occurred during local upload`);
            }
            KycStatus = 'Pending';
        } else {
            res.code(200).send({
                status: false,
                message: "Identity Proof is required"
            });
            return;
        }



        if (ProofName !== null || ProofName !== undefined) {

            let Result = "";

            if (Type == "Edit") {
                Result = await pool.query(`Update "Users" SET "ProofProfileName" = '${ProofName}', "AddressProof" = '${s3AImage}',  "IdentityProof" = '${s3IImage}', "AccountStatus" = 0 where "Email" = '${Email}' and "KycStatus" = '${KycStatus}' where "Email" = '${Email}' and "KycStatus" = '${KycStatus}'`)


            } else {
                Result = await pool.query(`Update "Users" SET "ProofProfileName" = '${ProofName}', "AddressProof" = '${s3AImage}', "IdentityProof" = '${s3IImage}', "Steps" = 5 where "Email" = '${Email}' and "KycStatus" = '${KycStatus}'`)

            }


            if (Result && Tokennw) {
                await ActivityUpdate(req, Email, 'KYCUpdate', 'success', '');
                res.code(200).send({
                    status: true,
                    message: "Identity Proof Uploaded Successfully",
                    token: Tokennw,
                    role: UserInfo.rows[0].Role
                });
            } else {
                await ActivityUpdate(req, Email, 'KYCUpdate', 'failed', '');
                res.code(200).send({
                    status: false,
                    message: "Error in Uploading Identity Proof"
                });
            }

        } else {
            res.code(403).send({
                status: false,
                message: "Full name is required"
            });
            return;
        }
    } catch (error) {
        console.log('error-/kycupdate', error);
        res.code(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error',
        });
    }

}

// RegisterProfilemedia 
const RegisterProfilemedia = (fastify) => async (req, res) => {
    let { profileName, styles, Medium, Category, Auth, UrlLink, Label } = req.body;
    // Sanitize user inputs
    profileName = sanitizeHtml(profileName);
    styles = sanitizeHtml(styles);
    Medium = sanitizeHtml(Medium);
    Category = sanitizeHtml(Category);
    Auth = sanitizeHtml(Auth);
    UrlLink = sanitizeHtml(UrlLink);

    try {
        let Tkn;
        try {
            Tkn = await fastify.jwt.verify(Auth);
        } catch (err) {
            res.code(401).send({
                status: false,
                message: "Invalid Token or Token Expired",
            });
            return;
        }
        const { Email } = await fastify.jwt.verify(Auth);
    
        let UserInfo = await pool.query(`SELECT * FROM "Users" INNER JOIN "UserRole" ON "Users"."RoleId" = "UserRole"._id WHERE "Users"."Email" = $1`, [Email]);
        UserInfo = UserInfo.rows[0]


        let CLocal = '';
        let PLocal = '';
        let ALocal = '';

        if (req.files.ProfileImage) {

            try {
                let file = req.files.ProfileImage[0]
                let formData = new FormData();
                filename = file.filename + "." + mime.extension(file.mimetype)
                formData.append('Image', fs.createReadStream(file.path), filename);
                let folderlocation = "uploads/ProfileImages/" + UserInfo.UserName;
                formData.append('Location', folderlocation);
                let s3Store = await Axios.post(Config.Services.FileServiceApi, formData);
                PLocal = s3Store.data.s3Image
            } catch (error) {
                console.error(`Error occurred during local upload`);
            }
        }

        if (!req.files.ProfileImage && UserInfo.Role != "Buyer") {
            res.code(403).send({
                status: false,
                message: "Profile image is required"
            });
            return;
        }

        if (req.files.ArtWork) {


            try {
                let file = req.files.ArtWork[0]
                let formData = new FormData();
                filename = file.filename + "." + mime.extension(file.mimetype)
                formData.append('Image', fs.createReadStream(file.path), filename);
                let folderlocation = "uploads/ArtWorks/" + UserInfo.UserName;
                formData.append('Location', folderlocation);
                let s3Store = await Axios.post(Config.Services.FileServiceApi, formData);
                ALocal = s3Store.data.s3Image
            } catch (error) {
                console.error(`Error occurred during local upload1`);
            }
        }

        if (req.files.coverVideo) {

            try {
                let file = req.files.coverVideo[0];
                let formData = new FormData();
                filename = file.filename + "." + mime.extension(file.mimetype)
                formData.append('Image', fs.createReadStream(file.path), filename);
                let folderlocation = "uploads/CoverVideos/" + UserInfo.UserName;
                formData.append('Location', folderlocation);
                let s3Store = await Axios.post(Config.Services.FileServiceApi, formData);
                CLocal = s3Store.data.s3Image
            } catch (error) {
                console.error(`Error occurred during local upload2`);
            }

        }

        if (!req.files.coverVideo && UserInfo.Role != "Buyer") {
            res.code(403).send({
                status: false,
                message: "Cover video is required"
            });
            return;
        }

        if (!Label && UserInfo.Role == "Artist") {
            res.code(403).send({
                status: false,
                message: "Artist Label is required"
            });
            return;
        }
        if (!Label) {
            Label = null;
        }
        try {
            let Result = await pool.query(`Update "Users" SET  "ProfileName" = '${profileName}',"Label" = ${Label}::integer, "CoverVideo" =  '${CLocal}', "Steps" = 6, "ProfilePicture" = '${PLocal}',  "ArtWork" = '${ALocal}' , "Styles" = ARRAY[${styles}]::integer[], "Medium"= ARRAY[${Medium}]::integer[], "Category" = ARRAY[${Category}]::integer[],  "UrlLink" = ARRAY['${UrlLink}']::text[] where "Email" = '${Email}' `)

            if (Result) {
                await ActivityUpdate(req, Email, 'KYCUpdate', 'success', '');
                let Role = await pool.query(`select "Users"."AccountStatus" , "UserRole"."Role" from "Users" INNER JOIN "UserRole" On "Users"."RoleId" =  "UserRole"._id where "Email" = '${Email}'`)


                await Axios.post(Config.Services.EmailService + "/RegisterCompletionEmail", {
                    To: Email,
                    Message: `Registration request as ${Role.rows[0].Role} Completed Successfully. Profile will be visible to public only after Admin approval`
                });
                if(Role.rows[0].AccountStatus === 1){
                    res.code(200).send({
                        status: true,
                        message: "Profile updated Successfully"
                    });
                }else{
                    res.code(200).send({
                        status: true,
                        message: "Profile updated Successfully. After admin approval you will able to login"
                    });
                }
                
            } else {
                await ActivityUpdate(req, Email, 'KYCUpdate', 'failed', '');
                res.code(403).send({
                    status: false,
                    message: "Error in uploading Profile"
                });
            }

        } catch (error) {
            console.log("db error", error);
        }




    } catch (error) {
        console.log('error-/Profile', error);
        res.code(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error',
        });
    }
}

const UpdateProfilemedia = (fastify) => async (req, res) => {

    let { profileName, styles, Medium, UrlLink, Label } = req.body;

    let UserId = req.user.UserId;


    try {

        let UserInfo = (await pool.query('SELECT * FROM "Users" WHERE "_id" = $1 LIMIT 1;', [UserId])).rows[0];

        if (!UserInfo) {
            res.code(200).send({
                status: false,
                message: "User Not Found",
            });
            return;
        }

        let CLocal = '';
        let PLocal = '';
        let ALocal = '';

        if (req.files.ProfileImage) {

            try {
                let file = req.files.ProfileImage[0]
                let formData = new FormData();
                filename = file.filename + "." + mime.extension(file.mimetype)
                formData.append('Image', fs.createReadStream(file.path), filename);
                let folderlocation = "uploads/ProfileImages/" + UserInfo.UserName;
                formData.append('Location', folderlocation);
                let s3Store = await Axios.post(Config.Services.FileServiceApi, formData);
                PLocal = s3Store.data.s3Image
            } catch (error) {
                console.error(`Error occurred during local upload`);
            }
        }

        if (req.files.ArtWork) {

            try {
                let file = req.files.ArtWork[0]
                let formData = new FormData();
                filename = file.filename + "." + mime.extension(file.mimetype)
                formData.append('Image', fs.createReadStream(file.path), filename);
                let folderlocation = "uploads/ArtWorks/" + UserInfo.UserName;
                formData.append('Location', folderlocation);
                let s3Store = await Axios.post(Config.Services.FileServiceApi, formData);
                ALocal = s3Store.data.s3Image
            } catch (error) {
                console.error(`Error occurred during local upload1`);
            }
        }

        if (req.files.coverVideo) {

            try {
                let file = req.files.coverVideo[0]
                let formData = new FormData();
                filename = file.filename + "." + mime.extension(file.mimetype)
                formData.append('Image', fs.createReadStream(file.path), filename);
                let folderlocation = "uploads/CoverVideos/" + UserInfo.UserName;
                formData.append('Location', folderlocation);
                let s3Store = await Axios.post(Config.Services.FileServiceApi, formData);
                CLocal = s3Store.data.s3Image
            } catch (error) {
                console.error(`Error occurred during local upload2`);
            }

        }

        try {
            const query = `
            Update "Users" 
            SET  
            "ProfileName" = '${profileName}',
            "Label" = ${Label}::integer, 
            "CoverVideo" =  '${req.files.coverVideo ? CLocal : UserInfo.CoverVideo}', 
            "Steps" = 6, 
            "ProfilePicture" = '${req.files.ProfileImage ? PLocal : UserInfo.ProfilePicture}',  
            "ArtWork" = '${ALocal}' , 
            "Styles" = ARRAY[${styles}]::integer[], 
            "Medium"= ARRAY[${Medium}]::integer[], 
             
            "UrlLink" = ARRAY['${UrlLink}']::text[]
                WHERE "_id" = ${UserId};`;
         
            const result = await pool.query(query);

            if (result.rowCount > 0) {
                res.status(200).send({
                    status: true,
                    message: "Profile Info Updated Successfully",
                });
            } else {
                // No matching record found
                res.status(404).send({
                    status: false,
                    message: "User not found",
                });
            }
        } catch (error) {
            console.log("db error", error);
            res.status(500).send({
                status: false,
                message: "Error occurred",
            });
        }





    } catch (error) {
        console.log('error-/Profile', error);
        res.code(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error',
        });
    }
}

// Google Register
const GoogleRegister = (fastify) => async (req, res) => {
    try {
        let { Email, Token, UserName, Terms, Subscription } = req.body;

        // Sanitize input data
        Email = Email.toLowerCase().trim();
        Email = sanitizeHtml(Email);
        Token = sanitizeHtml(Token);
        UserName = UserName.toLowerCase().trim();
        UserName = sanitizeHtml(UserName);
        Terms = sanitizeHtml(Terms);
        Subscription = sanitizeHtml(Subscription);

        // Fetch social login details from settings
        let SettingInfo = await pool.query(`Select "GoogleClientId" from  "Settings"`);

        const client = new OAuth2Client(SettingInfo.rows[0].GoogleClientId);

        try {
            await client.verifyIdToken({
                idToken: Token,
                audience: SettingInfo.rows[0].GoogleClientId,
            });

            // Trim and validate email
            Email = Email.trim();

            // Check if user already exists
            let Alrdy_User = (await pool.query('SELECT * FROM "Users" WHERE "Email" = $1 LIMIT 1;', [Email])).rows[0];


            if (Alrdy_User) {
                // User already registered
                res.code(200).send({
                    status: false,
                    message: "Account Already Registered"
                });
                return;
            } else {

                // Check if username is already taken
                let Username = (await pool.query('SELECT * FROM "Users" WHERE "UserName" = $1 LIMIT 1;', [UserName])).rows[0];


                if (Username) {
                    res.code(200).send({
                        status: false,
                        message: "UserName Already Taken"
                    });
                    return;
                }

                if (!Terms) {
                    res.code(200).send({
                        status: false,
                        message: "Terms & Conditions Not Accepted"
                    });
                    return;
                }

                // Create a new user
                const ins = await pool.query('INSERT INTO "Users" ("Email", "Terms", "Subscription", "Steps", "RegisterMode", "UserName") VALUES ($1, $2, $3, $4, $5, $6) RETURNING _id', [Email, Terms, Subscription, 2, 'Google', UserName]);


                if (ins.rowCount > 0) {
                    let InsData = {
                        "Email": Email,
                        "UserId": ins.rows[0]._id,
                        "Steps": 2,
                        "UserName": UserName
                    }

                    // Generate JWT token
                    const Tokennw = await fastify.jwt.sign(InsData, { expiresIn: '30m' });

                    await ActivityUpdate(req, Email, 'Registration Via Google', 'success', '');

                    res.code(200).send({
                        status: true,
                        message: "Registration Success",
                        response: Tokennw
                    });
                    return;
                } else {
                    await ActivityUpdate(req, Email, 'Registration Via Google', 'failed', '');
                    res.code(200).send({
                        status: false,
                        message: "Registration Failed"
                    });
                    return;
                }
            }
        } catch (error) {
            console.error('Error verifying Google login token:', error);
            res.code(200).send({
                status: false,
                message: "Invalid Token"
            });
            return;
        }
    } catch (error) {
        console.log('error-/Profile', error);
        res.code(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error',
        });
    }
}

// Google Login
const GoogleLogin = (fastify) => async (req, res) => {
    try {
        let { Email, Token } = req.body;

        // Sanitize input data
        Email = Email.toLowerCase().trim();
        Email = sanitizeHtml(Email);
        Token = sanitizeHtml(Token);

        // Fetch social login details from settings
        let SettingInfo = await pool.query(`Select "GoogleClientId" from  "Settings"`);

        const client = new OAuth2Client(SettingInfo.rows[0].GoogleClientId);

        try {
            await client.verifyIdToken({
                idToken: Token,
                audience: SettingInfo.rows[0].GoogleClientId,
            });

            // Trim and validate email
            Email = Email.trim();

            // Check if user exists
            let Alrdy_User = (await pool.query('SELECT * FROM "Users" WHERE "Email" = $1 LIMIT 1;', [Email])).rows[0];


            if (!Alrdy_User) {
                // User not registered
                res.code(200).send({
                    status: false,
                    response: "Not a Registered User"
                });
                return;
            }

            let InsData = {
                "Email": Alrdy_User.Email,
                "UserId": Alrdy_User._id,
                "Steps": Alrdy_User.Steps,
                "UserName": Alrdy_User.UserName
            }

            // Generate JWT tokens
            const Tokennw = await fastify.jwt.sign(InsData, { expiresIn: '30m' });
            const Tokenn = fastify.jwt.sign({ "Email": Alrdy_User.Email }, { expiresIn: '30m' });

            if (Alrdy_User.Steps == 6) {
                if (Alrdy_User.KycStatus == "Pending" || Alrdy_User.KycStatus == "pending") {
                    // Account KYC awaiting admin approval
                    await ActivityUpdate(req, Email, 'Login Failed', 'fail', 'Account KYC Awaiting For Admin Approval');
                    res.code(200).send({
                        status: false,
                        response: "Account Identity Proof Awaiting For Admin Approval"
                    });
                    return;
                }

                if (Alrdy_User.AccountStatus == 0) {
                    // Account awaiting admin approval
                    await ActivityUpdate(req, Email, 'Login Failed', 'fail', 'Account Awaiting For Admin Approval');
                    res.code(200).send({
                        status: false,
                        response: "Account Awaiting For Admin Approval"
                    });
                    return;
                }

                if (Alrdy_User.Enable2FA) {
                    // Generate OTP for 2FA
                    let OTP = Math.floor(100000 + Math.random() * 900000);

                    let OTP_Verify_Email = await Axios.post(Config.Services.EmailService + "/Login2FAVerifyEmail", {
                        To: Email,
                        OTP: OTP
                    });

                    let InssData = {
                        "UserId": Alrdy_User._id,
                        "AuthOTP": OTP
                    }

                    const Tokennnw = await fastify.jwt.sign(InssData, { expiresIn: '30m' });

                    if (OTP_Verify_Email.status) {
                        // 2FA code sent to registered email
                        res.code(200).send({
                            status: true,
                            token: Tokennnw,
                            response: "2FA Code Sent to Registered Mail"
                        });
                        return;
                    } else {
                        res.code(500).send({
                            status: false,
                            response: ""
                        });
                        return;
                    }
                }

                // Successful login
                res.code(200).send({
                    status: true,
                    token: Tokenn,
                    UserId: Alrdy_User._id,
                    response: "Login success"
                });
                return;
            } else {
                res.code(200).send({
                    status: true,
                    token: Tokennw,
                    role: Alrdy_User.Role,
                    UserId: Alrdy_User._id,
                    Steps: Alrdy_User.Steps,
                });
                return;
            }



        } catch (error) {
            console.error('Error verifying Google login token:', error);
            res.code(200).send({
                status: false,
                message: "Invalid Token"
            });
            return;
        }



    } catch (error) {
        console.log('error-/Profile', error);
        res.code(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error',
        });
    }
}

// Facebook Register
const FacebookRegister = (fastify) => async (req, res) => {
    try {
        let { Email, Token, UserName, Terms, Subscription } = req.body;

        // Sanitize input data
        Email = Email.toLowerCase().trim();
        Email = sanitizeHtml(Email);
        Token = sanitizeHtml(Token);
        UserName = UserName.toLowerCase().trim();
        UserName = sanitizeHtml(UserName);
        Terms = sanitizeHtml(Terms);
        Subscription = sanitizeHtml(Subscription);

        let SettingInfo = await pool.query(`Select "FacebookSecret" from "Settings"`);

        Token = Token.split(' ')[1];

        try {
            const decodedToken = jwt.decode(Token);
            const appSecret = SettingInfo.rows[0].FacebookSecret;
            const options = { algorithms: ['HS256'], issuer: 'facebook' }
            jwt.verify(Token, appSecret, options)

            const expTime = decodedToken.exp;
            const currentTime = Math.floor(Date.now() / 1000);

            if (expTime <= currentTime) {
                // Token expired
                res.code(200).send({
                    status: false,
                    message: "Token Expired"
                });
                return;
            }

            Email = Email.trim();

            let Alrdy_User = (await pool.query('SELECT * FROM "Users" WHERE "Email" = $1 LIMIT 1;', [Email])).rows[0];


            if (Alrdy_User) {
                // Account already registered
                res.code(200).send({
                    status: false,
                    message: "Account Already Registered"
                });
                return;
            } else {

                let Username = (await pool.query('SELECT * FROM "Users" WHERE "UserName" = $1 LIMIT 1;', [UserName])).rows[0];


                if (Username) {
                    res.code(200).send({
                        status: false,
                        message: "UserName Already Taken"
                    });
                    return;
                }

                if (!Terms) {
                    // Terms and conditions not accepted
                    res.code(200).send({
                        status: false,
                        message: "Terms & Conditions Not Accepted"
                    });
                    return;
                }

                const ins = await pool.query('INSERT INTO "Users" ("Email", "Terms", "Subscription", "Steps", "RegisterMode", "UserName") VALUES ($1, $2, $3, $4, $5, $6)', [Email, Terms, Subscription, 2, 'Facebook', UserName]);

                if (ins) {
                    let InsData = {
                        "Email": Email,
                        "UserId": ins.rows[0]._id,
                        "Steps": 2,
                        "UserName": UserName
                    }

                    const Tokennw = await fastify.jwt.sign(InsData, { expiresIn: '30m' });

                    await ActivityUpdate(req, Email, 'Registration Via Facebook', 'success', '');

                    res.code(200).send({
                        status: true,
                        message: "Registration Success",
                        response: Tokennw
                    });
                    return;
                } else {
                    await ActivityUpdate(req, Email, 'Registration Via Google', 'failed', '');

                    res.code(200).send({
                        status: false,
                        message: "Registration Failed"
                    });
                    return;
                }
            }
        } catch (error) {
            console.error('Error verifying Facebook login token:', error);

            res.code(200).send({
                status: false,
                message: "Invalid Token"
            });
            return;
        }
    } catch (error) {
        console.log('error-/Profile', error);

        res.code(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error',
        });
    }
}

//Facebook Login
const FacebookLogin = (fastify) => async (req, res) => {
    try {
        let { Email, Token } = req.body;

        // Sanitize input data
        Email = Email.toLowerCase().trim();
        Email = sanitizeHtml(Email);
        Token = sanitizeHtml(Token);

        let SettingInfo = await pool.query(`Select "FacebookSecret" from  "Settings"`);

        // Extract the token from the "Bearer Token" format
        Token = Token.split(' ')[1];

        try {
            const decodedToken = jwt.decode(Token);
            const appSecret = SettingInfo.rows[0].FacebookSecret;
            const options = { algorithms: ['HS256'], issuer: 'facebook' };
            jwt.verify(Token, appSecret, options);

            const expTime = decodedToken.exp;
            const currentTime = Math.floor(Date.now() / 1000);

            if (expTime <= currentTime) {
                // Token expired
                res.code(200).send({
                    status: false,
                    message: "Token Expired"
                });
                return;
            }

            Email = Email.trim();

            let Alrdy_User = (await pool.query('SELECT * FROM "Users" WHERE "Email" = $1 LIMIT 1;', [Email])).rows[0];


            if (!Alrdy_User) {
                // Not a registered user
                res.code(200).send({
                    status: false,
                    response: "Not a Registered User"
                });
                return;
            }

            let InsData = {
                "Email": Alrdy_User.Email,
                "UserId": Alrdy_User._id,
                "Steps": Alrdy_User.Steps,
                "UserName": Alrdy_User.UserName
            };

            const Tokennw = await fastify.jwt.sign(InsData, { expiresIn: '30m' });
            const Tokenn = fastify.jwt.sign({ "Email": Alrdy_User.Email }, { expiresIn: '30m' });

            if (Alrdy_User.Steps === 6) {
                if (Alrdy_User.KycStatus === "Pending" || Alrdy_User.KycStatus === "pending") {
                    await ActivityUpdate(req, Email, 'Login Failed', 'fail', 'Account Identity Proof Awaiting For Admin Approval');
                    res.code(400).send({
                        status: false,
                        response: "Account Identity Proof Awaiting For Admin Approval"
                    });
                    return;
                }

                if (Alrdy_User.AccountStatus === 0) {
                    await ActivityUpdate(req, Email, 'Login Failed', 'fail', 'Account Awaiting For Admin Approval');
                    res.code(400).send({
                        status: false,
                        response: "Account Awaiting For Admin Approval"
                    });
                    return;
                }

                if (Alrdy_User.Enable2FA) {
                    let OTP = Math.floor(100000 + Math.random() * 900000);
                    let OTP_Verify_Email = await Axios.post(Config.Services.EmailService + "/Login2FAVerifyEmail", {
                        To: Email,
                        OTP: OTP
                    });

                    let InssData = {
                        "UserId": Alrdy_User._id,
                        "AuthOTP": OTP
                    };

                    const Tokennnw = await fastify.jwt.sign(InssData, { expiresIn: '30m' });

                    if (OTP_Verify_Email.status) {
                        res.code(200).send({
                            status: true,
                            token: Tokennnw,
                            response: "2FA Code Sent to Registered Mail"
                        });
                        return;
                    } else {
                        res.code(500).send({
                            status: false,
                            response: ""
                        });
                        return;
                    }
                }
                res.code(200).send({
                    status: true,
                    token: Tokenn,
                    UserId: Alrdy_User._id,
                    response: "Login success"
                });
                return;
            } else {
                res.code(200).send({
                    status: true,
                    token: Tokennw,
                    UserId: Alrdy_User._id,
                    role: Alrdy_User.Role,
                    Steps: Alrdy_User.Steps,
                });
                return;
            }



        } catch (error) {
            console.error('Error verifying Facebook login token:', error);
            res.code(200).send({
                status: false,
                message: "Invalid Token"
            });
            return;
        }



    } catch (error) {
        console.log('error-/Profile', error);
        res.code(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error',
        });
    }
}

/* Get News Listing */
const NewsList = async (req, res) => {
    try {


        const NewsInfo = await pool.query(`SELECT _id::text AS _id, "Title", "Image", "Content"  from "News"`);
       
        if (NewsInfo) {
            // News found
            res.code(200).send({
                status: true,
                info: NewsInfo.rows
            });
        } else {
            // No news found
            res.code(403).send({
                status: false,
                info: ""
            });
        }
    } catch (error) {
        console.log('error-/getNewslist', error);
        res.code(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error',
        });
    }
}

/* Logout the session */
const Logout = (fastify) => async (req, res) => {
    try {
       
        // Destroy the session and clear the token cookie
        req.session.user = null;
        res.clearCookie('Token');

        res.code(200).send({
            status: true,
            response: "Logout Success"
        });
    } catch (error) {
        console.log('error-/logout', error);
        res.code(500).send({
            status: false,
            message: 'Error Occurred',
            error: 'error',
        });
    }
}

const uploadflag = (fastify) => async (req, res) => {

    await UploadFlagFile(req.file);
   
};


module.exports = {
    GetCountries,
    GetUserRoles,
    GetCSVSamples,
    GetSiteSettings,
    Register,
    Confirmation,
    GetOneTestimonial,
    GetBio,
    AddBio,
    DeleteBio,
    GetTestimonials,
    AddTestimonials,
    EditTestimonials,
    ResendRegisterOTP,
    Login,
    Verify2FA,
    ForgotPassword,
    ResetPassword,
    WalletConnect,
    RoleSelect,
    ProfileInfo,
    uploadflag,
    ArtistInfo,
    GoogleRegister,
    GoogleLogin,
    FacebookRegister,
    FacebookLogin,
    KycUpdate,
    ImageUpdate,
    ProfileImageUpload,
    KycImageUpload,
    GetNetworkInfo,
    UpdateAddress,
    UpdateAgreement,
    Logout,
    RegisterProfilemedia,
    GetLandingPageDetails,
    RoleBasedUsers,
    ChangePassword,
    EnableDisable2FA,
    NewsList,
    AddAddress,
    EditAddress,
    GetOneAddress,
    GetAddressList,
    DeleteOneAddress,
    DeleteTestimonials,
    CommonImageUpload,
    AddExhibitions,
    EditExhibitions,
    GetExhibitions,
    GetMedias,
    DeleteExhibitions,
    DeleteMedias,
    GetOneExhibition,
    AddMedias,
    EditMedias,
    GetOneMedias,
    UpdateProfilemedia,
    GetMediaLimitInfo,
    GetPageInfo,
    NewsInfo,
    GetBannerDetails,
    GetInnerBannerDetails,
    GetAboutusPageDetails,
    GetEventsPageDetails,
    GetFeaturePageDetails,
    GetMetamaskDetails,
    LabelBasedUsers,
    NotificationList,
    FlagUpdate
    //SocketInit
}