import FormData = require("form-data");
const fetch = require("node-fetch")
import cheerio from "cheerio";
import iconv from "iconv-lite";
import fs from "fs";

import { Router, Response, NextFunction, Express } from 'express';
import async from './util/async';
import { CustomRequest } from '../custom';

const router = Router();
export default router;


const diffs=["novice","advanced","exhaust","maximum","infinite"];

const sleep = (ms:number) => {
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

async function check_login(svid:string,cookie:string){
    var url = "https://p.eagate.573.jp/game/sdvx/vi/playdata/rival/profile.html?rival_id="+svid;
    let result = await fetch(url,  {
        headers: {
            cookie: 'M573SSID='+cookie
        },
    });
    result = await result.text();
    //result = await result.buffer();
    //result = iconv.decode(result,"cp932").toString();
    var $ = cheerio.load(result);

    var t = $("#player_id").text()
    var a = $("#player_name p:nth-child(2)").text()
    var i = $("#force_point").text()
    var r = $(".profile_skill")?.attr("id")?.replace("skill_","")
    var n = $(".profile_cnt")?.first()?.text()?.replace("回","")
    return ""!=t ? (t+"\t"+a+"\t"+i+"\t"+r+"\t"+n) : ""
}

async function check_basic_course(svid:string,cookie:string){
    var url = "https://p.eagate.573.jp/game/sdvx/vi/playdata/rival/score.html?rival_id="+svid+"&page=1&sort_id=0";
    let result = await fetch(url,  {
        headers: {
            cookie: 'M573SSID='+cookie
        },
    });
    result = await result.text();
    //result = iconv.decode(result,"cp932").toString();
    var $ = cheerio.load(result);
    console.log($("#score_paging").text().replace(/s/g,""));
    var max_page = Number($("#score_paging").text().replace(/s/g,"").replace("＞","").split("・").pop());

    return max_page;
}

async function get_list_single(svid:string, page:number, cookie:string, id:string, pw:string, user_info:string){
    var tracks:any[] = [];

    let url = `https://p.eagate.573.jp/game/sdvx/vi/playdata/rival/score.html?rival_id=${svid}&page=${page}&sort_id=0`;
    let result = await fetch(url, {
        headers: {
            cookie: 'M573SSID='+cookie
        },
    });
    result = await result.text();
    // result = await result.buffer();
    // result = iconv.decode(result,"cp932").toString();
    var $ = cheerio.load(result);
    $("#pc_table #score_table td[rowspan]").each(function(){
        var e = $(this)?.find("#music_name")?.text()?.replace("(EXIT TUNES)","");
        for(var t=0;t<5;t++){
            let a=$(this)?.parent()?.nextAll()?.eq(t).find("#score_col_3, #score_col_4")
            let i=$(a).text();
            if("0"!=i){
                var r=diffs[t]
                let n=$(a)?.find("img")?.first()?.attr("src")?.replace("/game/sdvx/vi/images/playdata/rival/rival_mark_","")?.replace(".png","");
                tracks.push(String(e+"\t"+r+"\t"+n+"\t"+i));
                // tracks.push(e+"\\\\"+r+"\\\\"+n+"\\\\"+i);
            }
        }
    })
    if(tracks.length==0){
        await sleep(100);
        await get_list_single(svid,page,cookie,id,pw,user_info);
    }else{
        let formData = new FormData();
        formData.append('id', id);
        formData.append('pw', pw);
        
        result = await fetch("https://anzuinfo.me:443/login_check.php", {
            method: 'post',
            body: formData
        });
        let text = await result.text();
        let sessid = result.headers.raw()['set-cookie'][0].split(";")[0].substring(11, result.headers.raw()['set-cookie'][0].split(";")[0].length);
        let raw_cookie = result.headers.raw()['set-cookie'][0]


        let formData2 = new FormData();
        formData2.append('user', user_info);
        formData2.append('track', tracks.join("|"));
        const opts = {
            headers: {
                cookie: "PHPSESSID="+sessid
            },
            method: 'post',
            body: formData2
        };
        let res = await fetch("https://anzuinfo.me:443/saveScore6.php", opts );
        res = await res.text();
        res = res.indexOf("완료");
        while(res==-1){
            await sleep(1000);
            res = await get_list_single(svid,page,cookie,id,pw,user_info);
        }
        console.log(`Page${page} 완료, length : ${tracks.length}`);
        return 0;
    }
}

async function renewal(svid:any ,id:any ,pw:any){
    let start = new Date().getTime();
    const cookie = fs.readFileSync('./src/apiv2/cookie.cookie', 'utf-8');
    let user_info = await check_login(svid,cookie);
    console.log(`user_info : ${user_info}`);
    if(user_info==""){
        return -1
    }  
    let max_page = await check_basic_course(svid,cookie)
    console.log(`max_page : ${max_page}`);
    if(max_page==0){
        return -1
    }
    let arr:any[] = []

    for(let i=1; i<=max_page; i++){
        arr.push(new Promise( (r,s) => r(get_list_single(svid,i,cookie,id,pw,user_info))));
    }
    
    await Promise.all(arr);

    let end = new Date().getTime();
    return (end-start);
}




router.get(
    '/', async(async (req: CustomRequest, res: Response) => {
        const {svid = "", id = "", pw = ""} = req.query;
        let final_result = -1;
        for(let i=1; i<=5; i++){ // 5번까지는 retry하도록
            const elapsed_time = await renewal(svid, id, pw);
            if(elapsed_time!=-1){
                final_result = elapsed_time;
                break;
            }else{
                console.log(`renewal retry ${i}`);
                await sleep(1000);
            }
        }
        res.send(final_result.toString());
    })
);
