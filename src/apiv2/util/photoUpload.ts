import multer from 'multer';
import gm from 'gm';
import mkdirp from 'mkdirp';
import path from 'path';
import randToken from 'rand-token';
import fs from 'fs';

import s3UploadFile from './s3';
import async from './async';
import { Resolver, CustomRequest } from '../../custom';
import mimeTypeStr from './mimeType';
import { Response, NextFunction } from 'express';
import { makeLogger } from '../../util/logger';
const {
    upload: uploadConfig
} = require('../../../config');

const logger = makeLogger('PHOTO');

function writeGM(gmObject: gm.State, filename: string) {
    const filePath = path.resolve(uploadConfig.directory, filename);
    const publicPath = path.resolve(uploadConfig.directoryPublic, filename);

    return new Promise((res: Resolver, rej: Resolver) => gmObject.write(filePath, err => {
        if (err) {
            logger(err);
            return rej('PhotoInvalid');
        }
        res();
    })).then(() => {
        return s3UploadFile(`images/${filename}`, filePath, uploadConfig.url + publicPath, 'image/png');
    });
}

export const publicPath = uploadConfig.directoryPublic;
export const uploadPath = path.resolve(__dirname, '../../../', uploadConfig.directory);
mkdirp.sync(uploadPath);

export const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, uploadConfig.directory),
        filename: async (req, file, cb) => {
            logger(file);
            const type = await mimeTypeStr(file.mimetype);
            if (!type) throw 'NotEnableFileType';
            cb(null, randToken.generate(32) + type);
        },
    }),
    limits: {
        fileSize: 1024 * 1024 * 50,
        fieldSize: 1024 * 1024 * 50
    },
});

const photoUpload = upload.fields([{ name: 'photo' }]);

export const nextHandler = async(async (req: CustomRequest, res: Response, next: NextFunction) => next());
export const uploadHandler = async(async (req: CustomRequest, res: Response, next: NextFunction) => {
    async function createPromise(file: any) {
        const fileName = randToken.generate(32);
        return Promise.all([
            writeGM(gm(file.path).flatten().autoOrient().resize(1280, 1280, '>').noProfile(), fileName + '.jpg'),
            writeGM(gm(file.path).flatten().autoOrient().resize(256, 256, '>').noProfile(), fileName + '.thumb.jpg'),
        ]).then(v => {
            fs.unlink(file.path, err => {
                if (err) logger(err);
            });
            return v[0];
        }, v => {
            fs.unlink(file.path, err => {
                if (err) logger(err);
            });
            throw v;
        });
    }

    if (Array.isArray(req.files)) {
        req.photo = await Promise.all(req.files.map(createPromise));
    } else if (req.files != null) {
        let promises = [] as Promise<any>[];
        req.photo = {};
        for (let key in req.files) {
            req.photo[key] = [];
            promises = promises.concat(req.files[key].map(
                (file, i) => createPromise(file).then(url => req.photo[key][i] = url)
            ));
        }
        await Promise.all(promises);
    }
    next();
});

export default function(req: CustomRequest, res: Response, next: NextFunction) {
    return photoUpload(req, res, (err: any) => {
        if (req.body.type === 'Image') {
            logger('photoUpload Start');
            if (err) next(err);
            else uploadHandler(req, res, next);
        }
        else nextHandler(req, res, next);
    });
}