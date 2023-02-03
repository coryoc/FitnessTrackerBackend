const client = require("./client");
const bcrypt = require('bcrypt');
const SALT_COUNT = 10;

// database functions

// user functions
async function createUser({ username, password }) {
  const hashedPassword = await bcrypt.hash(password, SALT_COUNT)

  try {
    const { rows: [users] } = await client.query(`
      INSERT INTO users (username, password )
      VALUES($1, $2)
      RETURNING id, username;
    `, [username, hashedPassword]);

    return users;

  } catch (error) {
    console.log('Error executing createUser from users.js');
    throw error;
  }

}



async function getUser({ username, password }) {
  const selectedUser = await getUserByUsername(username);

  const selectedUsername = selectedUser.username
  const hashedPassword = selectedUser.password

  console.log('user is:', selectedUsername)

  console.log('password is:', password);
  console.log('hashedPassword is:', hashedPassword);

  let passwordsMatch = await bcrypt.compare(password, hashedPassword)
  if (passwordsMatch) {
    try {
      const { rows: [user] } = await client.query(`
          SELECT id, username FROM users
          WHERE username=$1
          AND password=$2;
        `, [selectedUsername, hashedPassword]);

      return user;

    } catch (error) {
      console.log('Error executing getUser from users.js');
      throw error;
    }
  } else {
    throw Error('Invalid Password');
  }

}

async function getUserById(userId) {
  try {
    const { rows: [user] } = await client.query(`
      SELECT id, username FROM users
      WHERE id=$1;
    `, [userId]);

    return user;

  } catch (error) {
    console.log('Error executing getUserById from users.js');
    throw error;
  }

}

async function getUserByUsername(userName) {
  try {
    const { rows: [user] } = await client.query(`
      SELECT * FROM users
      WHERE username=$1;
    `, [userName]);

    return user;

  } catch (error) {
    console.log('Error executing getUserByUsername from users.js');
    throw error;
  }

}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
}
