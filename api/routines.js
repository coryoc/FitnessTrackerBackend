const express = require('express');
const routinesRouter = express.Router();
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = process.env;

const { getRoutineById,
    getRoutinesWithoutActivities,
    getAllRoutines,
    getAllPublicRoutines,
    getAllRoutinesByUser,
    getPublicRoutinesByUser,
    getPublicRoutinesByActivity,
    createRoutine,
    updateRoutine,
    destroyRoutine, addActivityToRoutine, getActivityById, getRoutineActivitiesByRoutine, 
} = require('../db');

    const { PasswordTooShortError, UserTakenError, UnauthorizedError, UnauthorizedUpdateError, UnauthorizedDeleteError, DuplicateRoutineActivityError } = require('../errors');


// GET /api/routines
routinesRouter.get('/', async (req, res, next) => {
    const routines = await getAllRoutines();
    res.send(
        routines
    )
});

// POST /api/routines
routinesRouter.post('/', async (req, res, next) => {

    const { name, goal, isPublic } = req.body;
    const prefix = 'Bearer ';
    const auth = req.header('Authorization');

    // console.log('name :', name);
    // console.log('goal :', goal);
    // console.log('ispublic :', isPublic);

    if (!auth) {

        res.send(    {
            
            error: 'Invalid login!',
            message: UnauthorizedError(),
            name: `:[`,
        });
    }


    

    try {
        const token = auth.slice(prefix.length);

        console.log('token is:', token);
        const { id } = jwt.verify(token, JWT_SECRET);
    

        let creatorId = Number(id);
        console.log('id is:', id);
        console.log('creatorId is:', creatorId);

    console.log('creatorId type is:',typeof creatorId);

 
        if (id) {
            let newRoutine = await createRoutine({ creatorId, isPublic, name, goal });
            console.log('newRoutine is:', newRoutine);

            res.send(newRoutine);
        }
           
       

    } catch ({ error, message, name }) {
        next(error, message, name)
    }

});

// PATCH /api/routines/:routineId

routinesRouter.patch('/:routineId', async (req, res, next) => {
    const prefix = 'Bearer ';
    const auth = req.header('Authorization');

    
    const {routineId} = req.params;
    const {isPublic, name, goal} = req.body;
    
    if (!auth) {

        res.send(    {
            
            error: 'Invalid login!',
            message: UnauthorizedError(),
            name: `:[`,
        });
    } else {

    
    // console.log('routineID is', routineId);
    // console.log('routineID is', typeof routineId);


    // console.log('isPublic is', isPublic);
    // console.log('name is', name);
    // console.log('goal is', goal);

 

    let routineToUpdate = await getRoutineById(routineId);

    // console.log('routineToUpdate is', routineToUpdate);



    try {
        const token = auth.slice(prefix.length);

        // console.log('token is:', token);
        const { id, username } = jwt.verify(token, JWT_SECRET);
        const jwtUserId = id;
        const routineCreatorId = routineToUpdate.creatorId;
        // console.log('userIdis',jwtUserId);
        // console.log('goal is', routineCreatorId);



        if (jwtUserId  === routineCreatorId) {

            const id = Number(routineId);
            let updatedRoutine = await updateRoutine({ id, isPublic, name, goal });
            console.log('newRoutine is:', updatedRoutine);

            res.send(updatedRoutine)
        }
       

        else {
            res.status(403)
            res.send( {
                 
                 error: 'Invalid login!',
                 message: UnauthorizedUpdateError(username, routineToUpdate.name),
                 name: `:[`,
             })
         }
 
    } catch ({ error, message, name }) {
        next(error, message, name)
    }

}
});


// DELETE /api/routines/:routineId


routinesRouter.delete('/:routineId', async (req, res, next) => {
    const prefix = 'Bearer ';
    const auth = req.header('Authorization');
    
    const {routineId} = req.params;
 
    

    
    // console.log('routineID is', routineId);
    // console.log('routineID type is', typeof routineId);




    let routineToDelete = await getRoutineById(routineId);

    // console.log('routineToDelete is', routineToDelete);
   
    try {
        const token = auth.slice(prefix.length);

        // console.log('token is:', token);
        const { id, username } = jwt.verify(token, JWT_SECRET);
        const jwtUserId = id;
        const routineCreatorId = routineToDelete.creatorId;
       
        // console.log('jwtUserIdis',jwtUserId);
        // console.log('routineCreatorId is', routineCreatorId);
    
       

        if (jwtUserId  === routineCreatorId) {

            const id = Number(routineId);
            console.log('routineId as a number is', id);

            let destroyedRoutine =await  destroyRoutine( id);
            console.log('destroyedRoutine is:', destroyedRoutine);

            res.send( destroyedRoutine )
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

// POST /api/routines/:routineId/activities



routinesRouter.post('/:routineId/activities', async (req, res, next) => {




    const { routineId, activityId, count, duration } = req.body;


    console.log('count :', count);
    console.log('duration:', duration);

    

    try {
    
        let dupRoutine = await getRoutineById(routineId);

        let dupRoutineActivities = await getRoutineActivitiesByRoutine(dupRoutine);

        let dupActivities = await getActivityById(activityId);


        console.log('routineId:', routineId);
        // console.log("dupRoutine:", dupRoutine);
        // console.log("dupRoutine.id:", dupRoutine.id);

        console.log('activityId :', activityId);
        // console.log(" dupActivities:",  dupActivities);
        console.log("dupRoutineActivities:", dupRoutineActivities);

        const match =  dupRoutineActivities.map(obj => {
            if (obj.activityId === activityId) {
                return true;
            } else {return false;}
        } );

        let x = dupRoutineActivities[0];
        console.log("x", x.activityId);


            if ( x.activityId === activityId) {
             res.send({
                error: 'Invalid login!',
                message:DuplicateRoutineActivityError(activityId, routineId),
                name: `:[`,

             })
            } else {

            let newRoutineActivity = await addActivityToRoutine({  routineId, activityId, count, duration  });
            console.log('newRoutineActivity is:', newRoutineActivity);

            res.send(newRoutineActivity);
            }
        }
           
        catch ({ error, message, name }) {
        next(error, message, name)
    }

});


module.exports = routinesRouter;
