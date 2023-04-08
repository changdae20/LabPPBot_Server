import express from 'express';
import cors from 'cors';
import serveStatic from 'serve-static';
import path from 'path';
import listen from './util/listen';
import * as bodyParser from 'body-parser';

import { sequelize } from './db';
import api from './apiv2';
import migrations from './migrations';

(async () => {
    await migrations();
    await sequelize.sync();
    
    const app = express();
    app.set('query parser', 'simple');
    app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);
    
    if (process.env.NODE_ENV !== 'production') {
        app.use(cors({
            origin: (_, callback) => callback(null, true),
            credentials: true,
        }));
    } else {
        app.use(cors({
            origin: ['http://localhost:8080'],
            credentials: true,
        }));
    }
    
    if (process.env.NODE_ENV !== 'production') {
        app.use('/docs', serveStatic(path.resolve(__dirname, '../apidoc')));
    }
    app.use(bodyParser.json({limit: '50mb'}));
    app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

    app.use(api);
    
    listen(app);
})();

// setInterval(() => {
//     const memoryData = process.memoryUsage();
//     const memoryUsage = {
//       rss: `${memoryData.rss / 1024 / 1024} MB`,
//       heapTotal: `${memoryData.heapTotal / 1024 / 1024} MB`,
//       heapUsed: `${memoryData.heapUsed / 1024 / 1024} MB`,
//       external: `${memoryData.external / 1024 / 1024} MB`,
//     };
//     console.log(memoryUsage);
// }, 1000);