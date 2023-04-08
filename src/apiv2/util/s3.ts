import s3 from 'aws-sdk/clients/s3';
import AWS from 'aws-sdk';
import fs from 'fs';
import { Resolver } from '../../custom';
import { makeLogger } from '../../util/logger';

const {
    s3: s3Config
} = require('../../../config');

const awsClient = s3Config.enabled && new AWS.S3(s3Config);
const logger = makeLogger('S3');

export default function s3UploadFile(key: string, path: string, publicPath: string, contentType: string) {
    return new Promise<string>((res, rej) => {
        if (!s3Config.enabled) return res(publicPath);

        awsClient.upload({
            Bucket: s3Config.bucket,
            Key: key,
            ACL: 'public-read',
            ContentType: contentType,
            Body: fs.readFileSync(path),
        }, (err: Error, data: s3.ManagedUpload.SendData) => {
            if (err) {
                return rej(err);
            }

            fs.unlink(path, (err) => {
                if (err) logger(err);
            });
            logger(`Uploaded ${key}`);
            res(data.Location);
        });
    });
}