import { Router, Response, NextFunction, Express } from 'express';
import async from './util/async';
import { sequelize } from '../db';
import { CustomRequest } from '../custom';



import { Op } from 'sequelize';
import { Songs } from '../db/songs.model';

import * as bodyParser from 'body-parser';

const router = Router();
export default router;


router.get(
  '/',
  async(async (req: CustomRequest, res: Response) => {
  const {title = "", kind = ""} = req.query;
  if(kind==""){ // 곡명으로 조회해서 최고레벨 반환
    const where: any = {};
    where["title"]={
      [Op.like]: title
    };
    let song = await Songs.findAll({where,order:[["level","DESC"]]});
    if(song && song.length>0){
      res.json(song[0]);
    }else{
      delete where["title"];
      where["nick1"] = {
        [Op.like]: title
      }
      song = await Songs.findAll({where,order:[["level","DESC"]]});
      if(song && song.length>0){
        res.json(song[0]);
        return;
      }else{
        delete where["nick1"];
        where["nick2"] = {
          [Op.like]: title
        }
        song = await Songs.findAll({where,order:[["level","DESC"]]});
        if(song && song.length>0){
          res.json(song[0]);
          return;
        }else{
          delete where["nick2"];
          where["nick3"] = {
            [Op.like]: title
          }
          song = await Songs.findAll({where,order:[["level","DESC"]]});
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
  }else if(isNaN(Number(kind))){ // 보면 종류 (grv,hvn,mxm 등)로 쿼리하는 경우
    const where: any = {};
    where["title"]={
      [Op.like]: title
    };
    where["code"]={
      [Op.like]: "%" + String(kind).substring(0,1).toUpperCase() + "%"
    }
    let song = await Songs.findOne({where});
    if(song){
      res.json(song);
      return;
    }else{
      delete where["title"];
      where["nick1"] = {
        [Op.like]: title
      }
      song = await Songs.findOne({where});
      if(song){
        res.json(song);
        return;
      }else{
        delete where["nick1"];
        where["nick2"] = {
          [Op.like]: title
        }
        song = await Songs.findOne({where});
        if(song){
          res.json(song);
          return;
        }else{
          delete where["nick2"];
          where["nick3"] = {
            [Op.like]: title
          }
          song = await Songs.findOne({where});
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
  }else{
    const where: any = {};
    where["title"]={
      [Op.like]: title
    };
    where["level"]={
      [Op.like]: Number(kind)
    }
    let song = await Songs.findOne({where});
    if(song){
      res.json(song);
      return;
    }else{
      delete where["title"];
      where["nick1"] = {
        [Op.like]: title
      }
      song = await Songs.findOne({where});
      if(song){
        res.json(song);
        return;
      }else{
        delete where["nick1"];
        where["nick2"] = {
          [Op.like]: title
        }
        song = await Songs.findOne({where});
        if(song){
          res.json(song);
          return;
        }else{
          delete where["nick2"];
          where["nick3"] = {
            [Op.like]: title
          }
          song = await Songs.findOne({where});
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

router.get(
  '/list',
  async(async (req: CustomRequest, res: Response) => {
  const {level = ""} = req.query;
  const where: any = {};
  where["level"]={
    [Op.like]: level
  };

  const data = await Songs.findAll({where});
  if(!data){
    res.json({});
  }else{
    res.json(data);
  }
  }),
);

router.get(
  '/code',
  async(async (req: CustomRequest, res: Response) => {
  const {code = ""} = req.query;
  const where: any = {};
  where["code"]={
    [Op.like]: code
  };

  const data = await Songs.findOne({where});
  if(!data){
    res.json({});
  }else{
    res.json(data);
  }
  }),
);

router.get(
  '/search',
  async(async (req: CustomRequest, res: Response) => {
  const {search_text = ""} = req.query;
  const where: any = {};
  const data = await Songs.findAll();
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

router.post(
  '/',
  async(async (req: CustomRequest, res: Response) => {
    const {title=null, nick1=null, nick2=null, nick3=null, level=null, code=null,bpm=null,chain_v=null,chain_vi=null,artist=null,effector=null,illustrator=null, table_PUC="undefined", table_S="undefined"} = req.body;
    const result = await Songs.create({
      title,
      nick1,
      nick2,
      nick3,
      level,
      code,
      bpm,
      chain_v,
      chain_vi,
      artist,
      effector,
      illustrator,
      table_PUC,
      table_S
    })
    if(!result){
      console.log("Error Occured")
      res.status(500).send("Error")
    }
    res.status(200).send("");
  }),
);

router.post(
  '/table_PUC',
  async(async (req: CustomRequest, res: Response) => {
    const {code = "", PUC_level = ""} = req.body;
    const result = await Songs.findOne({"where" : {"code" : code}});
    if(!result){
      res.status(500).send("Error")
    }else{
      result["table_PUC"] = PUC_level;
      result.save();
      res.status(200).send("");
    }
  }),
);

router.post(
  '/table_S',
  async(async (req: CustomRequest, res: Response) => {
    const {code = "", S_level = ""} = req.body;
    const result = await Songs.findOne({"where" : {"code" : code}});
    if(!result){
      res.status(500).send("Error")
    }else{
      result["table_S"] = S_level;
      result.save();
      res.status(200).send("");
    }
  }),
);

router.post(
  '/PUC_video_url',
  async(async (req: CustomRequest, res: Response) => {
    const {code = "", url = ""} = req.body;
    console.log("POST /songs/PUC_video_url, code : " + code + ", url : " + url);
    const result = await Songs.findOne({"where" : {"code" : code}});
    if(!result){
      res.status(500).send("Error")
    }else{
      result["PUC_video_url"] = url;
      result.save();
      res.status(200).send("");
    }
  }),
);