const express = require('express');
const routineActivitiesRouter = express.Router();

const jwt = require('jsonwebtoken')
const { JWT_SECRET } = process.env;


const { getRoutineActivityById,
    addActivityToRoutine,
    getRoutineActivitiesByRoutine,
    updateRoutineActivity,
    destroyRoutineActivity,
    canEditRoutineActivity,
     } = require('../db');


// PATCH /api/routine_activities/:routineActivityId

// DELETE /api/routine_activities/:routineActivityId


routineActivitiesRouter.delete('/:routineActivityId', async (req, res, next) => {
    const prefix = 'Bearer ';
    const auth = req.header('Authorization');
    
    const {routineActivityId} = req.params;
 
    

    
    console.log('routineActivityId is', routineActivityId);
    console.log('routineActivityId type is', typeof routineActivityId);




    let routineActivityToDelete = await getRoutineActivityById(routineActivityId);

    console.log('routineActivityToDelete is', routineActivityToDelete);
   
    try {
        const token = auth.slice(prefix.length);

        // console.log('token is:', token);
        const { id, username } = jwt.verify(token, JWT_SECRET);
        const jwtUserId = id;
        const routineCreatorId = routineActivityToDelete.creatorId;
       
        console.log('jwtUserIdis',jwtUserId);
        console.log('routineCreatorId is', routineCreatorId);
    
       

        if (jwtUserId  === routineCreatorId) {

            const id = Number(routineId);
            console.log('routineId as a number is', id);

            let destroyedRoutineActivity = destroyRoutineActivity( id);
            console.log('destroyedRoutineActivity is:', destroyedRoutineActivity);

            res.send( destroyedRoutineActivity )
        }

        else {
            res.status(403)
            res.send( {
                 
                 error: 'Invalid login!',
                 message: UnauthorizedDeleteError(username, routineToDelete.name),
                 name: `:[`,
             })
         }
 
    } catch ({ error, message, name }) {
        next(error, message, name)
    }

    
});

module.exports = routineActivitiesRouter;
