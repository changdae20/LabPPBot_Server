import { Router, Response, NextFunction, Express } from 'express';
import async from './util/async';
import { sequelize } from '../db';
const fetch = require("node-fetch")
import cheerio from "cheerio";
import { CustomRequest } from '../custom';
import fs from "fs";
var wkhtmltox = require("wkhtmltox");
var converter = new wkhtmltox();
const Readable = require('stream').Readable;
import * as bodyParser from 'body-parser';

const router = Router();
export default router;

const sleep = (ms:number) => {
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

const namedict: { [id: string] : string; } = {};
// namedict for name - id(sin.nira.one)
namedict['손창대'] = '4722';

router.get('/info',
    async(async (req: CustomRequest, res: Response) => {
        const {name = ""} = req.query;
        // WIP
        
    }),
);

router.get('/skill_list',
    async(async (req: CustomRequest, res: Response) => {
        const {name = ""} = req.query;
        
        if( name in namedict ){
            let name_string = name as string;
            var url = `https://sin.nira.one/skillscr/2/${namedict[name_string]}/dm/1/1`;
            let result = await fetch(url);
            result = await result.text();

            const s = new Readable();
            s._read = () => {}; // redundant? see update below
            s.push(result);
            s.push(null);

            res.set('Content-Type', 'image/png');

            converter.image(s, { "crop-x" : 0, "crop-y" : 0, "crop-w" : 1200, "crop-h" : 1200, format: "png" })
            .pipe( res );
        } else {
            res.send("ERROR");
        }
    }),
);