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
    destroyRoutine, } = require('../db');

    const { PasswordTooShortError, UserTakenError, UnauthorizedError, UnauthorizedUpdateError, UnauthorizedDeleteError } = require('../errors');


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


    try {
        const token = auth.slice(prefix.length);

        // console.log('token is:', token);
        const { id } = jwt.verify(token, JWT_SECRET);
    

        let creatorId = Number(id);
        // console.log('id is:', id);
        // console.log('creatorId is:', creatorId);






        if (id) {
            let newRoutine = await createRoutine({ creatorId, isPublic, name, goal });
            // console.log('newRoutine is:', newRoutine);

            res.send(newRoutine);
        }

    
        else {

           res.send( {
                
                error: 'Invalid login!',
                message: UnauthorizedError(),
                name: `:[`,
            })
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
    

    
    console.log('routineID is', routineId);
    console.log('routineID is', typeof routineId);


    console.log('isPublic is', isPublic);
    console.log('name is', name);
    console.log('goal is', goal);



    let routineToUpdate = await getRoutineById(routineId);

    console.log('routineToUpdate is', routineToUpdate);
   
    try {
        const token = auth.slice(prefix.length);

        // console.log('token is:', token);
        const { id, username } = jwt.verify(token, JWT_SECRET);
        const jwtUserId = id;
        const routineCreatorId = routineToUpdate.creatorId;
        console.log('userIdis',jwtUserId);
        console.log('goal is', routineCreatorId);
    
       

        if (jwtUserId  === routineCreatorId) {

            const id = Number(routineId);
            let  updatedRoutine = await updateRoutine({ id, isPublic, name, goal });
            console.log('newRoutine is:', updatedRoutine);
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

    
});


// DELETE /api/routines/:routineId


routinesRouter.delete('/:routineId', async (req, res, next) => {
    const prefix = 'Bearer ';
    const auth = req.header('Authorization');
    
    const {routineId} = req.params;
    const {isPublic, name, goal} = req.body;
    

    
    console.log('routineID is', routineId);
    console.log('routineID is', typeof routineId);


    console.log('isPublic is', isPublic);
    console.log('name is', name);
    console.log('goal is', goal);



    let routineToDelete = await getRoutineById(routineId);

    console.log('routineToUpdate is', routineToDelete);
   
    try {
        const token = auth.slice(prefix.length);

        // console.log('token is:', token);
        const { id, username } = jwt.verify(token, JWT_SECRET);
        const jwtUserId = id;
        const routineCreatorId = routineToDelete.creatorId;
        console.log('userIdis',jwtUserId);
        console.log('goal is', routineCreatorId);
    
       

        if (jwtUserId  === routineCreatorId) {

            const id = Number(routineId);
            let destroyRoutine = destroyRoutine({ id });
            console.log('destroyedRoutine is:', destroyRoutine);

            res.send( {
                 
                error: 'Invalid login!',
                message: UnauthorizedDeleteError(username, routineToDelete.name),
                name: `:[`,
            })
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

module.exports = routinesRouter;
