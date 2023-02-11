/* eslint-disable no-useless-catch */
const express = require("express");
const usersRouter = express.Router();
const jwt = require('jsonwebtoken');
const { TOKEN_SECRET } = process.env;

const { createUser, getUser, getUserById, getUserByUsername } = require('../db');

const { PasswordTooShortError, UserTakenError, UnauthorizedError } = require('../errors');


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
        // console.log('username is:', username)
        // console.log('password is:', password)

        const userCheck = await getUserByUsername(username);

        // console.log('usercheck is:', userCheck)

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

        console.log('newUser is:', newUser);
        console.log('TOKEN_SECRET is:', TOKEN_SECRET);

        const token = jwt.sign({
            id: newUser.id,
            username: newUser.username,
        }, TOKEN_SECRET, {
            expiresIn: '1w'
        });

        console.log('token is:', token)
        console.log('newUser is:', newUser);

        res.send({
            message: 'thank you for singing up',
            token: token,
            user: newUser
        });

        // console.log('newUser is:', newUser);

    } catch ({ error, message, name }) {
        next(error, message, name);
    };
});

// POST /api/users/login

// GET /api/users/me
usersRouter.get('/users/me', async (req, res, next) => {
    // console.log('request body is:', req);

    const { username, password } = req.body

    try {
        console.log('username is:', username)
        console.log('password is:', password)

    } catch (error) {
        res.status(401).send({
            name: `:[`,
            error: "you're not logged in...",
            message: UnauthorizedError()
        })
    }

}
);
// usersRouter.get('/users/me', async (req, res, next) => {
//     // console.log('request body is:', req);

//     const { username, password } = req.body

//     console.log('username is:', username)
//     console.log('password is:', password)

//     const prefix = 'Bearer ';
//     const auth = req.header('Authorization');

//     if (!auth) {
//         res.status(401).send({
//             name: `:[`,
//             error: "you're not logged in...",
//             message: UnauthorizedError()
//         })
//     } else if (auth.startsWith(prefix)) {
//         const token = auth.slice(prefix.length);
//         console.log('authorized token is:', token)
//         try {
//             const { id } = jwt.verify(token, TOKEN_SECRET);

//             if (id) {
//                 req.user = await getUserById(id);
//                 res.send(req)
//             }
//         } catch (error) {
//             next(error)
//         }
//     } else {
//         next({
//             name: 'AuthorizationHeaderError',
//             message: `Authorization token must start with ${prefix}`
//         });
//     }
// }
// );

// GET /api/users/:username/routines

module.exports = usersRouter;
