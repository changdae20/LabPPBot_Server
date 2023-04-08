import firebaseadmin, { messaging } from 'firebase-admin';

export class CustomPayload {
    to?: string;
    registration_ids?: string[];
}

type Payload = CustomPayload & messaging.MessagingPayload;

export default class FCM {
    private static invalidPayloadField(fieldname: string) {
        return new Error(`Invalid "${fieldname} field in payload`);
    }

    private static NOT_PROVIDE_PAYLOAD = new Error('You must provide a payload object');
    private static INVALID_PAYLOAD = new Error('Invalid payload object');
    private static INVALID_PAYLOAD_TO = FCM.invalidPayloadField("to");
    private static INVALID_PAYLOAD_REG_IDS = FCM.invalidPayloadField("registration_ids");

    constructor(config: any) {
        firebaseadmin.initializeApp({
            credential: firebaseadmin.credential.cert(config),
        });
    }

    
    async send(payload: Payload) {
        if (payload == null) throw FCM.NOT_PROVIDE_PAYLOAD;

        if (payload.to) {
            if (typeof payload.to != 'string') throw FCM.INVALID_PAYLOAD_TO;

            const to = payload.to as string;
            delete payload.to;

            if (to.startsWith('/topics/')) {
                const topic = to.slice(8);
                return await firebaseadmin.messaging().sendToTopic(topic, payload);
            } else {
                return await firebaseadmin.messaging().sendToDevice(to, payload);
            }
        } else if (payload.registration_ids) {
            const regIds = payload.registration_ids;
            delete payload.registration_ids;

            if (!Array.isArray(regIds) || typeof regIds[0] != 'string') throw FCM.INVALID_PAYLOAD_REG_IDS;

            return await firebaseadmin.messaging().sendToDevice(regIds, payload);
        } else {
            throw FCM.INVALID_PAYLOAD;
        }
    }
}