import { Sequelize } from 'sequelize-typescript';
import path from 'path';
import { makeLogger } from '../util/logger';

const { db: dbConfig } = require('../../config');

const logger = makeLogger('DB');

const dir = path.join(__dirname, '**/*.model.[tj]s');
logger('models dir : ', dir);

export const sequelize = new Sequelize(dbConfig.uri, {
    ...dbConfig,
    models: [dir],
    modelMatch: (filename: string, member: string) => {
        return filename.substr(0, filename.indexOf('.model')).replace(/[-_]/gi, '') === member.toLowerCase();
    },
    logging: (msg: any) => logger(msg),
});