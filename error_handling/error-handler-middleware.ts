import { NextFunction, Request, Response } from "express";
import { InvalidRequestError } from "./InvalidRequestError";

export function invalidPasswordErrorHandler(
    err: TypeError | InvalidRequestError,
    req: Request,
    res: Response,
    next: NextFunction
){
    let invalidRequestError = err;
    if(!(err instanceof InvalidRequestError)){
        invalidRequestError = new InvalidRequestError('invalid username/password')
    }

    console.log(`message is ${(invalidRequestError as InvalidRequestError).status}`)
    return res
    .status((invalidRequestError as InvalidRequestError).status)
    .json({successs: false, message: invalidRequestError.message})
    // return res.status(101).json({success: false, message: "something went wrong"})
}