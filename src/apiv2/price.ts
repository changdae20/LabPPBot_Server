import { Router, Response, NextFunction, Express } from 'express';
import async from './util/async';
import { sequelize } from '../db';
import { CustomRequest } from '../custom';
const fetch = require("node-fetch")


import { Op } from 'sequelize';

import * as bodyParser from 'body-parser';

const router = Router();
export default router;

router.get(
    '/',
    async(async (req: CustomRequest, res: Response) => {
        const {kind = "", equipment = ""} = req.query;
        function numberWithCommas(x:Number) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
        
        async function get_price(name:String){
            const temp = await fetch(encodeURI("https://maple.market/items/"+name+"/크로아"), {
                method: "GET"
            })
            const text = await temp.text()
            let tbody = text.substring(text.indexOf("<tbody>"),text.indexOf("<tbody>")+3000);
            let price = tbody.substring(0,tbody.indexOf("<br>"));
            //console.log(price);
            //console.log(price.substring(price.lastIndexOf(" ")+1,tbody.indexOf("<br>")));
            return Number(price.substring(price.lastIndexOf(" ")+1,tbody.indexOf("<br>")).replace(/,/g,""));
        }
        
        if((kind !== "arcane" && kind!== "absol") || (equipment!== "weapon" && equipment!=="shield")){
            res.status(400).send("Bad Request")
        }else if(kind == "arcane" && equipment == "shield"){ // 아케인 방어구인 경우
            let classes = [
                "나이트",
                "아처",
                "시프",
                "메이지",
                "파이렛"
            ];
            let parts = [
                "햇",
                "슈트",
                "케이프",
                "슈즈",
                "숄더",
                "글러브"
            ];
            let shields = [];
            for(let i=0; i<classes.length; i++){
                for(let j=0; j<parts.length; j++){
                    shields.push("아케인셰이드 "+classes[i]+parts[j]);
                }
            }
            let shield_prices = [];
            for(var i=0; i<shields.length; i++){
                shield_prices.push({
                    "name" : shields[i],
                    "price" : await get_price(shields[i].replace(/ /g,""))
                });
            }
            shield_prices = shield_prices.sort((a,b) => b["price"] - a["price"]);
            res.json(shield_prices);
        }else if(kind == "arcane" && equipment == "weapon"){ // 아케인 방어구인 경우
            let weapons = [
                "아케인셰이드 ESP리미터",
                "아케인셰이드 가즈",
                "아케인셰이드 대거",
                "아케인셰이드 데스페라도",
                "아케인셰이드 듀얼보우건",
                "아케인셰이드 매직 건틀렛",
                "아케인셰이드 보우",
                "아케인셰이드 블레이드",
                "아케인셰이드 샤이닝로드",
                "아케인셰이드 세이버",
                "아케인셰이드 소울슈터",
                "아케인셰이드 스태프",
                "아케인셰이드 스피어",
                "아케인셰이드 시즈건",
                "아케인셰이드 에너지체인",
                "아케인셰이드 에센스",
                "아케인셰이드 에인션트 보우",
                "아케인셰이드 엑스",
                "아케인셰이드 엘라하",
                "아케인셰이드 완드",
                "아케인셰이드 체인",
                "아케인셰이드 초선",
                "아케인셰이드 케인",
                "아케인셰이드 크로스보우",
                "아케인셰이드 클로",
                "아케인셰이드 투핸드소드",
                "아케인셰이드 투핸드엑스",
                "아케인셰이드 투핸드해머",
                "아케인셰이드 튜너",
                "아케인셰이드 폴암",
                "아케인셰이드 피스톨",
                "아케인셰이드 해머"
            ];
            let weapon_prices = [];
            for(var i=0; i<weapons.length; i++){
                weapon_prices.push({
                    "name" : weapons[i],
                    "price" : await get_price(weapons[i].replace(/ /g,""))
                });
            }
            weapon_prices = weapon_prices.sort((a,b) => b["price"] - a["price"]);
            res.json(weapon_prices);
        }else if(kind == "absol" && equipment == "shield"){ // 아케인 방어구인 경우
            var shields = [
                "앱솔랩스 나이트글러브",
                "앱솔랩스 나이트숄더",
                "앱솔랩스 나이트슈즈",
                "앱솔랩스 나이트슈트",
                "앱솔랩스 나이트케이프",
                "앱솔랩스 나이트헬름",
                "앱솔랩스 메이지글러브",
                "앱솔랩스 메이지숄더",
                "앱솔랩스 메이지슈즈",
                "앱솔랩스 메이지슈트",
                "앱솔랩스 메이지케이프",
                "앱솔랩스 메이지크라운",
                "앱솔랩스 시프글러브",
                "앱솔랩스 시프숄더",
                "앱솔랩스 시프슈즈",
                "앱솔랩스 시프슈트",
                "앱솔랩스 시프캡",
                "앱솔랩스 시프케이프",
                "앱솔랩스 아처글러브",
                "앱솔랩스 아처숄더",
                "앱솔랩스 아처슈즈",
                "앱솔랩스 아처슈트",
                "앱솔랩스 아처케이프",
                "앱솔랩스 아처후드",
                "앱솔랩스 파이렛글러브",
                "앱솔랩스 파이렛숄더",
                "앱솔랩스 파이렛슈즈",
                "앱솔랩스 파이렛슈트",
                "앱솔랩스 파이렛케이프",
                "앱솔랩스 파이렛페도라"
            ];
            let shield_prices = [];
            for(var i=0; i<shields.length; i++){
                shield_prices.push({
                    "name" : shields[i],
                    "price" : await get_price(shields[i].replace(/ /g,""))
                });
            }
            shield_prices = shield_prices.sort((a,b) => b["price"] - a["price"]);
            res.json(shield_prices);
        }else if(kind=="absol" && equipment=="weapon"){
            var weapons = [ 
                "앱솔랩스 ESP리미터",
                "앱솔랩스 괴선",
                "앱솔랩스 데스페라도",
                "앱솔랩스 듀얼보우건",
                "앱솔랩스 리벤지가즈",
                "앱솔랩스 매직 건틀렛",
                "앱솔랩스 브로드세이버",
                "앱솔랩스 브로드엑스",
                "앱솔랩스 브로드해머",
                "앱솔랩스 블래스트캐논",
                "앱솔랩스 블레이드",
                "앱솔랩스 블로우너클",
                "앱솔랩스 비트해머",
                "앱솔랩스 샤이닝로드",
                "앱솔랩스 세이버",
                "앱솔랩스 소울슈터",
                "앱솔랩스 슈팅보우",
                "앱솔랩스 스펠링스태프",
                "앱솔랩스 스펠링완드",
                "앱솔랩스 슬래셔",
                "앱솔랩스 에너지소드",
                "앱솔랩스 에센스",
                "앱솔랩스 에인션트 보우",
                "앱솔랩스 엑스",
                "앱솔랩스 체인",
                "앱솔랩스 크로스보우",
                "앱솔랩스 튜너",
                "앱솔랩스 파일 갓",
                "앱솔랩스 포인팅건",
                "앱솔랩스 피어싱스피어",
                "앱솔랩스 핀쳐케인",
                "앱솔랩스 핼버드"
            ];
            let weapon_prices = [];
            for(var i=0; i<weapons.length; i++){
                weapon_prices.push({
                    "name" : weapons[i],
                    "price" : await get_price(weapons[i].replace(/ /g,""))
                });
            }
            weapon_prices = weapon_prices.sort((a,b) => b["price"] - a["price"]);
            res.json(weapon_prices);
        }
    })
)