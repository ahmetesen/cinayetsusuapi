import * as functions from 'firebase-functions';
//import User from './models/User';
//import { deserialize } from 'typescript-json-serializer';
import * as admin from 'firebase-admin';
import { Guid } from "guid-typescript";

const serviceAccount = require("../key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://cinayetsusu-dca53.firebaseio.com"
});
const db = admin.firestore();

export const createUserAndSaveToDb = functions.https.onCall(async (data, context) => {
    data.deviceId = Guid.create().toString();
    data.createDate = new Date(Date.now());

    try{
        await db.collection('users').doc(data.deviceId).set(data);
        return data.deviceId;
    }
    catch(err){
    }
});

export const getFirstTenUser = functions.https.onCall(async (data, context) => {
    const users:Array<FirebaseFirestore.DocumentData> = [];
    const currentDate = new Date(Date.now());
    const limit:number = 10;
    let pullCount = 10;
    try{
        while(true){
            const result = await getSpecificDateUsers(currentDate,pullCount);
            if(result){
                    users.push(...result);
                    const miss = limit - users.length;
                    if(miss>0)
                        pullCount = miss;
                if(users.length >= 10)
                    break;
                else
                    currentDate.setDate(currentDate.getDate()-1)
            }
            else{
                break;
            }
        }
        const values = users.sort((a,b)=>b['score']-a['score']).slice(0,limit);
        return values;
    }
    catch(err){
        return undefined;
    }
});

async function getSpecificDateUsers(date:Date,getOnly:number):Promise<Array<FirebaseFirestore.DocumentData>> {
    const users:Array<FirebaseFirestore.DocumentData> = [];
    try{
        const currentYear = date.getFullYear();
        const currentMonth = date.getMonth();
        const currentDate = date.getDate();

        const today = currentYear.toString()+currentMonth.toString()+currentDate.toString();

        const docs = await db.collection('scores').doc(today).collection('scores').orderBy('score',"desc").limit(getOnly).get();
        console.log(docs.size + ' ' +docs.docs.length);
        if(docs.empty)
            return users;
        else{
            docs.forEach((userSnapshot)=>{
                users.push(userSnapshot.data());
            });
            return users;
        }
    }
    catch(err){
        return err;
    }
}

export const updateUser = functions.https.onCall(async (data, context) => {
    try{
        await db.collection('users').doc(data.deviceId).update(data);
        return true;
    }
    catch(err){
        return false;
    }
    return false;
});

export const saveUserPoint = functions.https.onCall(async (data, context) => {
    data.scoreId = Guid.create().toString();
    const currentDate = new Date(Date.now());
    data.createDate = currentDate;
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentDay = currentDate.getDate();
    const today = currentYear.toString()+currentMonth.toString()+currentDay.toString();
    try{
        await db.collection('scores').doc(today).collection('scores').doc(data.scoreId).set(data);
        return data.scoreId;
    }
    catch(err){

    }
});

export const ping = functions.https.onCall((data,context)=>{
    return {status:200};
});