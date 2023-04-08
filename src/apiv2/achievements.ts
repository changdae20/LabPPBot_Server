import { Router, Response, NextFunction, Express } from 'express';
import async from './util/async';
import { sequelize } from '../db';
import { CustomRequest } from '../custom';



import { Op } from 'sequelize';
import { AchievementsUser } from '../db/achievements_user.model';
import { Achievements } from '../db/achievements.model';

import * as bodyParser from 'body-parser';

const router = Router();
export default router;


router.get( // name이 달성한 achievements들의 json 반환
    '/user_achieved_list',
    async(async (req: CustomRequest, res: Response) => {
        const {name=""} = req.query;
        if(name==""){
            return res.json([]);
        }
        let achieved = await AchievementsUser.findAll({
            where: {
                "name" : String(name)
            },
            order: [
                ['id', 'ASC'],
            ],
            attributes: ['achievements_id'],
            raw : true
        })
        .then( el => el.map(el => Number(el["achievements_id"])));

        let achieved_time = await AchievementsUser.findAll({
            where: {
                "name" : String(name)
            },
            order: [
                ['achievements_id', 'ASC'],
            ],
            attributes: ['createdAt'],
            raw : true
        })
        .then( el => el.map(el => el["createdAt"]));



        let achievements = await Achievements.findAll({
            where:{
                id:{
                    [Op.in]:achieved
                }
            },
            order: [
                ['id', 'ASC'],
            ]
        });
        
        return res.json({achievements,achieved_time});
    }),
);

router.get(
    '/achievement_info',
    async(async (req: CustomRequest, res: Response) => {
        const {achievements_id = ""} = req.query;

        let achievement = await Achievements.findOne({
            where: {
                id : Number(achievements_id)
            }
        });

        if(!achievement){
            return res.json({"achievement":[],"achieved_user_list":[]});
        }else{
            let achieved_user_list = await AchievementsUser.findAll({
                where: {
                    "achievements_id" : Number(achievements_id)
                }
            });
            
            return res.json({achievement,achieved_user_list});
        }
    }),
);

router.get(
    '/achievement_list',
    async(async (req: CustomRequest, res: Response) => {

        let achievement = await Achievements.findAll();
        let users = await Promise.all(
            achievement.map(el => {
            let names = AchievementsUser.findAll({
                where: {
                    "achievements_id" : Number(el["id"])
                },
                attributes: ['name'],
                raw : true
            }).then( ell => ell.map(ell => String(ell["name"])));

            return names;
        }));

        return res.json({achievement,users});
    }),
);