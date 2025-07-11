const express = require('express');
const crypto = require('crypto');
const authContext = require('../authTokens/AuthContext');

require("dotenv").config();

const { readJsonFile, generateAccessToken, generateRefreshToken, generateRefreshedToken } = require('./utils');   

const router = express.Router();
const PASS_SALT = process.env.PASS_SALT;


router.post("/login", async (req, res) => {
    let { username, password, usertype } = req.body;


    if (!username || !password){
        return res.status(400).send("login bad request");
    }

    if (usertype !== "admin" && usertype !== "staff"){
        return res.status(400).send("login bad request");
    }


    let userData = await readJsonFile("./datas/Users.json");
    userData = userData[usertype];

    password = crypto.createHash('sha256').update(password + PASS_SALT).digest('hex');
    console.log(password)
    try{
        if (userData[username] == password){
            const accesstoken = generateAccessToken(username, usertype);
            const refreshtoken = generateRefreshToken(username, usertype);

            authContext.setAccessToken(accesstoken);
            authContext.setRefreshToken(refreshtoken);


            return res.json({
                "authToken": accesstoken,
                "refreshToken": refreshtoken,
                "user": {
                    "username": username,
                    "usertype": usertype
                }
            })
        }

        else{
            return res.status(401).send("invalid username or password");
        }
    }

    catch (err) {
        console.log(err);
        return res.status(401).send("invalid username or password");
    }


    
})


router.post("/refresh", async (req, res) => {
    let { refreshToken } = req.body;

    if (!authContext.isRefreshTokenValid(refreshToken)) {
    return res.status(401).send("invalid token");
    }

    let refreshed = generateRefreshedToken(refreshToken);
    authContext.removeTokens(refreshToken);
    let { accessToken, refreshToken: newRefreshToken, userId, role } = refreshed;

    

    authContext.setAccessToken(accessToken);
    authContext.setRefreshToken(newRefreshToken);


    return res.json(
        {
            "authToken": accessToken,
            "refreshToken": newRefreshToken,
            "user": {
                "username": userId,
                "usertype": role
            }
        }
    )
})


router.post("/logout", (req, res) => {
    let { refreshToken } = req.body;
    const accessToken = req.headers['authorization'].split(" ")[1]

    if (!authContext.isRefreshTokenValid(refreshToken)) {
        return res.status(401).send("invalid token");
    }

    authContext.removeTokens(refreshToken);
    authContext.removeTokens(accessToken);

    return res.json({"message": "Successfully logged out"})
})


module.exports = router;