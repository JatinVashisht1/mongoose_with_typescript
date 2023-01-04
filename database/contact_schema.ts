import mongoose, { Document, Model, model, Schema } from 'mongoose';

export interface IContact extends Document{
    name : string;
    hash : string;
    salt: string;
    nickname : string;
}

const contactSchema: Schema = new Schema<IContact>({
    name: {
        type: String,
        unique: true,
        required: true,
    },
    hash:{
        type: String,
        required: true
    },
    salt:{
        type: String,
        required: true
    },
    nickname:{
        type: String,
        required: false,
        default: ""
    }
})

contactSchema.methods.getContact = function getContact(){
    const name: String = this.name;
    const password: String = this.password;
    const nickname: String = this.nickname;
    console.log(`Name: ${name} Password: ${password} nickname: ${nickname}`)
}



export const contactModel = model('Contact', contactSchema)

