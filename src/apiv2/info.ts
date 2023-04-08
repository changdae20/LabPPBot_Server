import { Router, Response, NextFunction, Express } from 'express';
import async from './util/async';
import { sequelize } from '../db';
import { CustomRequest } from '../custom';
import FormData = require("form-data");

import { Songs } from '../db/songs.model';
import iconv from "iconv-lite";
const fetch = require("node-fetch")
var wkhtmltox = require("wkhtmltox");
const fs = require("fs");
const Readable = require('stream').Readable;
const cheerio = require('cheerio');
// instantiate a new converter.
var converter = new wkhtmltox();

import { Op } from 'sequelize';

import * as bodyParser from 'body-parser';
import { clear } from 'console';

const router = Router();
export default router;

router.get(
    '/',
    async(async (req: CustomRequest, res: Response) => {
        const {id = "", pw = "", title = "", level = ""} = req.query;
        const form = new FormData();
        form.append('id', id);
        form.append('pw', pw);
        const temp = await fetch("https://anzuinfo.me:443/login_check.php", {
                method: "POST",
                body: form
        })
        var sessid = String(temp.headers.get('set-cookie')).split(";")[0].substring(11);
        //console.log(temp.headers.get('set-cookie'))

        var title_index = -1;
        var page = 1;
        var res_text = "";
        while(title_index==-1 && page<=12){
            var temp2 = await fetch("https://anzuinfo.me/myScore.html?ver=6&sort=score_down&filter_level="+(2**(Number(level)-1)).toString()+"&filter_diff=511&filter_comp=31&filter_grade=1023&page="+page.toString(),{
                method: "GET",
                headers: {
                    cookie: 'PHPSESSID='+sessid
                }
            })
            res_text = await temp2.text()

            title_index = res_text.indexOf(">"+title+"<");
            page = page + 1;
        }

        if(title_index==-1){
            res.send("-1//NP")
        }else{
            var score = res_text.substring(title_index).substring(res_text.substring(title_index).indexOf("<b>")+3,res_text.substring(title_index).indexOf("</b>"));
            var lamp_text = res_text.substring(title_index-200);
            //console.log(lamp_text);
            var clear_lamp = lamp_text.substring(lamp_text.indexOf("class='cp ")+10,lamp_text.indexOf("class='cp ")+10 + lamp_text.substring(lamp_text.indexOf("class='cp ")+10).indexOf("'>"));
            //console.log(clear_lamp)
            res.send(score+"//"+clear_lamp);
        }
    })
)

router.get(
    '/info',
    async(async (req: CustomRequest, res: Response) => {
        const {id = "", pw = "", title = "", level = ""} = req.query;
        const form = new FormData();
        form.append('id', id);
        form.append('pw', pw);
        const temp = await fetch("https://anzuinfo.me:443/login_check.php", {
                method: "POST",
                body: form
        })
        var sessid = String(temp.headers.get('set-cookie')).split(";")[0].substring(11);
        //console.log(temp.headers.get('set-cookie'))
        const temp2 = await fetch("https://anzuinfo.me/profile.html",{
            method: "GET",
            headers: {
                cookie: 'PHPSESSID='+sessid
            }
        })
        var text2 = await temp2.text()
        var svid = text2.substring(text2.indexOf("<td>")+4,text2.indexOf("</td>"));
        text2 = text2.substring(text2.indexOf("</td>")+1);
        var nick = text2.substring(text2.indexOf("<td>")+4,text2.indexOf("</td>"));
        text2 = text2.substring(text2.indexOf("</td>")+1);
        var dan = text2.substring(text2.indexOf("<td>")+4,text2.indexOf("</td>"));
        text2 = text2.substring(text2.indexOf("</td>")+1);
        var volforce = text2.substring(text2.indexOf("<td>")+4,text2.indexOf("</td>"));
        text2 = text2.substring(text2.indexOf("</td>")+1);
        var play_count = text2.substring(text2.indexOf("<td>")+4,text2.indexOf("</td>"));
        text2 = text2.substring(text2.indexOf("</td>")+1);
        var date = text2.substring(text2.indexOf("<td>")+4,text2.indexOf("</td>"));
        text2 = text2.substring(text2.indexOf("</td>")+1);
    
        res.send(svid+"//"+nick+"//"+dan+"//"+volforce+"//"+play_count+"//"+date)
    })
)

