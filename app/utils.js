const fs = require('fs').promises;
const path = require('path');
const jwt = require('jsonwebtoken');

const fileLocks = new Map();
const fileQueues = new Map();

require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

async function readJsonFile(filePath) {
    try {
        const absolutePath = path.resolve(filePath);
        const data = await fs.readFile(absolutePath, 'utf8');
        console.log(data);
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            throw new Error(`File not found: ${filePath}`);
        }
        throw error;
    }
}


async function writeJsonFile(path, jsonData) {
  const stringified = JSON.stringify(jsonData, null, 2); // Pretty format with 2-space indent
  await fs.writeFile(path, stringified, 'utf-8');
}


async function modifyJsonFile(filePath, modifyCallback) {
    const absolutePath = path.resolve(filePath);
    
    if (!fileQueues.has(absolutePath)) {
        fileQueues.set(absolutePath, Promise.resolve());
    }

    const operationPromise = fileQueues.get(absolutePath).then(async () => {
        while (fileLocks.has(absolutePath)) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        fileLocks.set(absolutePath, true);
        
        try {
            let content;
            try {
                content = await readJsonFile(absolutePath);
            } catch (error) {
                if (error.message.includes('File not found')) {
                    content = {};
                } else {
                    throw error;
                }
            }

            const modifiedContent = await modifyCallback(content);
            
            await fs.writeFile(
                absolutePath,
                JSON.stringify(modifiedContent, null, 2),
                'utf8'
            );
            
            return modifiedContent;
        } finally {
            fileLocks.delete(absolutePath);
        }
    });
    
    fileQueues.set(absolutePath, operationPromise.catch(() => {}));
    
    return operationPromise;
}

//token generation

// Generate Access Token (short-lived)
function generateAccessToken(username, role) {
  return jwt.sign(
    { userId: username, role: role },
    JWT_SECRET,
    { expiresIn: '60m' }
  );
}

// Generate Refresh Token (long-lived)
function generateRefreshToken(username, role) {
  return jwt.sign(
    { userId: username, role: role },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}


function generateRefreshedToken(token){
    const { userId, role } = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const accessToken = generateAccessToken(userId, role);
    const refreshToken = generateRefreshToken(userId, role);

    return { accessToken, refreshToken, userId, role } 
}



module.exports = {
    readJsonFile,
    modifyJsonFile,
    generateAccessToken,
    generateRefreshToken,
    generateRefreshedToken

};