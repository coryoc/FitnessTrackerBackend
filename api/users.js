/* eslint-disable no-useless-catch */
const express = require("express");
const usersRouter = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

const { createUser, getUser, getUserById, getUserByUsername, getPublicRoutinesByUser, getAllRoutinesByUser } = require('../db');

const { PasswordTooShortError, UserTakenError, UnauthorizedError } = require('../errors');

// POST /api/users/register
usersRouter.post('/register', async (req, res, next) => {
    const { username, password } = req.body;

    try {
        const userCheck = await getUserByUsername(username);

        if (userCheck) {
            res.send({
                name: `${username}`,
                message: UserTakenError(username),
                error: 'UserTakenError'
            });
        }

        if (password.length < 8) {
            res.send({
                name: `:[`,
                error: 'PasswordTooShort!',
                message: PasswordTooShortError()
            });
        }

        const newUser = await createUser({
            username,
            password
        });

        const token = jwt.sign({
            id: newUser.id,
            username: newUser.username,
        }, JWT_SECRET, {
            expiresIn: '1w'
        });

        res.send({
            message: 'thank you for singing up',
            token: token,
            user: newUser
        });


    } catch ({ error, message, name }) {
        next(error, message, name);
    };
});

// POST /api/users/login
usersRouter.post('/login', async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(401).send({
            name: `:[`,
            error: "Missing credentials",
            message: "Missing username or password"
        })
    }

    try {
        const authUser = await getUserByUsername(username);
        const id = authUser.id;

        let inputPassword = password
        let hashedPassword = authUser.password

        const passwordsMatch = await bcrypt.compare(inputPassword, hashedPassword)


        if (authUser && passwordsMatch) {
            const token = jwt.sign({
                id: authUser.id,
                username: authUser.username
            }, JWT_SECRET)

            res.send({
                user: { id: id, username: username },
                message: "you're logged in!",
                token: `${token}`
            });
        }

        else {
            res.send({
                name: `:[`,
                error: 'Invalid login!',
                message: 'Your login was no bueno'
            });
        }
    } catch ({ error, message, name }) {
        next(error, message, name);
    };


});

// GET /api/users/me
usersRouter.get('/me', async (req, res, next) => {
    const prefix = 'Bearer ';
    const auth = req.header('Authorization');

    if (!auth) {
        res.status(401).send({
            name: `:[`,
            error: "you're not logged in...",
            message: UnauthorizedError()
        })
    } else if (auth.startsWith(prefix)) {
        const token = auth.slice(prefix.length);

        try {
            const { id } = jwt.verify(token, JWT_SECRET);


            if (id) {
                let me = await getUserById(id);
                res.send(me)
            }

        } catch ({ error, message, name }) {
            next(error, message, name)
        }
    }
});

// GET /api/users/:username/routines
usersRouter.get('/:username/routines', async (req, res, next) => {
    const { username } = req.params;
    const prefix = 'Bearer ';
    const auth = req.header('Authorization');

    try {
        const token = auth.slice(prefix.length);
        const { username: jwtUsername } = jwt.verify(token, JWT_SECRET);

        if (username === jwtUsername) {
            let allRoutines = await getAllRoutinesByUser({ username });

            res.send(allRoutines);
        } else {
            let publicActivities = await getPublicRoutinesByUser({ username });

            res.send(publicActivities);
        }
    } catch ({ error, message, name }) {
        next(error, message, name)
    }
});


module.exports = usersRouter;
