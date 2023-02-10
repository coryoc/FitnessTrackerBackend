require("dotenv").config()
const express = require("express")
const app = express()
const morgan = require('morgan');
const cors = require('cors')

const router = require('./api')

// Setup your Middleware and API Router here

app.use(express.json());
app.use(morgan("dev"));
app.use(cors())



app.use('/api', router);

// app.use((error, req, res, next) => {
//     if (error) {
//         res.send({
//             ...error
//         })
//     }
//     next();
// })

// app.get('*', (req, res) => {
//     res.status(404).send({ error: '404 - Not Found', message: 'No route found for the requested URL' });
// });


app.use((req, res, next) => {
    console.log("<____Body Logger START____>");
    console.log(req.body);
    console.log("<_____Body Logger END_____>");

    next();
});


module.exports = app;
