import { Router, Response, NextFunction, Express } from 'express';
import async from './util/async';
import { sequelize } from '../db';
import { CustomRequest } from '../custom';
const fetch = require("node-fetch")


import { Op } from 'sequelize';

import * as bodyParser from 'body-parser';

const router = Router();
export default router;

const {GoogleSpreadsheet} = require("google-spreadsheet")
const gs_creds = require("./endtime-325923-7ac010191f8f.json")
const doc = new GoogleSpreadsheet("your_spreadsheet_ID");

async function authGoogleSheet(){
    try{
        await doc.useServiceAccountAuth(gs_creds);
        await doc.loadInfo();
        console.log("Loaded : ",doc.title);
    }catch(err){
        console.log("Auth Error : ",err);
    }
}


router.get(
    '/',
    async(async (req: CustomRequest, res: Response) => {
        await authGoogleSheet();
        const sheet = doc.sheetsByIndex[0];
        await sheet.loadCells("A1:L418");
        const { row } = req.query;
        const row_ = Number(row) + 2;
        console.log(row_);
        const manhwa = {
            "title" : sheet.getCell(row_,1).value,
            "series" : sheet.getCell(row_,2).value,
            "finished" : sheet.getCell(row_,3).value=="완" ? true : false,
            "recommend" : sheet.getCell(row_,4).value=="★" ? true : false,
            "score" : Number(sheet.getCell(row_,5).value),
            "artist" : sheet.getCell(row_,6).value==null ? "" : sheet.getCell(row_,6).value,
            "genre" : sheet.getCell(row_,10).value.split(","),
            "comment" : sheet.getCell(row_,11).value
        }

        res.json(manhwa);
    })
)