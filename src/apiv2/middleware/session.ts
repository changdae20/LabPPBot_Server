import session from 'express-session';
// import { sequelize } from '../../db';

const {
    auth: authConfig
} = require('../../../config');


export default session({
    secret: authConfig.sessionSecret,
    resave: false,
    saveUninitialized: false,
    // store: sessionStore,
});