const express = require('express');
const authContext = require('../authTokens/AuthContext');
const { readJsonFile } = require("./utils.js");

const router = express.Router()


router.get("/blocks", async (req, res) => {
    const authtoken = req.headers.authorization.split(" ")[1];
    
    if (!authContext.isAccessTokenValid(authtoken)){
        return res.status(401).send("invalid token");
    }

    try{

        const blocks = await readJsonFile("./datas/blocks.json");
        return res.json(blocks);
    }
    catch(err){
        console.log(err);
        return res.status(400);
    }
    
})


router.get("/blocks/:id", async (req, res) => {
    const authtoken = req.headers.authorization.split(" ")[1];
    
    if (!authContext.isAccessTokenValid(authtoken)){
        return res.status(401).send("invalid token");
    }

    const ID = req.params.id;

    try{
        const blockData = await readJsonFile("./datas/blocks.json");
        return res.json(blockData[ID]); 
    }
    catch(err){
        console.log(err);
        return res.status(400);
    }
})


router.get("/blocks/:id/floors", async (req, res) => {
    const authtoken = req.headers.authorization.split(" ")[1];
    
    if (!authContext.isAccessTokenValid(authtoken)){
        return res.status(401).send("invalid token");
    }

    const ID = req.params.id;

    try{
        const FloorData = await readJsonFile("./datas/floors.json");
        return res.json(FloorData[ID]);
    } catch (err){
        console.log(err);
        return res.status(400);
    }
})


router.get("/blocks/:blockid/floors/:floorid/rooms", async (req, res) => {
    const authtoken = req.headers.authorization.split(" ")[1];
    
    if (!authContext.isAccessTokenValid(authtoken)){
        return res.status(401).send("invalid token");
    }

    const floorID = req.params.floorid;

    try{
        const RoomData = await readJsonFile("./datas/rooms.json");
        if (!RoomData[floorID]){
            return res.status(404).json({ message: 'Floor not found' });
        }

        return res.json(RoomData[floorID]);
        
    } catch (err){
        console.log(err);
        return res.status(400);
    }
})



router.patch("/rooms/:roomId/status", async (req, res) => {
    const authtoken = req.headers.authorization.split(" ")[1];
    
    if (!authContext.isAccessTokenValid(authtoken)){
        return res.status(401).send("invalid token");
    }

    const roomID = req.params.roomId;
    try{
        const roomData = await readJsonFile("./datas/rooms.json");
        return res.json(roomData[roomID]);
    } catch (err){
        console.log(err);
        return res.status(400);
    }
})





module.exports = router;