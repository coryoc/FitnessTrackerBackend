require("dotenv").config()
const express = require("express")
const app = express()

// Setup your Middleware and API Router here
const router = require("./api/index");

const cors = require('cors')
const morgan = require('morgan')
const bodyParser = require('body-parser')



app.use(cors())
app.use(morgan("dev"));
app.use(express.json());


app.use('/api', router);



module.exports = app;
