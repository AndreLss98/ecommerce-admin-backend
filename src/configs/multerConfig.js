const { ENV, AMAZON_KEY_ID, AMAZON_KEY_SECRET, AMAZON_S3_BUCKET_DEV, AMAZON_S3_BUCKET_PROD, AMAZON_S3_BUCKET_REGION } = process.env;

const path = require('path');
const multer = require('multer');
const multerS3 = require('multer-s3');
const awsS3 = require('aws-sdk/clients/s3');
const { ENVS } = require('../shared/constantes');

const s3 = new awsS3({
    accessKeyId: AMAZON_KEY_ID,
    secretAccessKey: AMAZON_KEY_SECRET,
    region: AMAZON_S3_BUCKET_REGION,
    signatureVersion: 'v4',
});

const STORAGE_TYPE = {
    local: () => multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.resolve(__dirname, '..', '..', 'public', 'tmp', 'uploads'))
        },
        filename: (req, file, cb) => {
            try {
                cb (null, file.originalname);
            } catch (error) {
                cb(error);
            }
        }
    }),
    s3: () => {
        try {
            return multerS3({
                s3,
                bucket: ENV === ENVS.PROD? AMAZON_S3_BUCKET_PROD : AMAZON_S3_BUCKET_DEV,
                contentType: multerS3.DEFAULT_CONTENT_TYPE,
                acl: 'private',
                key: (req, file, cb) => {
                    cb(null, file.originalname);
                }
            });
        } catch(error) {
            throw error;
        }
    }
}

module.exports = () => {
    return {
        dest: path.resolve(__dirname, '..', '..', 'public', 'tmp', 'uploads'),
        storage: STORAGE_TYPE['s3'](),
        fileFitler: (req, file, cb) => {
            cb(null, true);
        }
    }
}