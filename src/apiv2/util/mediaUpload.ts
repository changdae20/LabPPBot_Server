import multer from 'multer';
import gm from 'gm';
import { getAudioDurationInSeconds } from 'get-audio-duration';
import mkdirp from 'mkdirp';
import path from 'path';
import randToken from 'rand-token';
import fs from 'fs';

import s3UploadFile from './s3';
import async from './async';
import { Resolver, CustomRequest } from '../../custom';
import mimeTypeStr from './mimeType';
import { Response, NextFunction, Request } from 'express';
import { makeLogger } from '../../util/logger';
const {
    upload: uploadConfig
} = require('../../../config');

const logger = makeLogger('MEDIA');

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

async function writeAudio(orgFilePath: string, destFileName: string) {
    const filePath = path.resolve(uploadConfig.directory, destFileName);
    const publicPath = path.resolve(uploadConfig.directoryPublic, destFileName);

    const duration = await getAudioDurationInSeconds(orgFilePath);
    console.log(`duration : ${duration}`);

    await fs.promises.copyFile(orgFilePath, filePath);
    const url = await s3UploadFile(`audios/${destFileName}`, filePath, uploadConfig.url + publicPath, 'audio/mp3');

    return {
        duration, url,
    };
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
    },
});

const mediaUpload = upload.any();

interface UPLOAD_DATA {
    field: string,
    data: any,
}

export enum FIELD_TYPE {
    IMAGE, AUDIO,
};

const FIELD_DATA_DEFAULT = {
    IMAGE: FIELD_TYPE.IMAGE,
    AUDIO: FIELD_TYPE.AUDIO,
}

export const uploadHandler = (fieldData: { [key: string]: FIELD_TYPE } = FIELD_DATA_DEFAULT) => 
    async(async (req: CustomRequest, res: Response, next: NextFunction) => {
        async function wrapper(field: string, promise: Promise<any>) {
            const data = await promise;
            // logger('BBB', data);

            return {
                field, data,
            };
        }

        async function createPromise(file: any) {
            let promise = [] as Promise<UPLOAD_DATA>[];
            const fileName = randToken.generate(32);

            if (fieldData[file.fieldname] === FIELD_TYPE.IMAGE) {
                promise.push(wrapper(
                    file.fieldname,
                    writeGM(gm(file.path).flatten().autoOrient().resize(1280, 1280, '>').noProfile(), fileName + '.jpg')
                ));
                promise.push(wrapper(
                    file.fieldname,
                    writeGM(gm(file.path).flatten().autoOrient().resize(256, 256, '>').noProfile(), fileName + '.thumb.jpg')
                ));
            }

            if (fieldData[file.fieldname] === FIELD_TYPE.AUDIO) {
                promise.push(wrapper(
                    file.fieldname,
                    writeAudio(file.path, fileName + '.mp3')
                ));
            }

            return Promise.all(promise).then(v => {
                // logger('AAA', v);
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
            const data = await Promise.all(req.files.map(createPromise));
            // logger('CCC', data);
            data.forEach(iter => {
                switch (fieldData[iter.field]) {
                    case FIELD_TYPE.IMAGE: {
                        if (req.photo == null) req.photo = [];
                        req.photo.push(iter.data);
                        break;
                    }
                    case FIELD_TYPE.AUDIO: {
                        if (req.audio == null) req.audio = [];
                        req.audio.push(iter.data);
                        break;
                    }
                }
            });
        } else if (req.files != null) {
            let promises = [] as Promise<UPLOAD_DATA>[];
            for (let key in req.files) {
                promises = promises.concat(req.files[key].map(createPromise));
            }
            const data = await Promise.all(promises);
            // logger('DDD', data);
            data.forEach(iter => {
                switch (fieldData[iter.field]) {
                    case FIELD_TYPE.IMAGE: {
                        if (req.photo == null) req.photo = {};
                        if (req.photo[iter.field] == null) req.photo[iter.field] = [];
                        req.photo[iter.field].push(iter.data);
                        break;
                    }
                    case FIELD_TYPE.AUDIO: {
                        if (req.audio == null) req.audio = {};
                        if (req.audio[iter.field] == null) req.audio[iter.field] = [];
                        req.audio[iter.field].push(iter.data);
                        break;
                    }
                }
            });
        }
        
        next();
    });

export default function(req: Request, res: Response, next: NextFunction) {
    return mediaUpload(req, res, (err: any) => {
        if (err) next(err);
        else uploadHandler()(req, res, next);
    });
}