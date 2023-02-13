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

    if (!auth) {

        res.send({

            error: 'Invalid login!',
            message: UnauthorizedError(),
            name: `:[`,
        });
    }

    try {
        const token = auth.slice(prefix.length);
        const { id } = jwt.verify(token, JWT_SECRET);

        let creatorId = Number(id);

        if (id) {
            let newRoutine = await createRoutine({ creatorId, isPublic, name, goal });

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

    const { routineId } = req.params;
    const { isPublic, name, goal } = req.body;

    if (!auth) {

        res.send({

            error: 'Invalid login!',
            message: UnauthorizedError(),
            name: `:[`,
        });
    } else {
        let routineToUpdate = await getRoutineById(routineId);

        try {
            const token = auth.slice(prefix.length);

            const { id, username } = jwt.verify(token, JWT_SECRET);
            const jwtUserId = id;
            const routineCreatorId = routineToUpdate.creatorId;

            if (jwtUserId === routineCreatorId) {

                const id = Number(routineId);
                let updatedRoutine = await updateRoutine({ id, isPublic, name, goal });

                res.send(updatedRoutine)
            }

            else {
                res.status(403)
                res.send({

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

    const { routineId } = req.params;

    let routineToDelete = await getRoutineById(routineId);


    try {
        const token = auth.slice(prefix.length);
        const { id, username } = jwt.verify(token, JWT_SECRET);
        const jwtUserId = id;
        const routineCreatorId = routineToDelete.creatorId;

        if (jwtUserId === routineCreatorId) {

            const id = Number(routineId);
            console.log('routineId as a number is', id);

            let destroyedRoutine = await destroyRoutine(id);
            console.log('destroyedRoutine is:', destroyedRoutine);

            res.send(destroyedRoutine)
        }

        else {
            res.status(403)
            res.send({

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

    const { routineId } = req.params
    const { activityId, count, duration } = req.body;

    const fields = {
        routineId,
        activityId,
        count,
        duration
    }

    function duplicateHelper(routine_act) {
        for (let i = 0; i < routine_act.length; ++i) {
            let curRoutAct = routine_act[i]

            if (curRoutAct.activityId === fields.activityId) {
                res.send({
                    error: "DuplicateError",
                    message: DuplicateRoutineActivityError(routineId, activityId),
                    name: "Acitivity already exists"
                })
                return false
            }
        }
        return true
    }

    try {
        const routine = await getRoutineById(routineId)
        const routine_act = await getRoutineActivitiesByRoutine(routine)

        if (duplicateHelper(routine_act)) {
            const addActivity = await addActivityToRoutine(fields)
            res.send(addActivity)
        }
    } catch ({ error, message, name }) {
        next(error, message, name)
    }

});


module.exports = routinesRouter;
