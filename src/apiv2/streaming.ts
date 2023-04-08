

import { Router, Response, NextFunction, Express } from 'express';
import async from './util/async';
import { sequelize } from '../db';
import { CustomRequest } from '../custom';
import FormData = require("form-data");
const fetch = require("node-fetch")
const Youtube = require('youtube-stream-url');
//import FormDataNode from "formdata-node";


import { Op } from 'sequelize';

import * as bodyParser from 'body-parser';

const router = Router();
export default router;

router.get(
    '/',
    async(async (req: CustomRequest, res: Response) => {
        const {kind = ""} = req.query;
        console.log(kind)
        var link = ""
        if(kind == "싸이발키리" || kind == "싸발") link = "[SDVX] [VM - R Side] KR LIVE 싸이뮤직 게임월드(CYGameworld) SOUND VOLTEX EXCEED GEAR 실시간 방송";
        else if(kind == "싸이구기체") link = "[SDVX] [SM - Number 1] KR LIVE 싸이뮤직 게임월드(CYGameworld) SOUND VOLTEX EXCEED GEAR 실시간 방송";
        else if(kind == "량진발키리" || kind == "어뮤즈발키리" || kind == "노량진발키리") link = "[AmuseTown] SDVX -Valk";
        else if(kind == "량진구기체" || kind == "어뮤즈구기체" || kind == "노량진구기체") link = "[AmuseTown] SoundVoltex Live stream"
        else if(kind == "량진팝픈" || kind == "어뮤즈팝픈" || kind == "량팝") link = "[Amusetown] Pop'n music Live Stream"
        else if(kind == "싸이라이트닝") link = "[IIDX] [LIGHTNING MODEL] KR LIVE 싸이뮤직 게임월드(CYGameworld) beatmania IIDX 29 CastHour 실시간 방송"
        else if(kind == "싸이투덱") link = "[IIDX] [Left Machine] KR LIVE 싸이뮤직 게임월드(CYGameworld) beatmania IIDX 29 CastHour 실시간 방송"
        else if(kind == "싸이팝픈" || kind == "싸팝") link = "[pop'n] KR LIVE 싸이뮤직 게임월드(CYGameworld) pop'n music"
        else if(kind == "싸이도라" || kind == "싸도") link = "[GITADORA] KR LIVE 싸이뮤직 게임월드(CYGameworld) GITADORA FUZZ-UP 실시간 방송";
        else if(kind == "상구" || kind == "로얄상구") link = "대구 로얄상구-SDVX";
        else{
            res.send("Error");
            console.log("Error, kind : ",kind,"link : ",link)
            return;
        }
        // use your own api-key!
        var url="https://www.googleapis.com/youtube/v3/search?q="+encodeURI(link)+"&part=snippet&key=your_api_key_here&type=video&eventType=live&maxResults=1&regionCode=KR";
        
        const temp = await fetch(url,{method: "GET"})
        var body = await temp.text();

        var data=JSON.parse(body).items;
        if(data.length==0 || data[0].snippet.title.replace(/&#39;/g,"\'").indexOf(link)==-1) res.send("Error");
        else res.send("https://www.youtube.com/watch?v="+data[0].id.videoId)
    }),
);


router.get(
    '/playback',
    async(async (req: CustomRequest, res: Response) => {
        const {url = ""} = req.query;
        const video = await Youtube.getInfo({url});
        let found = video.formats.find( (el:any) : boolean => el.mimeType.indexOf("video/webm;")>-1);

        if(!found){
            let found2 = video.formats.find( (el:any) : boolean => el.mimeType.indexOf("video/mp4;")>-1);

            if(!found2){
                res.send("Error");
            }else{
                res.send(found2.url)
            }
        }
        else res.send(found.url);
    })
);