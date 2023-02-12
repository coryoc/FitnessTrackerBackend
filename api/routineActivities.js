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
    getRoutineById
     } = require('../db');


     const { PasswordTooShortError, UserTakenError, UnauthorizedError, UnauthorizedUpdateError, UnauthorizedDeleteError, DuplicateRoutineActivityError } = require('../errors');

// PATCH /api/routine_activities/:routineActivityId



routineActivitiesRouter.patch('/:routineActivityId', async (req, res, next) => {
    const prefix = 'Bearer ';
    const auth = req.header('Authorization');

    
    const {routineActivityId} = req.params;
    const { count, duration } = req.body;

    console.log('routineActivityId is', routineActivityId);
    console.log('routineActivityId is', typeof routineActivityId);


    console.log('count is',count);
    console.log(' duration is', duration);
    
    if (!auth) {

        res.send(    {
            
            error: 'Invalid login!',
            message: UnauthorizedError(),
            name: `:[`,
        });
    } else {

    
    // console.log('routineID is', routineId);
    // console.log('routineID is', typeof routineId);



 
    let returnRoutAct = await getRoutineActivityById(routineActivityId);
    // console.log("returnRoutAct: ",returnRoutAct);

    

    let routine = await getRoutineById(returnRoutAct.routineId);

    console.log('outine is', routine);



    try {
        const token = auth.slice(prefix.length);

        // console.log('token is:', token);
        const { id, username } = jwt.verify(token, JWT_SECRET);
        const jwtUserId = id;
        const routineCreatorId = routine.creatorId;
        // console.log('userIdis',jwtUserId);
        // console.log('goal is', routineCreatorId);



        if (jwtUserId  === routineCreatorId) {

            const id = Number(routineActivityId);
            let updatedRoutineActivity = await updateRoutineActivity({ id, count, duration  });
            console.log('newRoutineActivity is:', updatedRoutineActivity);

            res.send(updatedRoutineActivity)
        }
       

        else {
            res.status(403)
            res.send( {
                 
                 error: 'Invalid login!',
                 message: UnauthorizedUpdateError(username, routine.name),
                 name: `:[`,
             })
         }
 
    } catch ({ error, message, name }) {
        next(error, message, name)
    }

}
});



// DELETE /api/routine_activities/:routineActivityId


routineActivitiesRouter.delete('/:routineActivityId', async (req, res, next) => {
    const prefix = 'Bearer ';
    const auth = req.header('Authorization');
    
    const { routineActivityId } = req.params;
 
    // console.log('routineActivityId is', routineActivityId);
   
    try {
        const token = auth.slice(prefix.length);

        // console.log('token is:', token);
        const { id, username } = jwt.verify(token, JWT_SECRET);
        const userId = id;

        // console.log('userId is',userId);
        // console.log('routineCreatorId is', routineCreatorId);
    

    let check = await canEditRoutineActivity(routineActivityId, userId);

    // console.log("canEdit",check);

        if (check) {

            const id = Number(routineActivityId);
            // console.log('routineActivityId as a number is', id);

            let destroyedRoutineActivity =await destroyRoutineActivity( id);
            // console.log('destroyedRoutineActivity is:', destroyedRoutineActivity);

            res.send( destroyedRoutineActivity )
        }


            let returnRoutAct = await getRoutineActivityById(routineActivityId);
            // console.log("returnRoutAct: ",returnRoutAct);
        
            
            let routName = await getRoutineById(returnRoutAct.routineId);
            // console.log("routName: ",routName);
        
            

            res.status(403)
            res.send( {
                 
                 error: 'Invalid login!',
                 message: UnauthorizedDeleteError(username, routName.name),
                 name: `:[`,
             })

 
    } catch ({ error, message, name }) {
        next(error, message, name)
    }

    
});

module.exports = routineActivitiesRouter;
