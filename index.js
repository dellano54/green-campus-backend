const express = require('express');
const { LoggingMiddleWare, CheckAuthorizationHeader } = require("./middleware/middleware");
const login = require("./app/login");
const dashboard = require("./app/dashboard");
const blocks = require("./app/blocks");
const schedule = require('./app/schedule');
const staff = require("./app/staff");

require('dotenv').config()
require('./cron/resetScheduler');

const app = express();
const port = 3000;


//middlewares

app.use(express.json())
app.use(LoggingMiddleWare)
app.use("/auth", login);
app.use("/dashboard", CheckAuthorizationHeader, dashboard);
app.use("/", CheckAuthorizationHeader, blocks);
app.use("/schedules", CheckAuthorizationHeader, schedule);
app.use("/staff", CheckAuthorizationHeader, staff);


app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})
