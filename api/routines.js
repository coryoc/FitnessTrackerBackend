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

    console.log('name :', name);
    console.log('goal :', goal);
    console.log('ispublic :', isPublic);


    try {
        const token = auth.slice(prefix.length);

        console.log('token is:', token);
        const { id } = jwt.verify(token, JWT_SECRET);

        console.log('id is:', id);

        if (id) {
            let newRoutine = await createRoutine({ id, isPublic, name, goal });
            console.log('newRoutine is:', newRoutine);

            res.send(newRoutine);
        }

    } catch ({ error, message, name }) {
        next(error, message, name)
    }

});

// PATCH /api/routines/:routineId

// DELETE /api/routines/:routineId

// POST /api/routines/:routineId/activities

module.exports = routinesRouter;
