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
    try{
        const now = new Date(Date.now());
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const currentDate = now.getDate();

        const today = currentYear.toString()+currentMonth.toString()+currentDate.toString();

        const docs = await db.collection('scores').doc(today).collection('scores').orderBy('score').limit(10).get();
        let users:Array<FirebaseFirestore.DocumentData> = [];
        if(docs.empty)
            return undefined;
        else{
            docs.forEach((userSnapshot)=>{
                users.push(userSnapshot.data());
            });
            return users;
        }
    }
    catch(err){
        return undefined;
    }
});

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
    
});

export const ping = functions.https.onCall((data,context)=>{
    return {status:200};
});