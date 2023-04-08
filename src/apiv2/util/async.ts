import { NextFunction, Request, Response } from "express";

export default function async(func: any) {
    return (req: Request, res: Response, next: NextFunction) => func(req, res, next).catch((v: any) => next(v));

}