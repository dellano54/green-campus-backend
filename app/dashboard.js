const express = require('express');
const authContext = require('../authTokens/AuthContext');
const { readJsonFile } = require("./utils.js");

const router = express.Router()


router.get("/stats", async (req, res) => {
    const authtoken = req.headers.authorization.split(" ")[1];

    if (!authContext.isAccessTokenValid(authtoken)){
        return res.status(401).send("invalid token");
    }

    const { stats } = await readJsonFile("./datas/activity.json");
    const staff = await readJsonFile("./datas/staff.json");

    stats.totalStaff = staff.length;

    return res.json(stats)


})

router.get("/activities",  async (req, res) => {
    const authtoken = req.headers.authorization.split(" ")[1];

    if (!authContext.isAccessTokenValid(authtoken)){
        return res.status(401).send("invalid token");
    }

    const { activity } = await readJsonFile("./datas/activity.json");

    return res.json(activity);

})


module.exports = router;