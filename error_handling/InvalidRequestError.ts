export class InvalidRequestError{
    message!: string
    status!: number
    additionalInfo!: any

    constructor(message: string, status: number = 401, additionalInfo: any = {}){
        this.message = message;
        this.status = status;
        this.additionalInfo = additionalInfo;
    }
}