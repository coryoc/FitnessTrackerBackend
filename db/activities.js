const client = require('./client');

// database functions
async function createActivity({ name, description }) {

  try {
    const { rows: [activities] } = await client.query(`
      INSERT INTO activities (name, description)
      VALUES($1, $2)
      RETURNING *;
    `, [name, description]);

    return activities;

  } catch (error) {
    console.log('Error Executing createActivity within activities.js');
    throw error;
  }


}

async function getAllActivities() {
  // select and return an array of all activities

  try {
    const { rows: activities } = await client.query(`
      SELECT * FROM activities; 
    `);

    return activities;

  } catch (error) {
    console.log('Error executing getAllActivities within activities.js');
    throw error;
  }

}

async function getActivityById(id) {
  try {
    const { rows: [activities] } = await client.query(`
      SELECT * FROM activities
      WHERE id=$1;
    `, [id]);

    return activities;

  } catch (error) {
    console.log('Error executing getActivityById within activities.js');
    throw error;
  }

}

async function getActivityByName(name) {
  try {
    const { rows: [activities] } = await client.query(`
      SELECT * FROM activities
      WHERE name=$1;
    `, [name]);

    return activities;
  } catch (error) {
    console.log('Error executing getActivityByName within activities.js');
    throw error;
  }

}

async function attachActivitiesToRoutines(routines) {
  // select and return an array of all activities
}

async function updateActivity({ id, ...fields }) {
  console.log('fields are:', fields)

  const setString = Object.keys(fields).map(
    (key, index) => `${key}=$${index + 1}`
  ).join(`, `);

  if (setString.length === 0) {
    return;
  }


  // const { name, description } = fields;

  // console.log('name is:', name);
  // console.log('description is:', description);


  try {
    const { rows: [activities] } = await client.query(`
      UPDATE activities
      SET ${setString}
      WHERE id=${id}
      RETURNING *;
    `, Object.values(fields));


    return activities

  } catch (error) {
    console.log('Error executing updateActivity within activities.js');
    throw error;
  }
}

module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity,
};
