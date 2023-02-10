/* eslint-disable no-useless-catch */
const express = require("express");
const usersRouter = express.Router();
const jwt = require('jsonwebtoken');

const { createUser, getUser, getUserById, getUserByUsername } = require('../db');

const { PasswordTooShortError, UserTakenError } = require('../errors');

const { TOKEN_SECRET = 'hush' } = process.env;

// POST /api/users/register
// usersRouter.post('/register', async (req, res, next) => {
//     try {
//         const { username, password } = req.body;
//         const queriedUser = await getUserByUsername(username);
//         if (queriedUser) {
//             res.status(401);
//             next({
//                 name: 'UserExistsError',
//                 message: 'A user by that username already exists',
//                 error: 'dfasdfas'
//             });
//         } else if (password.length < 8) {
//             res.status(401);
//             next({
//                 name: 'PasswordLengthError',
//                 message: 'Password Too Short!',
//                 error: 'asdfadsf'
//             });
//         } else {
//             const user = await createUser({
//                 username,
//                 password
//             });
//             if (!user) {
//                 next({
//                     name: 'UserCreationError',
//                     message: 'There was a problem registering you. Please try again.',
//                     error: 'dfasdf'
//                 });
//             } else {
//                 const token = jwt.sign({ id: user.id, username: user.username }, TOKEN_SECRET, { expiresIn: '1w' });
//                 res.send({ user, message: "you're signed up!", token });
//             }
//         }
//     } catch (error) {
//         next(error)
//     }
// })


usersRouter.post('/register', async (req, res, next) => {
    const { username, password } = req.body;

    try {
        console.log('username is:', username)
        console.log('password is:', password)

        const userCheck = await getUserByUsername(username);

        console.log('usercheck is:', userCheck)

        if (userCheck) {
            next({
                error: 'UserTakenError',
                message: 'UserTakenError(username)',
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

        if (!newUser) {
            next({
                error: 'asdfsdd',
                message: 'sdfasdf',
                name: 'dsfasdf'
            })
        } else {
            res.send({
                message: 'thank you for singing up',
                token: 'dfasdfasd',
                user: newUser
            });
        }


        // const token = jwt.sign({
        //     id: newUser.id,
        //     username
        // }, process.env.TOKEN_SECRET, {
        //     expiresIn: '1d'
        // });

        console.log('newUser is:', newUser);


    } catch ({ error, message, name }) {
        next(error, message, name);
    }
})

// POST /api/users/login

// GET /api/users/me

// GET /api/users/:username/routines

module.exports = usersRouter;
