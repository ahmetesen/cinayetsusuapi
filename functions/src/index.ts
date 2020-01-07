import * as functions from 'firebase-functions';
//import User from './models/User';
//import { deserialize } from 'typescript-json-serializer';
import * as admin from 'firebase-admin';
import { Guid } from "guid-typescript";

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
const serviceAccount = require("../key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://cinayetsusu-dca53.firebaseio.com"
});
let db = admin.firestore();

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
    let users:Array<FirebaseFirestore.DocumentData> = [];
    let currentDate = new Date(Date.now());
    try{
        while(true){
            let result = await getSpecificDateUsers(currentDate);
            if(result){
                users.push(...result);
                if(users.length == 10)
                    break;
                else
                    currentDate.setDate(currentDate.getDate()-1)
            }
            else{
                break;
            }
        }
        return users.sort((a,b)=>b['score']-a['score']);
    }
    catch(err){
        return undefined;
    }
});

let getSpecificDateUsers = async function(date:Date):Promise<Array<FirebaseFirestore.DocumentData>> {
    let users:Array<FirebaseFirestore.DocumentData> = [];
    try{
        const currentYear = date.getFullYear();
        const currentMonth = date.getMonth();
        const currentDate = date.getDate();

        const today = currentYear.toString()+currentMonth.toString()+currentDate.toString();

        const docs = await db.collection('scores').doc(today).collection('scores').orderBy('score').limit(10).get();
        
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
    let currentDate = new Date(Date.now());
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