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

module.exports = routinesRouter;
