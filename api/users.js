/* eslint-disable no-useless-catch */
const express = require("express");
const usersRouter = express.Router();

const { createUser, getUser, getUserById, getUserByUsername } = require('../db');

const { PasswordTooShortError, UserTakenError } = require('../errors');

const jwt = require('jsonwebtoken');
const { TOKEN_SECRET } = process.env;

// POST /api/users/register

usersRouter.post('/register', async (req, res, next) => {
    const { username, password } = req.body;

    try {
        console.log('username is:', username)
        // console.log('password is:', password)

        const userCheck = await getUserByUsername(username);

        console.log('usercheck is:', userCheck)

        if (userCheck) {
            next({
                error: 'UserTakenError',
                message: UserTakenError(username),
                name: `${username}`
            });
        } else if (password.length < 8) {
            next({
                error: 'PasswordTooShort!',
                message: PasswordTooShortError(),
                name: `:[`
            });
        }

        const newUser = await createUser({
            username,
            password
        });

        console.log(newUser);

        // const token = jwt.sign({
        //     id: newUser.id,
        //     username
        // }, process.env.TOKEN_SECRET, {
        //     expiresIn: '1d'
        // });

        console.log('newUser is:', newUser);

        res.send({
            message: 'thank you for singing up',
            token: 'dfasdfasd',
            user: newUser
        });

    } catch ({ error, message, name }) {
        next(error, message, name);
    }
})

// POST /api/users/login

// GET /api/users/me

// GET /api/users/:username/routines

module.exports = usersRouter;
