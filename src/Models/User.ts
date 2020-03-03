import {AccessToken} from './auth/AuthTypes'
import { Model, getCollection, ForeignKey } from './db/MongoUtils'
import { ObjectId } from 'mongodb'
import { Video } from './Video';

type UserModel = {
    _id: ObjectId;
    handle: string;
    email: string;
    videos: ObjectId[];
}

const userCollection = getCollection<User>('user');

export class User extends Model {
    _id?: ObjectId;
    handle?: string;
    email?: string;
    videos?: ForeignKey<Video>[];

    update() {
        
    }
    
    public insert() {
        return userCollection.insertOne(this);
    }
}