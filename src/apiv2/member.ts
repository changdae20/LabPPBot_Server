import { Router, Response, NextFunction, Express } from 'express';
import async from './util/async';
import { sequelize } from '../db';
import { CustomRequest } from '../custom';



import { Op } from 'sequelize';
import { Member } from '../db/member.model';

import * as bodyParser from 'body-parser';

const router = Router();
export default router;


router.get(
    '/',
    async(async (req: CustomRequest, res: Response) => {
        const {chatroom_name} = req.query;
        if(chatroom_name==""){
            return res.json({});
        }
        let where: any = {};
        where["chatroom_name"]=chatroom_name;
        let result = await Member.findAll({where});
        let arrayed_result:string[] = [];
        result.forEach(element => {
            arrayed_result.push(element.name);
        });
        res.json(arrayed_result);
    }),
);

router.get(
    '/account',
    async(async (req: CustomRequest, res: Response) => {
        const {name, chatroom_name} = req.query;
        if(name=="" || chatroom_name == ""){
            return res.json({});
        }
        let where: any = {};
        where["name"]=name;
        where["chatroom_name"] = chatroom_name;
        let result = await Member.findOne({where});
        if(!result) res.json({});
        else if(result.info_id==null || result.info_pw==null || result.info_svid==null || result.permission==null) res.json({});
        else res.send(result.info_id+"//"+result.info_pw+"//"+result.info_svid+"//"+result.permission);
    }),
);