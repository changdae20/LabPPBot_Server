import { Router, Response, NextFunction, Express } from 'express';
import async from './util/async';
import { CustomRequest } from '../custom';
import cheerio from "cheerio";
import { Boj } from '../db/boj.model';
import { Op } from 'sequelize';
import moment from "moment-timezone";

const fs = require('fs');

const fetch = require("node-fetch");

const router = Router();

const { convert } = require('convert-svg-to-png');
const { convertFile }  = require('convert-svg-to-png');

export default router;

const grade_dict = ["Unranked","Bronze V","Bronze IV","Bronze Ⅲ","Bronze Ⅱ","Bronze I","Silver V","Silver IV","Silver Ⅲ","Silver Ⅱ","Silver I","Gold V","Gold IV","Gold Ⅲ","Gold Ⅱ","Gold I","Platinum V","Platinum IV","Platinum Ⅲ","Platinum Ⅱ","Platinum I","Diamond V","Diamond IV","Diamond Ⅲ","Diamond Ⅱ","Diamond I","Ruby V","Ruby IV","Ruby Ⅲ","Ruby Ⅱ","Ruby I","Master"];

function date():string {
    return moment().tz("Asia/Seoul").format("YYYY-MM-DD");
}

async function getACInfo(id:string, problem_id:number):Promise<string> {
    const res = await fetch(`https://www.acmicpc.net/status?problem_id=${problem_id}&user_id=${id}&language_id=-1&result_id=4&from_problem=1`, {
        headers:{
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.1.2222.33 Safari/537.36",
            "Accept-Encoding": "*",
            "Connection": "keep-alive"
        }
    });
    const html = await res.text();
    await fs.writeFileSync("test.html", html);
    const $ = cheerio.load(html);

    if( $("#status-table > tbody > tr").length == 0 ){
        return "ERROR";
    }

    let memory = $("#status-table > tbody > tr:nth-child(1) > td.memory").text();
    let time = $("#status-table > tbody > tr:nth-child(1) > td.time").text();
    let language = $("#status-table > tbody > tr:nth-child(1) > td:nth-child(7)").text();
    let code_length = $("#status-table > tbody > tr:nth-child(1) > td:nth-child(8)").text();
    let submit_time = $("#status-table > tbody > tr:nth-child(1) > td:nth-child(9) > a").attr("title");
    
    return `${memory},${time},${language},${code_length},${submit_time}`;
}

router.get('/',
    async(async (req: CustomRequest, res: Response) => {
        let res_text:String[] = [];
        let BOJ = await Boj.findAll({});

        for( let el of BOJ ){
            // solved ac에서 데이터 가져욤
            let solved_res = await fetch(`https://solved.ac/api/v3/user/show?handle=${el.nick}`);
            let solved_json = await solved_res.json();

            el["rating"] = solved_json["rating"];
            el["grade"] = grade_dict[solved_json["tier"]];

            await el.save();

            let solved_count = solved_json["solvedCount"];
            
            // if( el["solved"].split(",").length >= solved_count ) continue;
            // else{
                let new_solved_list:number[] = [];
                let i = 1;
                while( true ){
                    let new_req = await fetch(`https://solved.ac/api/v3/search/problem?query=solved_by:${el.nick}&page=${i}`);
                    let new_json = await new_req.json();

                    if( new_json["items"]?.length == 0 ) break;

                    for( let prob of new_json["items"] ){
                        new_solved_list.push(parseInt(prob["problemId"]));
                    }
                    i++;
                }

                new_solved_list.sort((a,b) => (a-b));
                
                let new_solved_str:string = new_solved_list.map((el) => {
                    return el.toString();
                }).join(",");

                if( el["solved"].length >= ( new_solved_str?.length ?? 0 )){
                    continue;
                }else{
                    let old = el["solved"].split(",");
                    for ( const prob of new_solved_str.split(",")){
                        // find prob in old
                        if(!old.includes(prob)){
                            // add message
                            res_text.push(`${el["name"]}!@#${prob}`);
                        }
                    }
                    
                    el["solved"] = new_solved_str;
                    await el.save();
                }

            // }
            
        }

        if(res_text.length==0){
            res.send("");
        }else{
            res.send(res_text.join(","));
        }
    }),
);

