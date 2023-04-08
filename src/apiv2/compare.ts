import { Router, Response, NextFunction, Express } from 'express';
import async from './util/async';
import { sequelize } from '../db';
import { CustomRequest } from '../custom';
import FormData = require("form-data");
const fetch = require("node-fetch")
//import FormDataNode from "formdata-node";


import { Op } from 'sequelize';

import * as bodyParser from 'body-parser';

const router = Router();
export default router;

router.get(
    '/',
    async(async (req: CustomRequest, res: Response) => {
        const {id="",pw="", rival_nick="",level = 1} = req.query;

        const form = new FormData();
        form.append('id', id);
        form.append('pw', pw);
        const temp = await fetch("https://anzuinfo.me:443/login_check.php", {
                method: "POST",
                body: form
        })
        const is_success = await temp.text()
        if(is_success.indexOf("alert")!=-1){
            res.json({})
        }else{
            var sessid = String(temp.headers.get('set-cookie')).split(";")[0].substring(11);
            //console.log(temp.headers.get('set-cookie'))
            const temp2 = await fetch("https://anzuinfo.me/compare.html?search_id="+rival_nick+"&sort=minus_up&filter_level="+(2**(Number(level)-1)).toString()+"&filter_diff=255&filter_comp=31&filter_grade=1023",{
                method: "GET",
                headers: {
                    cookie: 'PHPSESSID='+sessid
                }
            })
            var response2 = await temp2.text();
            //console.log(response2)

            //console.log(response2.substring(response2.indexOf("내 평균 : ")+7,response2.indexOf("내 평균 : ")+7 + response2.substring(response2.indexOf("내 평균 : ")+7).indexOf("<")))
            //console.log(response2.substring(response2.indexOf("상대방 평균 : ")+9,response2.indexOf("상대방 평균 : ")+9 + response2.substring(response2.indexOf("상대방 평균 : ")+9).indexOf("<")))

            var rate_text = response2.substring(response2.indexOf("상대방 평균"));
            //console.log(rate_text.substring(rate_text.indexOf("<br><br>")+9,rate_text.indexOf("<br><br>")+9 + rate_text.substring(rate_text.indexOf("<br><br>")+9).indexOf("</div>")))

            res.json({
                "my_score" : response2.substring(response2.indexOf("내 평균 : ")+7,response2.indexOf("내 평균 : ")+7 + response2.substring(response2.indexOf("내 평균 : ")+7).indexOf("<")),
                "rival_score" : response2.substring(response2.indexOf("상대방 평균 : ")+9,response2.indexOf("상대방 평균 : ")+9 + response2.substring(response2.indexOf("상대방 평균 : ")+9).indexOf("<")),
                "win_rate" : rate_text.substring(rate_text.indexOf("<br><br>")+9,rate_text.indexOf("<br><br>")+9 + rate_text.substring(rate_text.indexOf("<br><br>")+9).indexOf("</div>"))
            })
        }
    }),
);

router.post(
    '/',
    async(async (req: CustomRequest, res: Response) => {
        console.log(req.body)
        const form = new FormData();
        form.append('id', String(req.body.account).split("||")[0]);
        form.append('pw', String(req.body.account).split("||")[1]);
        const temp = await fetch("https://anzuinfo.me:443/login_check.php", {
                method: "POST",
                body: form
        })
        const is_success = await temp.text()
        if(is_success.indexOf("alert")!=-1){
            res.json({})
        }else{
            var sessid = String(temp.headers.get('set-cookie')).split(";")[0].substring(11);
            //console.log(temp.headers.get('set-cookie'))
            const form2 = new FormData();
            form2.append('user', String(req.body.user));
            form2.append('track', String(req.body.track));
            const temp2 = await fetch("https://anzuinfo.me:443/saveScore6.php",{
                method: "POST",
                headers: {
                    cookie: 'PHPSESSID='+sessid
                },
                body: form2
            })
            var response2 = await temp2.text();
            console.log(response2)

            res.json({})
        }
    })
)