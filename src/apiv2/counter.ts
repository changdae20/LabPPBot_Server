import { Router, Response, NextFunction, Express } from 'express';
import async from './util/async';
import { sequelize } from '../db';
import { CustomRequest } from '../custom';



import { Op } from 'sequelize';
import { Counter } from '../db/counter.model';
import { CounterValue } from '../db/counter_value.model';
import { AchievementsUser } from '../db/achievements_user.model';
import { Achievements } from '../db/achievements.model';

import * as bodyParser from 'body-parser';

const router = Router();
export default router;


router.get(
    '/',
    async(async (req: CustomRequest, res: Response) => {
        const {name="", counter_id=""} = req.query;
        if(name==""){
            return res.send("ERROR");
        }
        let where: any = {};
        where["name"]=name;
        where["counter_id"]=counter_id;
        let c_value = await CounterValue.findOne({where});
        if(!c_value){ // counter_value가 존재하지 않는경우, counter에서 id값을 읽어 초기값을 조회, 그 값으로 새로 하나 만들고 반환
            where = {};
            where["id"]=counter_id;
            let counter = await Counter.findOne({where});
            if(!counter){
                return res.send("ERROR");
            }else{
                let default_value = counter["default_value"];
                c_value = await CounterValue.create({
                    name,
                    counter_id,
                    "counter_value":default_value
                });
            }
        }
        if(!c_value){
            return res.send("ERROR");
        }else{
            res.send(String(c_value["counter_value"]));
        }
    }),
);

router.get(
    '/inventory',
    async(async (req: CustomRequest, res: Response) => {
        const {name=""} = req.query;
        if(name==""){
            res.json([0,0,0,0,0,0,0]);
        }

        let inven : any = {};


        for(const counter_id of [1,2,3,29,6,7,8]){
        //[1,2,3,29,6,7,8].forEach(async counter_id => {
            let where: any = {};
            where["name"]=name;
            where["counter_id"]=counter_id;
            let c_value = await CounterValue.findOne({where});
            if(!c_value){ // counter_value가 존재하지 않는경우, counter에서 id값을 읽어 초기값을 조회, 그 값으로 새로 하나 만들고 반환
                let counter = await Counter.findOne({where:{
                    "id":counter_id
                }});
                if(!counter){
                    return res.json([0,0,0,0,0,0,0]);
                }else{
                    let default_value = counter["default_value"];
                    c_value = await CounterValue.create({
                        name,
                        counter_id,
                        "counter_value":default_value
                    });
                }
            }
            if(!c_value){
                return res.json([0,0,0,0,0,0,0]);
            }else{
                inven[counter_id] = c_value["counter_value"];
            }
        }

        return res.json(inven);
    }),
);

router.get(
    '/turtlenow',
    async(async (req: CustomRequest, res: Response) => {
        let turtle = 0;
        let zara = 0;

        for(const counter_id of [1,2,3,29]){
            let where: any = {};
            where["counter_id"]=counter_id;
            let c_value = await CounterValue.findAll({where});
            turtle = turtle + c_value.reduce((sum, current) => sum + Number(current["counter_value"]), 0);
        }
        
        for(const counter_id of [6]){
            let where: any = {};
            where["counter_id"]=counter_id;
            let c_value = await CounterValue.findAll({where});
            zara = zara + c_value.reduce((sum, current) => sum + Number(current["counter_value"]), 0);
        }

        return res.json({"turtle":turtle,"zara":zara});
    }),
);

router.post(
    '/',
    async(async (req: CustomRequest, res: Response) => {
        const {name="", counter_id="", counter_value=""} = req.body;
        if(name==""){
            return res.send("ERROR");
        }
        
        // counter_id에 대한 항목이 없는 경우 생성 (GET 복붙)
        let where: any = {};
        where["name"]=name;
        where["counter_id"]=counter_id;
        let c_value = await CounterValue.findOne({where});
        if(!c_value){ // counter_value가 존재하지 않는경우, counter에서 id값을 읽어 초기값을 조회, 그 값으로 새로 하나 만들고 반환
            where = {};
            where["id"]=counter_id;
            let counter = await Counter.findOne({where});
            if(!counter){
                return res.send("ERROR");
            }else{
                let default_value = counter["default_value"];
                c_value = await CounterValue.create({
                    name,
                    counter_id,
                    "counter_value":default_value
                });
            }
        }
        if(!c_value){
            return res.send("ERROR");
        }else{
            // 이제 CounterValue에 만들어짐, Update하면 됨.

            if(counter_id==7){ // 최장수 거북이의 나이, value와 기존값중 max 택해서 update.
                c_value["counter_value"] = Math.max(Number(c_value["counter_value"]), Number(counter_value));
            }else if(counter_id==8){ // 최연소 거북이의 나이, value와 (-기존값)중 max 택해서 update.
                c_value["counter_value"] = Math.max(Number(c_value["counter_value"]), -Number(counter_value));
            }else{
                c_value["counter_value"] = Number(c_value["counter_value"]) + Number(counter_value);
            }
            await c_value.save();


            // 이후 (1) counter_id가 존재하는 achievements들중에서
            //      (2) goal_counter>=counter_value를 만족하고
            //      (3) (name, counter_id) pair가 achievements_user에 없는 achievements를 가져와서 반환
            

            // 먼저 (3)을 위해 name이 달성한 업적 id들을 받아온다
            let done_achievements = await AchievementsUser.findAll({
                where: {
                    name
                },
                attributes: ['achievements_id'],
                raw : true
            })
            .then( el => el.map(el => Number(el["achievements_id"])));

            // 이후 (1) (2) (3)을 만족하는 업적들 가져옴. 이게 새로 달성한 업적들임.
            let achievements = await Achievements.findAll({
                where:{
                    counter_id:counter_id,
                    goal_counter:{
                        [Op.lte]: Number(c_value["counter_value"])
                    },
                    id:{
                        [Op.notIn]: done_achievements
                    }
                }
            });

            achievements.forEach( async (el:Achievements) => {
                let make_achievement = await AchievementsUser.create({
                    name,
                    "achievements_id" : el["id"]
                });
            });

            // 새로 달성한 업적들 return
            return res.json(achievements);
        }
    }),
);