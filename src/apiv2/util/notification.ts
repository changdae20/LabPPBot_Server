import FCM from './fcm';
import flatten from 'flat';
import { User } from '../../db/user.model';
import { Transaction, FindOrCreateOptions, FindOptions } from 'sequelize';
import { UserPushConfig } from '../../db/user_push_config.model';

const {
    firebase: firebaseConfig,
} = require('../../../config');

const fcm = new FCM(firebaseConfig.credential);

export async function getUserPushConfig(user: User|null, orCreate: boolean = false, transaction?: Transaction) {
    if (user == null) throw 'UserNotFound';

    const option: FindOrCreateOptions & FindOptions = {
        where: {
            userId: user.id,
        },
        defaults: {
            key: '',
        },
        transaction,
    };

    let config: UserPushConfig|null;

    if (orCreate) {
        [config] = await UserPushConfig.findOrCreate(option);
    } else {
        config = await UserPushConfig.findOne(option);
    }

    return config;
}

export default async function sendNotification(target: User, data: any) {
    const config = await getUserPushConfig(target);
    if (config == null) throw 'NotFound';

    const message = {
        to: config.key,
        notification: data.hidden ? undefined : {
            title: data.title,
            body: data.message,
            sound: 'hipod_notification.mp3',
        },
        data: flatten<any, any>(data),
    };

    await fcm.send(message);
}