router.get(
    '/volforce_list',
    async(async (req: CustomRequest, res: Response) => {
        const {id = "", pw = ""} = req.query;
        const form = new FormData();
        form.append('id', id);
        form.append('pw', pw);
        const temp = await fetch("https://anzuinfo.me:443/login_check.php", {
                method: "POST",
                body: form
        })
        var sessid = String(temp.headers.get('set-cookie')).split(";")[0].substring(11);

        const temp2 = await fetch("https://anzuinfo.me/profile.html",{
            method: "GET",
            headers: {
                cookie: 'PHPSESSID='+sessid
            }
        })
        
        // let html = await temp2.buffer();
        // html = iconv.decode(html,"cp932").toString();
        let html = await temp2.text();
        // html = iconv.decode(html,"utf-8").toString();
        // html = iconv.encode(html,"cp932").toString();
        html = '<link rel="stylesheet" type="text/css" href="/home/ubuntu/EndTime-server/css/base.css">' + '\n' + '<link rel="stylesheet" type="text/css" href="/home/ubuntu/EndTime-server/css/profile.css">' + '\n' + html;
        html = '<style> @font-face {font-family: "NanumBarunGothic"; src: url("/home/ubuntu/EndTime-server/css/NanumBarunGothic.ttf") format("truetype");} </style>' + html;

        const s = new Readable();
        s._read = () => {}; // redundant? see update below
        s.push(html);
        s.push(null);

        res.set('Content-Type', 'image/png');

        converter.image(s, { encoding : "utf-16", "crop-x" : 70, "crop-y" : 696, "crop-w" : 707, "crop-h" : 1656, format: "png" })
        .pipe( res );
    })
)

router.get(
    '/new_volforce_list',
    async(async (req: CustomRequest, res: Response) => {
        const {id = "", pw = ""} = req.query;
        const form = new FormData();
        form.append('id', id);
        form.append('pw', pw);
        const temp = await fetch("https://anzuinfo.me:443/login_check.php", {
                method: "POST",
                body: form
        })
        var sessid = String(temp.headers.get('set-cookie')).split(";")[0].substring(11);

        const temp2 = await fetch("https://anzuinfo.me/profile.html",{
            method: "GET",
            headers: {
                cookie: 'PHPSESSID='+sessid
            }
        })
        
        let write_html = fs.readFileSync("/home/ubuntu/EndTime-server/src/apiv2/volforce_list/volforce_list.html", "utf-8");
        let read_html = await temp2.text();
        let $ = cheerio.load(read_html);
        let $2 = cheerio.load(write_html);

        let same_volforce_rank = 0;
        let same_volforce_value = 0;
        
        for(let i=1;i<=50; i++){
            let el = $(`body > section > div > div.wrap > div.outer_top50 > table > tbody > tr:nth-child(${i})`);
            let title = el.find(".title").text();
            let diff = el.find(".diff").attr("class").split(" ")[1];
            let level =  el.find(".diff").text();
            let clear_mark = el.find(".top50_comp").text();
            console.log(clear_mark);
            if(clear_mark == "EX-Comp"){
                clear_mark = "ex_comp";
            }else if(clear_mark == "Comp"){
                clear_mark = "comp";
            }else if(clear_mark == "UC"){
                clear_mark = "uc";
            }else if(clear_mark == "PUC"){
                clear_mark = "puc";
            }  
            console.log(clear_mark);

            let score = el.find(".top50_score").text();
            let volforce = el.find(".top50_volforce").text();
            let rank = i;
            if(volforce == same_volforce_value){
                rank = same_volforce_rank;
            }else{
                same_volforce_rank=i;
                same_volforce_value = volforce;
            }
            
            const where: any = {};
            where["title"]={
                [Op.eq]: title
            };
            where["level"]={
                [Op.eq]: level
            };

            let song = await Songs.findOne({where});

            let code = "";
            if(song == null){
                code = "00000";
            }else{
                code = song.code.toLowerCase();
            }

            console.log(code);

            
            $2(`#root > div > div.Frame > div.col${Math.floor((i-1)/25 + 1)} > div:nth-child(${((i-1)%25)+1}) > span.title`).html(title);
            $2(`#root > div > div.Frame > div.col${Math.floor((i-1)/25 + 1)} > div:nth-child(${((i-1)%25)+1}) > img.jacket`).attr("src", `/home/ubuntu/songs/${code}/jacket.png`);
            $2(`#root > div > div.Frame > div.col${Math.floor((i-1)/25 + 1)} > div:nth-child(${((i-1)%25)+1}) > span.diff`).attr("class", `diff ${diff}`);
            $2(`#root > div > div.Frame > div.col${Math.floor((i-1)/25 + 1)} > div:nth-child(${((i-1)%25)+1}) > span.diff`).html(diff.toUpperCase());
            $2(`#root > div > div.Frame > div.col${Math.floor((i-1)/25 + 1)} > div:nth-child(${((i-1)%25)+1}) > span.level`).html(`/  Lv${level}`);

            $2(`#root > div > div.Frame > div.col${Math.floor((i-1)/25 + 1)} > div:nth-child(${((i-1)%25)+1}) > div.clear_mark`).attr("class", `clear_mark ${clear_mark}`);
            $2(`#root > div > div.Frame > div.col${Math.floor((i-1)/25 + 1)} > div:nth-child(${((i-1)%25)+1}) > span.score`).html(`${score}`);
            $2(`#root > div > div.Frame > div.col${Math.floor((i-1)/25 + 1)} > div:nth-child(${((i-1)%25)+1}) > span.volforce`).html(`${volforce}`);
            $2(`#root > div > div.Frame > div.col${Math.floor((i-1)/25 + 1)} > div:nth-child(${((i-1)%25)+1}) > span.rank_num`).html(`${rank}`);

        }

        const s = new Readable();
        s._read = () => {}; // redundant? see update below
        s.push($2.html());
        s.push(null);

        res.set('Content-Type', 'image/png');

        converter.image(s, { encoding : "utf-16", quality : 100, width : 900, height : 1600, format: "png" })
        .pipe( res );
        // res.send("");
    })
)

