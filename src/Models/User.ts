import {AccessToken} from './auth/AuthTypes'
import { Model } from './db/MongoUtils'
export class User extends Model<{}>{
    public get collection(): import("mongodb").Collection<any> {
        throw new Error("Method not implemented.")
    }
    static getTokenOwner(token: AccessToken) {
        
    }

    static registerUser(username: string, password: string) {
        
    }

    constructor(){
        super()
    }
    seralize(){ return {}}
}