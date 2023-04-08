import { Router, Response, NextFunction, Express } from 'express';
import async from './util/async';
import { CustomRequest } from '../custom';

const {spawn, exec} = require('child_process');


const fs = require("fs");
const Readable = require('stream').Readable;

const router = Router();
export default router;

router.get(
    '/',
    async(async (req: CustomRequest, res: Response) => {
        const {nick = "", kind = ""} = req.query;

        let python_response = "";
        const python = spawn('python3', ['example.py', nick, kind]);
        python.stdout.on('data', function (data : string) {
            python_response = data.toString();
        });
        python.on('close', (code:Number) =>{
            console.log(python_response)
            if(python_response=="OK\n")
                res.sendFile("/home/ubuntu/EndTime-server/output.png");
            else
                res.send("ERROR")
        })
    }),
);