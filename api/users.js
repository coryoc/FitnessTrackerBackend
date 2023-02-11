/* eslint-disable no-useless-catch */
const express = require("express");
const usersRouter = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

const { createUser, getUser, getUserById, getUserByUsername, getPublicRoutinesByUser, getAllRoutinesByUser } = require('../db');

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

        // console.log('newUser is:', newUser);
        // console.log('TOKEN_SECRET is:', TOKEN_SECRET);

        const token = jwt.sign({
            id: newUser.id,
            username: newUser.username,
        }, JWT_SECRET, {
            expiresIn: '1w'
        });

        // console.log('token is:', token)
        // console.log('newUser is:', newUser);

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
usersRouter.post('/login', async (req, res, next) => {
    const { username, password } = req.body;

    // console.log('username is:', username)
    // console.log('password is:', password)

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

        // console.log('authUser is:', authUser);
        // console.log('authUser name is:', authUser.username);
        // console.log('authUser id is:', authUser.id);

        if (authUser && passwordsMatch) {
            const token = jwt.sign({
                id: authUser.id,
                username: authUser.username
            }, JWT_SECRET)


            // console.log('token is:', token);

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
        // console.log('authorized token is:', token)

        try {
            const { id } = jwt.verify(token, JWT_SECRET);

            // console.log('id is;', id);

            if (id) {
                let me = await getUserById(id);
                // console.log('I am:', me)
                res.send(me)
            }
            // console.log('username is:', username)
            // console.log('password is:', password)

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

    console.log('request header is:', req.header);

    try {
        const token = auth.slice(prefix.length);
        const { username: jwtUsername } = jwt.verify(token, JWT_SECRET);

        if (username === jwtUsername) {
            let allRoutines = await getAllRoutinesByUser({ username });
            console.log('allRoutines are:', allRoutines)

            res.send(allRoutines);
        } else {
            let publicActivities = await getPublicRoutinesByUser({ username });
            // console.log('publicActivities are:', publicActivities);

            res.send(publicActivities);
        }
    } catch ({ error, message, name }) {
        next(error, message, name)
    }

    // else if (auth.startsWith(prefix)) {
    // const token = auth.slice(prefix.length);

});


// usersRouter.get('/:username/routines', async (req, res, next) => {
//     const { username } = req.params;
//     const prefix = 'Bearer ';
//     const auth = req.header('Authorization');

//     if (auth && auth.startsWith(prefix)) {
//         const token = auth.slice(prefix.length);
//         console.log('authorized token is:', token)

//         try {
//             const { id } = jwt.verify(token, JWT_SECRET);

//             console.log('id is;', id);

//             if (id) {
//                 let allRoutines = await getAllRoutinesByUser({ username });
//                 console.log('allRoutines are:', allRoutines)

//                 res.send(allRoutines);
//             }

//         } catch ({ error, message, name }) {
//             next(error, message, name)
//         }
//     } else {
//         try {
//             // console.log('username is: ', { username });
//             let publicActivities = await getPublicRoutinesByUser({ username });
//             // console.log('publicActivities are:', publicActivities);

//             res.send(publicActivities);

//         } catch ({ error, message, name }) {
//             next(error, message, name)
//         }
//     }
// });

module.exports = usersRouter;
