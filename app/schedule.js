const express = require('express');
const authContext = require('../authTokens/AuthContext');
const { readJsonFile, modifyJsonFile } = require("./utils.js");

const router = express.Router()


router.get("/", async (req, res) => {
    const authtoken = req.headers.authorization.split(" ")[1];
        
    if (!authContext.isAccessTokenValid(authtoken)){
        return res.status(401).send("invalid token");
    }

    const date = req.query.date;

    try {
        let scheduleData = await readJsonFile("./datas/schedule.json");
        scheduleData = scheduleData[date] || []; // Return empty array if no schedules
        
        return res.json(scheduleData);
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: 'Error loading schedules' });
    }
})

router.post("/", async (req, res) => {
    const authtoken = req.headers.authorization.split(" ")[1];
        
    if (!authContext.isAccessTokenValid(authtoken)){
        return res.status(401).send("invalid token");
    }

    const blockCont = await readJsonFile("./datas/blocks.json");

    const { blockId, floorId, roomId, date, time, assignedStaff, notes } = req.body;

    let schedOBJ = {
                "blockId": blockId,
                "floorId": floorId,
                "roomId": roomId,
                "date": date,
                "time": time,
                "assignedStaff": assignedStaff,
                "notes": "none"
            }


    try{

        modifyJsonFile("./datas/schedule.json", async (currentData) => {
            if (!currentData[date]){
                currentData[date] = [];
                
                schedOBJ['id'] = "schedule_1";
                
                currentData[date].push(schedOBJ)

            } else {
                const lastId = Number(currentData[date].at(-1)['id'].split("_")[1]) + 1;
                schedOBJ['id'] = "schedule_" + lastId;
                
            }

            schedOBJ['status'] = "scheduled";

            return schedOBJ;

            
        })


        modifyJsonFile("./datas/activity.json", async (currentData) => {
            let activityOBJ = [{
                "id": schedOBJ.id.replace("schedule", "activity"),
                "type": "scheduling",
                "description": "New cleaning scheduled",
                "block": blockCont[schedOBJ.blockId].name,
                "room": roomId,
                "time": time,
                "status": "scheduled"
            }]


            activityOBJ.push(...currentData['activity']);

            currentData['activity'] = activityOBJ;

            return currentData;


        })

        
        return res.json(schedOBJ);

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

    let { status, notes } = req.body;

    let ID = req.params.id;

    try{
        modifyJsonFile("./datas/schedule.json", async (currentData) => {
            for (let i=0; i<currentData.length; i++){
                let data = currentData[i];
                if (data.id == ID){
                    currentData[i]['status'] = status;
                    break;
                }
            }

            res.json(currentData);

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

    const ID = req.params.id;

    try{
        modifyJsonFile("./datas/schedule.json", async (currentData) => {
            let scheduleArr = []

            for (let i=0; i<currentData.length; i++){
                if (currentData[i].id !== ID){
                    scheduleArr.push(scheduleArr);
                }
            }

            return scheduleArr;
        })

        return res.status(200);
    } catch (err){
        console.log(err);
        return res.status(400);
    }

})


module.exports = router;