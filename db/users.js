const client = require("./client");

// database functions

// user functions
async function createUser({ 
                            username, 
                            password 
                          }) {


    const {rows: [users] } = await client.query(`
    INSERT INTO users (username, password )
    VALUES($1, $2)
    RETURNING id, username, password;
    `, [username, password]);
    return users;

}

async function getUser({ username, password }) {

}

async function getUserById(userId) {

}

async function getUserByUsername(userName) {

}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
}
