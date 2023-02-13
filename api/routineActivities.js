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

    const { routineActivityId } = req.params;
    const { count, duration } = req.body;

    if (!auth) {

        res.send({

            error: 'Invalid login!',
            message: UnauthorizedError(),
            name: `:[`,
        });
    } else {
        let returnRoutAct = await getRoutineActivityById(routineActivityId);
        let routine = await getRoutineById(returnRoutAct.routineId);

        try {
            const token = auth.slice(prefix.length);
            const { id, username } = jwt.verify(token, JWT_SECRET);
            const jwtUserId = id;
            const routineCreatorId = routine.creatorId;

            if (jwtUserId === routineCreatorId) {

                const id = Number(routineActivityId);
                let updatedRoutineActivity = await updateRoutineActivity({ id, count, duration });
                console.log('newRoutineActivity is:', updatedRoutineActivity);

                res.send(updatedRoutineActivity)
            }

            else {
                res.status(403)
                res.send({

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

    try {
        const token = auth.slice(prefix.length);
        const { id, username } = jwt.verify(token, JWT_SECRET);
        const userId = id;

        let check = await canEditRoutineActivity(routineActivityId, userId);

        if (check) {
            const id = Number(routineActivityId);

            let destroyedRoutineActivity = await destroyRoutineActivity(id);

            res.send(destroyedRoutineActivity)
        }

        let returnRoutAct = await getRoutineActivityById(routineActivityId);
        let routName = await getRoutineById(returnRoutAct.routineId);

        res.status(403)
        res.send({

            error: 'Unauthorized delete!',
            message: UnauthorizedDeleteError(username, routName.name),
            name: `:[`,
        })

    } catch ({ error, message, name }) {
        next(error, message, name)
    }

});

module.exports = routineActivitiesRouter;