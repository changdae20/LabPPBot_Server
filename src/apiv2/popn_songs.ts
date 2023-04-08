import { Router, Response, NextFunction, Express } from 'express';
import async from './util/async';
import { sequelize } from '../db';
const fetch = require("node-fetch")
import cheerio from "cheerio";
import { CustomRequest } from '../custom';
import fs from "fs";

import { Op } from 'sequelize';
import { Popnsongs } from '../db/popn_songs.model';
import { Popndata } from '../db/popn_data.model';

import * as bodyParser from 'body-parser';

const router = Router();
export default router;

const sleep = (ms:number) => {
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

const namedict: { [id: string] : string; } = {};
// namedict for (name - rival_id(p.eagate.573.jp : popn music UniLab))
namedict['손창대'] = '0';

async function max_page(name:string,cookie:string,level:number){
    const res = await fetch(`https://p.eagate.573.jp/game/popn/unilab/p_friend/vs_lv.html?page=0&level=${level}&search=1&id=${namedict[name]}`, {
        headers: {
            cookie: 'M573SSID='+cookie
        },
    }, {method: 'GET'});
    const html = await res.text();

    const $ = cheerio.load(html);

    let max_page = await $("#main_contents_inner > div.right_contents > div > div.Rcont_info > div > div.inner_contents > div:nth-child(11)")?.children()?.length;

    if(!max_page) return 0;
    
    if(level==50) max_page = max_page - 1;
    else max_page = max_page - 2;

    return max_page ?? 0;
}

async function get_list_single(name:string, level:number, page:number, cookie:string){
    let url = `https://p.eagate.573.jp/game/popn/unilab/p_friend/vs_lv.html?page=${page}&level=${level}&search=1&id=${namedict[name]}`;

    const res = await fetch(url, {
        headers: {
            cookie: 'M573SSID='+cookie
        },
    }, {method: 'GET'});

    const html = await res.text();

    const $ = cheerio.load(html);

    if($("#pvs_list_table > tbody > tr").length<=2){ // 실패한경우
        await sleep(1000);
        await get_list_single(name, level, page, cookie);
        return;
    }

    for(let i=2; i<$("#pvs_list_table > tbody > tr").length;i++){
        let title = $(`#pvs_list_table > tbody > tr:nth-child(${i+1}) > td.pvs_music1 > a`).text();
        let genre = $(`#pvs_list_table > tbody > tr:nth-child(${i+1}) > td.pvs_music1`).text().replace(/            /g, "").substring(title.length);
        var reg = /\((EASY|N|H|EX)\)/g;
        let difficulty = reg.exec(genre)![1];
        genre = genre.replace(reg, "");
        let medal = $(`#pvs_list_table > tbody > tr:nth-child(${i+1}) > td.pvs_your1`)?.children()?.first()?.attr("src") ?? "";
        var reg2 = /meda_[a-z]+.png/g;
        medal = reg2.exec(medal)![0];
        medal = medal.substring(5,medal.indexOf(".png"));

        let grade = $(`#pvs_list_table > tbody > tr:nth-child(${i+1}) > td.pvs_your1`)?.children()?.first()?.next()?.attr("src") ?? "";
        var reg3 = /rank_[a-z0-9]+.png/g;
        grade = reg3.exec(grade)![0];
        grade = grade.substring(5,grade.indexOf(".png"));

        let score = Number($(`#pvs_list_table > tbody > tr:nth-child(${i+1}) > td.pvs_your1.pc_only`).text().replace(/ /g, ""));

        if(medal=='none' || grade=='none') continue;
        // console.log(`title : ${title}, genre : ${genre}, difficulty : ${difficulty}, level : ${level}`);

        const song = await Popnsongs.findOne({
            where: {
                title: title,
                genre: genre,
                diff: difficulty,
                level: level
            }
        });

        if(!song) continue;

        const data = await Popndata.findOne({
            where: {
                name: name,
                song_id: song.id,
            }
        });
        
        if(!data) { // 없으면 추가
            await Popndata.create({
                name: name,
                song_id: song.id,
                medal: medal,
                grade: grade,
                score: score
            });
        }else{ // 있으면 업데이트
            data["medal"] = medal;
            data["grade"] = grade;
            data["score"] = score;
            await data.save();
        }

    }

    return;
}

async function renewal(name:string){
    let start = new Date().getTime();
    const cookie = fs.readFileSync('./src/apiv2/cookie.cookie', 'utf-8');
    // for(const level of [41,42,43,44,45,46,47,48,49,50]){
    for(const level of [47,48,49,50]){
        let mp = await max_page(name,cookie,level)
        console.log(`max_page : ${mp}`);
        if(mp==0){
            return -1
        }
        let arr:any[] = []

        for(let i=0; i<mp; i++){
            arr.push(new Promise( (r,s) => r(get_list_single(name,level,i,cookie))));
        }
        
        await Promise.all(arr);
    }

    let end = new Date().getTime();
    return (end-start);
}


router.get('/',
    async(async (req: CustomRequest, res: Response) => {
        const {title = "", kind = ""} = req.query;
        if(kind==""){ // 곡명으로 조회해서 최고레벨 반환
            const where: any = {};
            where["title"]={
                [Op.like]: title
            };
            let song = await Popnsongs.findAll({where,order:[["level","DESC"]]});
            if(song && song.length>0){
                res.json(song[0]);
            }else{
                delete where["title"];
                where["nick1"] = {
                    [Op.like]: title
                }
                song = await Popnsongs.findAll({where,order:[["level","DESC"]]});

                if(song && song.length>0){
                    res.json(song[0]);
                    return;
                }else{
                    delete where["nick1"];
                    where["nick2"] = {
                        [Op.like]: title
                    }
                    song = await Popnsongs.findAll({where,order:[["level","DESC"]]});
                    if(song && song.length>0){
                        res.json(song[0]);
                        return;
                    }else{
                        delete where["nick2"];
                        where["nick3"] = {
                            [Op.like]: title
                        }
                        song = await Popnsongs.findAll({where,order:[["level","DESC"]]});
                        if(song && song.length>0){
                            res.json(song[0]);
                            return;
                        }else{
                            res.json({});
                            return;
                        }
                    }
                }
            }
        }else{
            const where: any = {};
            where["title"]={
                [Op.like]: title
            };
            where["level"]={
                [Op.like]: Number(kind)
            }
            let song = await Popnsongs.findOne({where});
            if(song){
                res.json(song);
                return;
            }else{
                delete where["title"];
                where["nick1"] = {
                    [Op.like]: title
                }
                song = await Popnsongs.findOne({where});
                if(song){
                    res.json(song);
                    return;
                }else{
                    delete where["nick1"];
                    where["nick2"] = {
                        [Op.like]: title
                    }
                    song = await Popnsongs.findOne({where});
                    if(song){
                        res.json(song);
                        return;
                    }else{
                        delete where["nick2"];
                        where["nick3"] = {
                            [Op.like]: title
                        }
                        song = await Popnsongs.findOne({where});
                        if(song){
                            res.json(song);
                            return;
                        }else{
                            res.json({});
                            return;
                        }
                    }
                }
            }
        }
    }),
);

router.get('/list',
    async(async (req: CustomRequest, res: Response) => {
        const {level = ""} = req.query;
        const where: any = {};
        where["level"]={
            [Op.like]: level
        };

        const data = await Popnsongs.findAll({where});
        if(!data){
            res.json({});
        }else{
            res.json(data);
        }
    }),
);

router.get('/search',
    async(async (req: CustomRequest, res: Response) => {
    const {search_text = ""} = req.query;
    const where: any = {};
    const data = await Popnsongs.findAll();
    let search_result:any[] = [];
    function LCS(a:String, b:String):number[] {
        var m = a.length, n = b.length, C = [], i:number, j:number;
        for (i = 0; i <= m; i++) C.push([0]);
        for (var j = 0; j < n; j++) C[0].push(0);
        for (var i = 0; i < m; i++)
            for (var j = 0; j < n; j++)
                C[i+1][j+1] = a[i] === b[j] ? C[i][j]+1 : Math.max(C[i+1][j], C[i][j+1]);
        return (function bt(i:number, j:number):number[] {
            if (i*j === 0) { return [0,i+j]; }
            if (a[i-1] === b[j-1]) {
                let temp = bt(i-1, j-1);
                return [temp[0] + 1, temp[1]];
            }
            if(C[i][j-1] > C[i-1][j]){
                let temp = bt(i, j-1);
                return [temp[0],temp[1]+3];
            }else{
                let temp = bt(i-1, j);
                return [temp[0],temp[1]+3];
            }
        }(m, n));
    }
    data.forEach((item,idx,arr) => {
    let lcs = [LCS(search_text.toString().toLowerCase(),item["title"].toLowerCase())];
        if(item["nick1"]) lcs.push(LCS(search_text.toString().toLowerCase(),item["nick1"].toLowerCase()));
        if(item["nick2"]) lcs.push(LCS(search_text.toString().toLowerCase(),item["nick2"].toLowerCase()));
        if(item["nick3"]) lcs.push(LCS(search_text.toString().toLowerCase(),item["nick3"].toLowerCase()));
        lcs.sort((a,b) => {
            if(a[0]==b[0]) return a[1]-b[1];
            else return b[0]-a[0];
        });
        search_result.push({
            song : item,
            lcs : lcs[0][0]*1000 - lcs[0][1]
        })
    })
    search_result.sort((a,b) => {
        return b["lcs"] - a["lcs"]
    })
    search_result = search_result.slice(0,5)
    res.json(search_result);
    }),
);

router.get('/renewal',
  async(async (req: CustomRequest, res: Response) => {
    const {name=""} = req.query;
    if(!(name in namedict)) res.send("-2");
    
    const elapsed_time = await renewal(name.toString());
    res.send(elapsed_time.toString());
  }),
);

router.post('/',
    async(async (req: CustomRequest, res: Response) => {
      const {title = null, genre = null, diff = null, level = null, nick1 = null, nick2 = null, nick3 = null, bpm = null, duration = null, notes = null} = req.body;
      const result = await Popnsongs.create({
          title,
          genre,
          diff,
          level,
          nick1,
          nick2,
          nick3,
          "bpm" : bpm ?? "?",
          "duration" : duration ?? "??:??",
          "notes" : notes ?? 0
      })
      if(!result){
          console.log("Error Occured")
          res.status(500).send("Error")
      }
      res.status(200).send("");
    }),
);

router.get('/score',
    async(async (req: CustomRequest, res: Response) => {
        const {name="", song_id = ""} = req.query;
        if(!(name in namedict)) res.send("-1//NP//NP");
        
        const data = await Popndata.findOne({
            where: {
                name: name as string,
                song_id: song_id as string,
            }
        });

        if(!data) res.send("-1//NP//NP");
        else res.send(`${data["score"]}//${data["grade"]}//${data["medal"]}`);
    }),
);

router.post('/nick',
    async(async (req: CustomRequest, res: Response) => {
        const {id = null, nick1 = null, nick2 = null, nick3 = null} = req.body;
        const result = await Popnsongs.findOne({
            where: {
                id : id
            }
        })
        if(!result){
            console.log("Error Occured")
            res.status(500).send("Error")
            return;
        }
        result["nick1"] = nick1;
        result["nick2"] = nick2;
        result["nick3"] = nick3;
        await result.save();
        res.status(200).send("OK");
    }),
);