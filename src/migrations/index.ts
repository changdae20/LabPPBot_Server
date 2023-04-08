import Sequelize from 'sequelize';
import Umzug from 'umzug';

import { sequelize } from '../db';
import { makeLogger } from '../util/logger';

const queryInterface = sequelize.getQueryInterface();
const logger = makeLogger('MIGRATION');

const umzug = new Umzug({
    storage: 'sequelize',
    storageOptions: {
        sequelize: sequelize,
        tableName: 'sequelizeMeta',
        columnName: 'migration',
    },
    migrations: {
        path: __dirname,
        pattern: /^\d+-[\w-]+\.[tj]s$/,
        params: [queryInterface, Sequelize],
    },
    logging: (msg: any) => logger(msg),
});

export default async function doMigration() {
    logger('Running Migrations...');
    await umzug.up();
    logger('Complete!');
}