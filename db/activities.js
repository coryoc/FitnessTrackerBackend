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
    throw error;
  }
}

async function getAllActivities() {
  try {
    const { rows: activities } = await client.query(`
      SELECT * FROM activities; 
    `);

    return activities;

  } catch (error) {
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
    throw error;
  }
}

async function attachActivitiesToRoutines(routines) {
  try {
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

      routine.activities = [];

      for (let j = 0; j < activities.length; ++j) {
        routine.activities.push(activities[j]);
      }
    }
    return routines
  } catch (error) {
    throw error;
  }
}

async function updateActivity({ id, name, description }) {
  try {
    const { rows: [activities] } = await client.query(`
      UPDATE activities
      SET
        name= COALESCE($2, name),
        description= COALESCE($3, description)
      WHERE id=$1
      RETURNING *;
    `, [id, name, description]);

    return activities

  } catch (error) {
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