router.get(
    '/average',
    async(async (req: CustomRequest, res: Response) => {
        const {id = "", pw = ""} = req.query;
        const form = new FormData();
        form.append('id', id);
        form.append('pw', pw);
        const temp = await fetch("https://anzuinfo.me:443/login_check.php", {
                method: "POST",
                body: form
        })
        var sessid = String(temp.headers.get('set-cookie')).split(";")[0].substring(11);

        const temp2 = await fetch("https://anzuinfo.me/profile.html",{
            method: "GET",
            headers: {
                cookie: 'PHPSESSID='+sessid
            }
        })
        
        let html = await temp2.text();
        html = '<link rel="stylesheet" type="text/css" href="/home/ubuntu/EndTime-server/css/base.css">' + '\n' + '<link rel="stylesheet" type="text/css" href="/home/ubuntu/EndTime-server/css/profile.css">' + '\n' + html;
        html = '<style> @font-face {font-family: "NanumBarunGothic"; src: url("/home/ubuntu/EndTime-server/css/NanumBarunGothic.ttf") format("truetype");} </style>' + html;

        const s = new Readable();
        s._read = () => {}; // redundant? see update below
        s.push(html);
        s.push(null);

        res.set('Content-Type', 'image/png');

        converter.image(s, { encoding : "utf-16", "crop-x" : 70, "crop-y" : 2390, "crop-w" : 225, "crop-h" : 555, format: "png" })
        .pipe( res );
    })
)

router.get(
    '/statistics',
    async(async (req: CustomRequest, res: Response) => {
        const {id = "", pw = "", level = ""} = req.query;
        const form = new FormData();
        form.append('id', id);
        form.append('pw', pw);
        const temp = await fetch("https://anzuinfo.me:443/login_check.php", {
                method: "POST",
                body: form
        })
        var sessid = String(temp.headers.get('set-cookie')).split(";")[0].substring(11);

        const temp2 = await fetch(`https://anzuinfo.me/myScore.html?ver=6&sort=update_down&filter_level=${2**(Number(level)-1)}&filter_diff=511&filter_comp=31&filter_grade=1023`,{
            method: "GET",
            headers: {
                cookie: 'PHPSESSID='+sessid
            }
        })
        
        let html = await temp2.text();
        html = '<link rel="stylesheet" type="text/css" href="/home/ubuntu/EndTime-server/css/base.css">' + '\n' + html;
        html = '<link rel="stylesheet" type="text/css" href="/home/ubuntu/EndTime-server/css/profile.css">' + '\n' + html;
        html = '<link rel="stylesheet" type="text/css" href="/home/ubuntu/EndTime-server/css/myScore.css">' + '\n' + html;
        html = '<style> @font-face {font-family: "NanumBarunGothic"; src: url("/home/ubuntu/EndTime-server/css/NanumBarunGothic.ttf") format("truetype");} </style>' + html;

        const s = new Readable();
        s._read = () => {}; // redundant? see update below
        s.push(html);
        s.push(null);

        res.set('Content-Type', 'image/png');

        converter.image(s, { encoding : "utf-16", "crop-x" : 72, "crop-y" : 560, "crop-w" : 722, "crop-h" : 204, format: "png" })
        .pipe( res );
    })
)