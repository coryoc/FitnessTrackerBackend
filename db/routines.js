const client = require("./client");

async function createRoutine({ creatorId, isPublic, name, goal }) {
  try {
    const { rows: [routines] } = await client.query(`
      INSERT INTO routines ("creatorId", "isPublic", name, goal)
      VALUES($1, $2, $3, $4)
      RETURNING *;
    `, [creatorId, isPublic, name, goal]);

    return routines;

  } catch (error) {
    console.log('Error executing createRoutine within routines.js');
    throw error;
  }


}

async function getRoutineById(id) { }

async function getRoutinesWithoutActivities() {
  try {
    const { rows: routines } = await client.query(`
      SELECT id, "creatorId", "isPublic", name, goal FROM routines; 
    `);

    return routines;
  } catch (error) {
    console.log('Error executing getRoutinesWithoutActivities within routines.js');
    throw error;
  }
}

async function getAllRoutines() { }

async function getAllPublicRoutines() { }

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
