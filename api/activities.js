const express = require('express');
const activitiesRouter = express.Router();
const {getAllActivities, createActivity, getActivityByName, getPublicRoutinesByActivity} = require('../db');
const {ActivityExistsError, ActivityNotFoundError, UnauthorizedError} = require('../errors');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

// GET /api/activities/:activityId/routines

activitiesRouter.get("/:activityId/routines", async (req, res, next) => {
    
    const { activityId } = req.params;
    console.log(activityId);
    const convertedActId = +activityId;
    console.log("convertedActId type is", typeof(convertedActId));
    
    try {
        console.log("convertedActID is", convertedActId);
        let publicIdByAct = await getPublicRoutinesByActivity({activityId});
        console.log("publicIdByAct is", publicIdByAct);
   
    res.send(
        publicIdByAct
    )
    }catch ({ error, message, name }) {
        next(error, message, name)
    }
});




// GET /api/activities

activitiesRouter.get("/", async (req, res, next) => {
    
    const activities = await getAllActivities();
   
    res.send(
        activities
    )
});

// POST /api/activities

activitiesRouter.post("/", async (req, res, next) => {
    
    const {name, description} = req.body;
    const prefix = 'Bearer ';
    const auth = req.header('Authorization');

    
    try {
        const token = auth.slice(prefix.length);
        const { username } = jwt.verify(token, JWT_SECRET);

        const activityCheck = await getActivityByName(name);

        if (activityCheck) {

            res.send({
                name: `:[`,
                error: "Activity with identical name already exists...",
                message: ActivityExistsError(name)
            })
        }
        
        if (username) {
            let newRoutine = await createActivity({name, description});
            
            res.send(newRoutine);
            } 
     
    } catch ({ error, message, name }) {
        next(error, message, name)
    }
   
 });
 

// PATCH /api/activities/:activityId

module.exports = activitiesRouter;
