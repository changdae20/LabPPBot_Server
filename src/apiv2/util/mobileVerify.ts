import { MobileVerify } from "../../db/mobile_verify.model";
import { Op } from "sequelize";
import { Transaction } from "sequelize";

const { floor, random } = Math;
const {
    sms: smsConfig,
} = require('../../../config');

const VERIFIED_CODE = 'VERIFIED';

export function formatMobile(mobile: string) {
    if (mobile == null) throw 'ValidationError';

    mobile = mobile.replace(/[- ]/gi, '');
    if (mobile.length != 11) throw 'ValidationError';

    return mobile;
}

export function makeVerifyCode(len = 4) : string {
    let arr = [] as number[];
    for (let i = 0; i < len; i++) {
        arr.push(floor(random() * 10));
    }

    let result = arr.join('');
    const resultNum = parseInt(result);

    // https://stackoverflow.com/a/46486
    const checksum = (98 - resultNum * 100 % 97) % 97;
    result += checksum.toString().padStart(2, '0');
    return result;
}

export function checkVerifyCode(code: string) : boolean {
    const num = parseInt(code);
    if (isNaN(num)) return false;
    return num % 97 == 1;
}

async function getMobileVerify(mobile: string, transaction?: Transaction) {
    const now = new Date();
    const verify = await MobileVerify.findOne({
        where: {
            mobile,
            expireAt: {
                [Op.gt]: now,
            },
        },
        transaction
    });

    return verify;
}

export async function getMobileCode(mobile: string, transaction?: Transaction) : Promise<string> {
    mobile = formatMobile(mobile);
    const verify = await getMobileVerify(mobile, transaction);
    if (verify == null) throw 'NotFound';
    return verify.code;
}

export async function compareCode(mobile: string, code: string, transaction?: Transaction) : Promise<boolean> {
    if (!checkVerifyCode(code)) return false;
    const curCode = await getMobileCode(mobile, transaction);
    console.log(code, curCode);
    return code == curCode;
}

export async function expireCode(mobile: string, allowNull: boolean = true, transaction?: Transaction) {
    mobile = formatMobile(mobile);
    const verify = await getMobileVerify(mobile, transaction);
    if (verify == null) {
        if (allowNull) return;
        throw 'NotFound';
    }
    await verify.destroy({ transaction });
}

export async function extendCode(mobile: string, allowNull: boolean = true, transaction?: Transaction) {
    mobile = formatMobile(mobile);
    const verify = await getMobileVerify(mobile, transaction);
    if (verify == null) {
        if (allowNull) return;
        throw 'NotFound';
    }

    const now = new Date();
    const duration = parseInt(smsConfig.codeDuration) * 1000;
    const expireAt = new Date(now.getTime() + duration);

    await verify.update({
        expireAt,
    }, { transaction });
}

export async function verifyCode(mobile: string, transaction?: Transaction) {
    mobile = formatMobile(mobile);
    const verify = await getMobileVerify(mobile, transaction);
    if (verify == null) throw 'NotFound';

    await verify.update({
        code: VERIFIED_CODE,
    });
}

export async function checkVerified(mobile: string, transaction?: Transaction) {
    mobile = formatMobile(mobile);
    const verify = await getMobileVerify(mobile, transaction);
    if (verify == null) throw 'NotFound';

    return verify.code === VERIFIED_CODE;
}