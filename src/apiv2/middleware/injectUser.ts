import async from '../util/async';
import randToken from 'rand-token';
import { User } from '../../db/user.model';
import { Passport, ACCOUNT_TYPE } from '../../db/passport.model';
import { Response, Request, NextFunction } from 'express';
import { CustomRequest } from '../../custom';
import { makeLogger } from '../../util/logger';

export function setUser(this: CustomRequest, user: User|null) {
    return new Promise(res => {
        this.user = user;
        this.session.userId = user && user.id;
        res();
    });
}

export async function setUserBearer(this: CustomRequest, user: User|null) {
    this.user = user;
    if (user == null) {
        await Passport.destroy({
            where: {
                type: ACCOUNT_TYPE.BEARER,
                identifier: this.token ?? null,
            },
        });
    } else {
        const accessToken = randToken.generate(32);
        await Passport.create({
            type: ACCOUNT_TYPE.BEARER,
            identifier: accessToken,
            userId: user.id,
        });
        this.token = accessToken;
        return accessToken;
    }
}

const logger = makeLogger('TOKEN');

async function injectUser(req: CustomRequest, res: Response, next: NextFunction) {
    logger(req.token);
    if (req.token != null) {
        req.setUser = setUserBearer.bind(req);
        const passport = await Passport.findOne({
            where: {
                type: ACCOUNT_TYPE.BEARER,
                identifier: req.token,
            },
        });
        if (passport != null) {
            req.user = await passport.$get('user');
        }
    } else {
        req.setUser = setUser.bind(req);
        if (req.session.userId != null) {
            const user = await User.findByPk(req.session.userId);
            req.user = user;
        }
    }

    next();
}

export default async(injectUser);