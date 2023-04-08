import { Router, Response, NextFunction, Express } from 'express';
import async from './util/async';
import { CustomRequest } from '../custom';
import cheerio from "cheerio";

const fetch = require("node-fetch");

var wkhtmltox = require("wkhtmltox");
const fs = require("fs");
const Readable = require('stream').Readable;
// instantiate a new converter.
var converter = new wkhtmltox();

const router = Router();
export default router;

router.get(
  '/baseball',
  async(async (req: CustomRequest, res: Response) => {
    var url = "https://sports.naver.com/kbaseball/index";
    let result = await fetch(url);
    result = await result.text();
    var $ = cheerio.load(result);

    let text = "";
    let kbo_list = $("#_tab_box_kbo > div > ul > li");
    kbo_list.each( (i, kbo) => {
        let first = $(kbo).find("div.vs_list1");
        let second = $(kbo).find("div.vs_list2");
        let first_name = $(first).find("span.name")
        let second_name = $(second).find("span.name")
        let live = $(kbo).find("em").text()
        let first_score = ""
        let second_score = ""
        if(first.find("div.score") != null){
            first_score = first.find("div.score").text().replace(/ /g, '').replace(/\t/g, '').replace(/\n/g, '')
        }
        if(second.find("div.score") != null){
            second_score = second.find("div.score").text().replace(/ /g, '').replace(/\t/g, '').replace(/\n/g, '')
        }

        text += `${first_name.text()} ${first_score} vs ${second_score} ${second_name.text()} [${live}]\n`
    })
    if( text.length == 0 ){
        res.send("국내야구 정보를 찾을 수 없습니다.");
    }else{
        res.send(text.substring(0, text.length-1));
    }
    res.send("");
  }),
);

router.get(
    '/baseball_ranking',
    async(async (req: CustomRequest, res: Response) => {
        var url = "https://sports.naver.com/kbaseball/index";
        let result = await fetch(url);
        result = await result.text();

        const s = new Readable();
        s._read = () => {}; // redundant? see update below
        s.push(result);
        s.push(null);

        res.set('Content-Type', 'image/png');

        converter.image(s, { "crop-x" : 7, "crop-y" : 1548, "crop-w" : 330, "crop-h" : 453, format: "png" })
        .pipe( res );
    }),
  );