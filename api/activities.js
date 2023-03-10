const express = require('express');
const activitiesRouter = express.Router();
const { getAllActivities, createActivity, getActivityByName, getPublicRoutinesByActivity, getActivityById, updateActivity } = require('../db');
const { ActivityExistsError, ActivityNotFoundError, UnauthorizedError } = require('../errors');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

// GET /api/activities/:activityId/routines
activitiesRouter.get("/:activityId/routines", async (req, res, next) => {
    const { activityId } = req.params;
    const id = activityId;
    const originalActivity = await getActivityById(id);

    try {
        if (originalActivity) {
            const routines = await getPublicRoutinesByActivity({ id });
            res.send(routines);
        }

        if (!originalActivity) {
            res.status(401)
            res.send({
                error: 'GetMeError', name: '401', message: `Activity ${id} not found`
            });
        }
    } catch ({ error, message, name }) {
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

    const { name, description } = req.body;
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
            let newRoutine = await createActivity({ name, description });

            res.send(newRoutine);
        }

    } catch ({ error, message, name }) {
        next(error, message, name)
    }

});


// PATCH /api/activities/:activityId
activitiesRouter.patch('/:activityId', async (req, res, next) => {
    const { activityId: id } = req.params;
    const { name, description } = req.body;

    const auth = req.header('Authorization');

    if (!auth) {
        res.status(401).send({
            name: `:[`,
            error: "you're not logged in...",
            message: UnauthorizedError()
        })
    }

    const activityCheck = await getActivityByName(name);

    if (activityCheck) {
        res.status(401)
        res.send({
            error: 'cannot update as ',
            name: '401',
            message: ActivityExistsError(name)
        });
    }

    try {
        const originalActivity = await getActivityById(id);

        if (originalActivity) {
            let updatedActivity = await updateActivity({ id, name, description });

            res.send(updatedActivity)
        } else {
            res.status(401)
            res.send({
                error: 'Activity Not Found',
                name: '401',
                message: ActivityNotFoundError(id)
            });
        }
    } catch ({ error, message, name }) {
        next(error, message, name)
    }

});


module.exports = activitiesRouter;
