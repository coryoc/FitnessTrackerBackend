const client = require("./client");

async function createRoutine({ creatorId, isPublic, name, goal }) {
  const { rows: [routines] } = await client.query(`
    INSERT INTO routines ("creatorId", "isPublic", name, goal)
    VALUES($1, $2, $3, $4)
    RETURNING *;
  `, [creatorId, isPublic, name, goal]);

  return routines;

}

async function getRoutineById(id) { }

async function getRoutinesWithoutActivities() {
  const { rows: [activities] } = await client.query(`
    SELECT * FROM routines; 
  `);

  console.log('activities:', activities);

  return activities;
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
