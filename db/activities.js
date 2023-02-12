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
  try {

    // console.log('initial routines are:', routines);
    for (let i = 0; i < routines.length; ++i) {
      const routine = routines[i];
      const { rows: activities } = await client.query(`
      SELECT
        activities.*,
        routine_activities.id AS "routineActivityId",
        routine_activities."routineId",
        routine_activities.duration,
        routine_activities.count
      FROM activities
      JOIN routine_activities
      ON activities.id = routine_activities."activityId"
      WHERE routine_activities."routineId" = $1; 
      `, [routine.id])

      // const { rows: activities } = await client.query(`
      // SELECT * FROM activities
      // JOIN routine_activities
      // ON activities.id = routine_activities."activityId"
      // WHERE routine_activities."routineId" = $1; 
      // `, [routine.id])


      routine.activities = [];

      for (let j = 0; j < activities.length; ++j) {
        // console.log('activities are:', activities[j]);
        routine.activities.push(activities[j]);
        // console.log(routine.activities);
      }
    }
    // console.log('final routines are', routines);

    return routines

    // console.log('returnArr is: ', returnArr);

    //We can probably erase the below - just need to make sure we're returning this correctly in routines.js
    // SELECT * FROM activities
    // JOIN routine_activities 
    // ON routine_activities."activityId" = activities.id
    // WHERE routine_activities."routineId"=$1



  } catch (error) {
    console.log('Error attachingActivitiesToRoutines in activities.js');
    throw error;
  }
}

async function updateActivity({ id, name, description }) {

  try {
    // console.log('id is:', id)
    // console.log('name is:', name)
    // console.log('description is', description)

    const { rows: [activities] } = await client.query(`
      UPDATE activities
      SET
        name= COALESCE($2, name),
        description= COALESCE($3, description)
      WHERE id=$1
      RETURNING *;
    `, [id, name, description]);

    // console.log('activities are:', activities);

    return activities

  } catch (error) {
    console.log('Error executing updateActivity within activities.js');
    throw error;
  }
}

// async function updateActivity({ id, ...fields }) {

//   const setString = Object.keys(fields).map(
//     (key, index) => `${key}=$${index + 1}`
//   ).join(`, `);

//   if (setString.length === 0) {
//     return;
//   }

//   // const { name, description } = fields;

//   // console.log('name is:', name);
//   // console.log('description is:', description);


//   try {
//     console.log('setString is:', setString);
//     console.log('Object values are:', Object.values(fields));
//     const { rows: [activities] } = await client.query(`
//       UPDATE activities
//       SET ${setString}
//       WHERE id=${id}
//       RETURNING *;
//     `, Object.values(fields));


//     return activities

//   } catch (error) {
//     console.log('Error executing updateActivity within activities.js');
//     throw error;
//   }
// }

module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity,
};
