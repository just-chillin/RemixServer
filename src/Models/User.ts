import {AccessToken} from './auth/AuthTypes'
import { Model } from './db/MongoUtils'
import { ObjectId } from 'mongodb'
export class User extends Model<{_id: ObjectId, test: number}>{
    public seralize(): { _id: any } {
        throw new Error("Method not implemented.")
    }
    public get collection(): import("mongodb").Collection<any> {
        this.insert()
        throw new Error("Method not implemented.")
    }
    static getTokenOwner(token: AccessToken) {
=    }

    static registerUser(username: string, password: string) {
        
    }

    constructor(){
        super()
    }
}