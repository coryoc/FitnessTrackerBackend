const client = require("./client");
const { attachActivitiesToRoutines } = require('./activities.js')

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
    console.log('Error executing createRoutine within routines.js');
    throw error;
  }
}

async function getRoutineById(id) {
  try {
    const { rows: [routine] } = await client.query(`
      SELECT * FROM routines
      WHERE id=$1;
    `, [id])
  } catch (error) {
    console.log('Error executing getRoutineById within routines.js');
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
    console.log('Error executing getRoutinesWithoutActivities within routines.js');
    throw error;
  }
}

async function getAllRoutines() {
  try {
    const { rows: routines } = await client.query(`
      SELECT * FROM routines
    `)

    let routinesAndActivities = attachActivitiesToRoutines(routines);
    routinesAndActivities.then(array => { return array });

    console.log('routinesAndActivities =', routinesAndActivities)

    return routinesAndActivities;

  } catch (error) {
    console.log('Error executing getAllRoutines within routines.js');
    throw error;
  }
}

async function getAllPublicRoutines() {
  // try {
  //   const { rows: routines } = await client.query(`
  //       SELECT * FROM routines
  //       WHERE "isPublic"=true
  //     `)

  //   console.log('routine ids are:', routines.id);

  //   await
  //   return routines;

  // } catch (error) {
  //   console.log('Error executing getAllPublicRoutines within routines.js');
  //   throw error;
  // }

}

async function getAllRoutinesByUser({ username }) { }

async function getPublicRoutinesByUser({ username }) { }

async function getPublicRoutinesByActivity({ id }) { }

async function updateRoutine({ id, ...fields }) { }

async function destroyRoutine(id) { }

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
