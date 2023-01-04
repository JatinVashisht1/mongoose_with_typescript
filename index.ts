import express, { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import mongoose, { ConnectOptions, MongooseError } from 'mongoose';
import { contactModel, IContact } from './database/contact_schema';
import { Error } from 'mongoose';
import { MongoError } from 'mongodb';
import { invalidPasswordErrorHandler } from './error_handling/error-handler-middleware';
import { InvalidRequestError } from './error_handling/InvalidRequestError';
// import utils from './lib/utils';
// import '' from './lib/utils'
import {genPassword, validPassword} from './lib/utils'
import {authMiddleware} from './lib/utils'
import {issueJWT} from './lib/utils'
import { request } from 'http';
import { nextTick } from 'process';

dotenv.config()
const app = express()
const port = process.env.PORT || 5000
app.use(express.urlencoded({extended: true}))
app.use(express.json())



mongoose.connect('mongodb://localhost:27017/testcontactdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}as (ConnectOptions) , (err)=>{
    if(err){
        console.log("unable to connect to db")
    }else{
        console.log('successfully connected to database')
    }
})


app.get('/', authMiddleware, async (req: Request, res: Response)=>{
    const contacts = await contactModel.find({})
    return res.status(200).json({contacts: contacts})
})

app.post('/create', async (req: Request, res: Response)=>{
    try{
        const name = req.body.name;
        const password = req.body.password
        const nickname = req.body.nickname
        if(typeof name === undefined || typeof name ===  null || typeof password === undefined || typeof name === null){
            return res.status(401).json({success: false, message: "name/password cannot be blank"})
        }
        // console.log(`contact is ${req.body.name}`)
        const {salt, hash} = genPassword(password)
        const myContact = new contactModel({name: name, password: password, nickname: nickname, salt: salt, hash: hash})
        await myContact.save()
        const jwt = issueJWT(myContact)
        // myContact.getContact()

        return res.status(201).json(jwt)
    }catch(error){
        if((error as MongoError).code === 11000){
            console.log(`index.ts: contact already exist`)
            return res.status(409).json({success: false, message: "name already exists"})
        }else{
            console.log(`index.ts: error occured while saving contact ${error}`)
            return res.status(500).json({success: false, message: "unable to save contact"})
        }
    }
})


app.get('/get', authMiddleware, async (req: Request, res: Response, next: NextFunction)=>{
    const allContacts = await contactModel.find({})
    return res.status(200).json({contact: allContacts})
})

app.post('/login', async(req: Request, res: Response, next: NextFunction)=>{
    const user = req.body.username;
    const userfromdb = await contactModel
    .find({'name': user})
    .exec()
    if(userfromdb.length === 0 || userfromdb[0] === undefined){
        next(new InvalidRequestError('invalid username and password'))
    }
    
    const passwordFromReq = req.body.password;
    console.log(`hash is ${userfromdb[0].hash} salt is ${userfromdb[0].salt}`)
    const passIsValid: boolean = validPassword(passwordFromReq, userfromdb[0].hash, userfromdb[0].salt);
    if(passIsValid){
        const jwt = issueJWT(userfromdb[0]);
        return res.status(201).json(jwt)
    }else{
        next(new InvalidRequestError('invalid username and password'))
    }

})

app.use(invalidPasswordErrorHandler)

app.delete('/', async (req: Request, res: Response)=>{
    try {
        await contactModel.deleteMany({})
        return res.status(200).json({success: true})
    } catch (error) {
        return res.status(500).json({success: false})
    }
})


app.listen(port, ()=>{
    console.log(`server listening at http://localhost:${port}`)
})
