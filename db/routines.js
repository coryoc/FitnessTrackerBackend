const client = require("./client");
const { attachActivitiesToRoutines } = require('./activities.js');
const { destroyRoutineActivity, getRoutineActivitiesByRoutine } = require('./routine_activities.js');


async function createRoutine({ creatorId, isPublic, name, goal }) {
  try {
    const { rows: [routines] } = await client.query(`
      INSERT INTO routines (
        "creatorId", 
        "isPublic", 
        name, 
        goal)
      VALUES($1, $2, $3, $4)
      RETURNING *;
    `, [creatorId, isPublic, name, goal]);

    return routines;

  } catch (error) {
    throw error;
  }
}

async function getRoutineById(id) {
  try {
    const { rows: [routine] } = await client.query(`
      SELECT * FROM routines
      WHERE id=$1;
    `, [id]);
    return routine;
  } catch (error) {
    throw error;
  }
}

async function getRoutinesWithoutActivities() {
  try {
    const { rows: routines } = await client.query(`
      SELECT 
        id, 
        "creatorId", 
        "isPublic", 
        name, 
        goal 
      FROM routines; 
    `);

    return routines;
  } catch (error) {
    throw error;
  }
}

async function getAllRoutines() {
  try {
    const { rows: routines } = await client.query(`
      SELECT
        routines.*,
        users.username AS "creatorName"
      FROM routines
      JOIN users
      ON routines."creatorId" = users.id;
    `)

    let routinesAndActivities = await attachActivitiesToRoutines(routines);

    return routinesAndActivities;

  } catch (error) {
    throw error;
  }
}

async function getAllPublicRoutines() {
  try {
    const { rows: routines } = await client.query(`
      SELECT 
        routines.*,
        users.username AS "creatorName"
      FROM routines
      JOIN users
      ON routines."creatorId" = users.id
      WHERE "isPublic" = true;
    `)

    let routinesAndActivities = await attachActivitiesToRoutines(routines);

    return routinesAndActivities;
  } catch (error) {
    throw error;

  }

}

async function getAllRoutinesByUser({ username }) {
  try {
    const { rows: routines } = await client.query(`
      SELECT
        routines.*,
        users.username AS "creatorName"
      FROM routines
      JOIN users
      ON routines."creatorId" = users.id
      WHERE users.username = $1;
    `, [username]);

    let routinesAndActivities = await attachActivitiesToRoutines(routines);

    return routinesAndActivities;
  } catch (error) {
    throw error;
  }

}

async function getPublicRoutinesByUser({ username }) {
  try {
    const { rows: routines } = await client.query(`
      SELECT
        routines.*,
        users.username AS "creatorName"
      FROM routines
      JOIN users
      ON routines."creatorId" = users.id
      WHERE users.username =$1
      AND "isPublic" = true;
    `, [username]);

    let routinesAndActivities = await attachActivitiesToRoutines(routines);

    return routinesAndActivities;
  } catch (error) {
    throw error;
  }

}

async function getPublicRoutinesByActivity({ id }) {
  try {
    const { rows: routines } = await client.query(`
      SELECT
        routines.*,
        users.username AS "creatorName",
        routine_activities."activityId"
      FROM routines

      JOIN users
      ON routines."creatorId" = users.id

      JOIN routine_activities
      ON routines.id = routine_activities."routineId"

      WHERE routine_activities."activityId"=$1
      AND "isPublic" = true;
    `, [id]);

    let routinesAndActivities = await attachActivitiesToRoutines(routines);

    return routinesAndActivities;
  } catch (error) {
    throw error;
  }

}

async function updateRoutine({ id, ...fields }) {
  const { isPublic, name, goal } = fields;

  try {
    const { rows: [routine_activity] } = await client.query(`
    UPDATE routines
    SET 
      "isPublic" = COALESCE($2, "isPublic"), 
      name  = COALESCE($3, name), 
      goal = COALESCE($4, goal)
    WHERE id=$1
    
    RETURNING *;
    `, [id, isPublic, name, goal]);

    return routine_activity;

  } catch (error) {
    throw error;
  }

}

async function destroyRoutine(id) {
  let fullRoutine = await getRoutineById(id);
  let routineActivities = await getRoutineActivitiesByRoutine(fullRoutine);

  for (let i = 0; i < routineActivities.length; ++i) {
    let individualRoutineActivity = routineActivities[i];
    let id = individualRoutineActivity.id;
    await destroyRoutineActivity(id);
  }

  try {
    const { rows: [routine] } = await client.query(`
    DELETE FROM routines
    WHERE id=$1
    RETURNING *;
  `, [id]);

    return routine;

  } catch (error) {
    throw error;
  }
}

module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
};
