import { Router, Response, NextFunction, Express } from 'express';
import async from './util/async';
import { sequelize } from '../db';
import { CustomRequest } from '../custom';
import FormData = require("form-data");
const cheerio = require('cheerio');
const fetch = require("node-fetch")

import { Op } from 'sequelize';
import { Songs } from '../db/songs.model';

import * as bodyParser from 'body-parser';

import table_18PUC from "./18PUC.json"

const router = Router();
export default router;


router.get(
    '/',
    async(async (req: CustomRequest, res: Response) => {
    const {level = "", query = "", id = "", pw = ""} = req.query;
    const form = new FormData();
    form.append('id', id);
    form.append('pw', pw);
    var ans_title: String[] = [];
    const temp = await fetch("https://anzuinfo.me:443/login_check.php", {
            method: "POST",
            body: form
    })
    var sessid = String(temp.headers.get('set-cookie')).split(";")[0].substring(11);
    var filter_comp = "";
    var filter_grade = "";
    var filter_level = "";


    if(query == "PUC"){
        filter_comp = "16";
        filter_grade = "1023";
    }else if(query == "S"){
        filter_comp = "31";
        filter_grade = "512";
    }

    if(1<= Number(level) && Number(level)<=20){
      filter_level = String(Math.pow(2,Number(level)-1));
    }else if(level == "1920"){
      filter_level = "786432";
    }
    
    let result = await fetch("https://anzuinfo.me/myScore.html?ver=6&sort=update_down&filter_level="+filter_level+"&filter_diff=511&filter_comp="+filter_comp+"&filter_grade="+filter_grade,{
        method: "GET",
        headers: {
            cookie: 'PHPSESSID='+sessid
        }
    })
    result = await result.buffer();
    var $ = cheerio.load(result);
    const max_page = Number($("#cur_page").text().split(" ")[0].split("/")[1])

    for(var i=1;i<=max_page;i++){
        let result = await fetch("https://anzuinfo.me/myScore.html?ver=6&sort=update_down&filter_level="+filter_level+"&filter_diff=511&filter_comp="+filter_comp+"&filter_grade="+filter_grade+"&page="+i.toString(),{
            method: "GET",
            headers: {
                cookie: 'PHPSESSID='+sessid
            }
        })
        result = await result.buffer();
        var $ = cheerio.load(result);
        var title = $(".title").map((i:Number,element:Node) => {
            ans_title.push($(element).text());
        })
    }

    var ans_code: String[] = [];

    for(var i=0; i<ans_title.length;i++){
        const where: any = {};
        where["title"]={
            [Op.like]: ans_title[i]
        };
        if(1<= Number(level) && Number(level)<=20){
          where["level"]=Number(level);
        }else if(level == "1920"){
          where["level"] = {
            [Op.or] : [19,20]
          }
        }
        let song = await Songs.findOne({where});
        if(!song) continue;
        ans_code.push(song["code"])
    }
    res.send(ans_code);
  }),
);

router.get(
  '/18PUC',
  async(async (req: CustomRequest, res: Response) => {
    res.json(table_18PUC);
  }),
);
