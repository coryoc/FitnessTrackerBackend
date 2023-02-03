const client = require("./client");

// database functions

// user functions
async function createUser({ username, password }) {

  try {
    const { rows: [users] } = await client.query(`
      INSERT INTO users (username, password )
      VALUES($1, $2)
      RETURNING *;
    `, [username, password]);

    return users;

  } catch (error) {
    console.log('Error executing createUser from users.js');
    throw error;
  }

}

async function getUser({ username, password }) {

}

async function getUserById(userId) {
  try {
    const { rows: user } = await client.query(`
      SELECT id, username FROM users
      WHERE id=($1);
    `, [userId])

    console.log(user);

    return user;

  } catch (error) {
    console.log('Error executing getUserById from users.js');
    throw error;
  }

}

async function getUserByUsername(userName) {

}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
}
