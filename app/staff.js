const express = require('express');
const authContext = require('../authTokens/AuthContext');
const { readJsonFile, modifyJsonFile } = require("./utils.js");
const crypto = require("crypto");

const router = express.Router()
require("dotenv").config()

const PASS_SALT = process.env.PASS_SALT;


router.get("/", async (req, res) => {
    const authtoken = req.headers.authorization.split(" ")[1];
        
    if (!authContext.isAccessTokenValid(authtoken)){
        return res.status(401).send("invalid token");
    }

    try{
        const staffData = await readJsonFile("./datas/staff.json");
        return res.json(staffData);
    } catch (err){
        console.log(err);
        return res.status(404);
    }
})


router.post("/", async (req, res) => {
    const authtoken = req.headers.authorization.split(" ")[1];
        
    if (!authContext.isAccessTokenValid(authtoken)){
        return res.status(401).send("invalid token");
    }

    try{
        const { username, name, email, phone, role, password } = req.body;

        modifyJsonFile("./datas/staff.json", async (currentData) => {
            let newID = 0;

            if (currentData.length > 0) {
                const lastEntry = currentData.at(-1);
                const lastID = Number(lastEntry.id.split("_")[1]);
                newID = lastID + 1;
            }

            const datetime = new Date();

            const StaffOBJ = {
                "id": "staff_"+newID,
                "username": username,
                "name": name,
                "email": email,
                "phone": phone,
                "role": role,
                "taskCompleted": 0,
                "joinDate": datetime

            }

            currentData.push(StaffOBJ);

            res.json(StaffOBJ);

            return currentData;
        })

        modifyJsonFile("./datas/Users.json", async (currentData) => {
            const hashedPassword = crypto.createHash('sha256').update(password + PASS_SALT).digest('hex');

            if (username in currentData['staff']){
                return res.status(400).send("same user exists");
            }

            currentData['staff'][username] = hashedPassword;
            currentData['staff'][email] = hashedPassword;

            return currentData;
        })


    } catch (err){
        console.log(err);
        return res.status(400);
    }


})


router.patch("/:id", async (req, res) => {
    const authtoken = req.headers.authorization.split(" ")[1];
        
    if (!authContext.isAccessTokenValid(authtoken)){
        return res.status(401).send("invalid token");
    }


    try {
        const {status} = req.body;
        const ID = req.params.id;

        modifyJsonFile("./datas/staff.json", async (currentData) => {
            
            for (let i=0; i<currentData.length; i++){
                if (currentData[i].id == ID){
                    currentData[i]['status'] = status;
                    break;
                }
                
            }
            res.json(currentData[i])
            
            return currentData;
        })

        
    } catch (err){
        console.log(err);
        return res.status(400);
    }
})


router.delete("/:id", async (req, res) => {
    const authtoken = req.headers.authorization.split(" ")[1];
        
    if (!authContext.isAccessTokenValid(authtoken)){
        return res.status(401).send("invalid token");
    }

    const data = await readJsonFile("./datas/staff.json");
    const ID = req.params.id;
    let username;
    let email;


    try {


        await modifyJsonFile("./datas/staff.json", async (currentData) => {
            let updatedData = []
            for (let i=0; i<currentData.length; i++){
                if (currentData[i].id == ID){
                    
                    username = currentData[i].username;
                    email = currentData[i].email;

                    continue;
                }
                
                updatedData.push(currentData[i]);
            }

            return updatedData;
        })
        


        modifyJsonFile("./datas/Users.json", async (currentData) => {
            delete currentData[username];
            delete currentData[email];

            return currentData;
        })


        return res.status(200);

    } catch (err){
        console.log(err);
        return res.status(400);
    }
})


module.exports = router;