router.get('/problem',
    async(async (req: CustomRequest, res: Response) => {
        const {id} = req.query;
        let prob_res = await fetch(`https://solved.ac/api/v3/problem/show?problemId=${id}`);
        let json = await prob_res.json();

        res.send(json["titleKo"] + "!@#" + grade_dict[json["level"]]);
    })
);

router.get('/info',
    async(async (req: CustomRequest, res: Response) => {
        const {name} = req.query;
        
        let where: any = {};
        where["name"]=name;

        let boj = await Boj.findOne({where});

        if(!boj){
            res.send("ERROR");
        }else{
            res.send(boj.rating + "," + boj.grade);
        }
    })
);

router.get('/daily',
    async(async (req: CustomRequest, res: Response) => {
        const data = fs.readFileSync("data.json", "utf8");
        let json = JSON.parse(data);

        if( date() in json ){
            let prob_res = await fetch(`https://solved.ac/api/v3/problem/show?problemId=${json[date()]}`);
            let json2 = await prob_res.json();

            res.send(json[date()].toString() + "!@#" + json2["titleKo"] + "!@#" + grade_dict[json2["level"]]);
        }else {
            const problems_res = await fetch("https://solved.ac/api/v3/search/problem?query=*s5..g5");
            const problems_json = await problems_res.json();

            const count = problems_json["count"];

            let answer:number = 0;

            while(true){
                let idx = Math.floor(Math.random() * count);

                let page = Math.floor(idx / 50);
                let nth = idx % 50;

                let problems_res2 = await fetch(`https://solved.ac/api/v3/search/problem?query=*s5..g4&page=${page}`);
                let problems_json2 = await problems_res2.json();

                let problem = problems_json2["items"][nth]["problemId"];

                let boj = await Boj.findAll({});
                
                let flag = true;
                for ( let el of boj) {
                    if( el["solved"].split(",").includes(problem.toString()) ){
                        flag = false;
                        break;
                    }
                }
                if(flag){
                    answer = problem;
                    break;
                }
            }
            
            json[date()] = answer;
            fs.writeFileSync("data.json", JSON.stringify(json, null, 4));
            let prob_res = await fetch(`https://solved.ac/api/v3/problem/show?problemId=${answer}`);
            let json2 = await prob_res.json();

            res.send(answer.toString() + "!@#" + json2["titleKo"] + "!@#" + grade_dict[json2["level"]]);
        }
    })
);

router.get('/daily_ranking',
    async(async (req: CustomRequest, res: Response) => {
        const data = fs.readFileSync("data.json", "utf8");
        let json = JSON.parse(data);

        if( date() in json ){
            let problem = json[date()];
            console.log(`daily problem : ${problem}`);
            let boj = await Boj.findAll({});
                
            let ac:string[] = []; // 맞춘사람들의 이름
            for ( let el of boj) {
                if( el["solved"].split(",").includes(problem.toString()) ){
                    let solved_info = await getACInfo(el["nick"], problem);
                    if(solved_info!="ERROR"){
                        ac.push(`${el["name"]},${solved_info}`);
                    }
                }
            }

            res.send(ac.join("!@#"));
        }else {
            res.send("");
        }
    })
);

router.get('/solved_info',
    async(async (req: CustomRequest, res: Response) => {
        const {name = "", problem_id = 0} = req.query;

        let where: any = {};
        where["name"]=name;

        let boj = await Boj.findOne({where});

        if(!boj) res.send("");
        else{
            let solved_info = await getACInfo(boj["nick"],Number(problem_id));

            res.send(solved_info);
        }
    })
);

router.get('/info_image',
    async(async (req: CustomRequest, res: Response) => {
        const {name} = req.query;
        
        let where: any = {};
        where["name"]=name;

        let boj = await Boj.findOne({where});

        if(!boj){
            res.send("ERROR");
        }else{
            // let res2 = await fetch(`http://mazassumnida.wtf/api/v2/generate_badge?boj=${boj["nick"]}`);
            // let html = await res2.text();
            
            // console.log(html);
            // const png = await convert(req.body);

            // res.set('Content-Type', 'image/png');
            // res.send(png);
            const inputFilePath = 'src/apiv2/generate_badge.svg';
            const outputFilePath = await convertFile(inputFilePath);

            console.log(outputFilePath);
        }
    })
);