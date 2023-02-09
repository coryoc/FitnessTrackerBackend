const client = require("./client");
// const { getRoutineById } = require('./routines.js');

async function addActivityToRoutine({
  routineId,
  activityId,
  count,
  duration,
}) {

  try {
    const { rows: [routine_activity] } = await client.query(`
      INSERT INTO routine_activities("routineId", "activityId", count, duration)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) DO NOTHING
      RETURNING *;
      `, [routineId, activityId, count, duration]);

    return routine_activity;

  } catch (error) {
    console.log('Error executing addActivityToRoutine within routine_activites.js');
    throw error;
  }

}

async function getRoutineActivityById(id) {
  try {
    const { rows: [routine_activity] } = await client.query(`
      SELECT * FROM routine_activities
      WHERE id=$1;
    `, [id]);

    return routine_activity;

  } catch (error) {
    console.log('Error executing getActivityById within activities.js');
    throw error;
  }

}

async function getRoutineActivitiesByRoutine({ id }) {

  try {
    const { rows: routine_activity } = await client.query(`
      SELECT * FROM routine_activities
      WHERE "routineId"=$1;
    `, [id]);


    return routine_activity;

  } catch (error) {
    console.log('Error executing getActivityById within activities.js');
    throw error;
  }


}

async function updateRoutineActivity({ id, count, duration }) {

  // console.log('id is:', id)
  // console.log('count is:', count)
  // console.log('duration is:', duration)

  try {
    const { rows: [routine_activity] } = await client.query(`
    UPDATE routine_activities
    SET 
      count=$2, 
      duration=$3
    WHERE id=$1
    RETURNING *;
    `, [id, count, duration]);

    // console.log('returning activity is', routine_activity);
    return routine_activity;

  } catch (error) {
    console.log('Error updating routine_activity with ID:', id);
    throw error;
  }
}

async function destroyRoutineActivity(id) {
  console.log('id is:', id);

  try {
    const { rows: [deletedRoutine] } = await client.query(`
    DELETE FROM routine_activities
    WHERE id=$1
    RETURNING *;
    
  `, [id]);

    console.log('deletedRoutine is:', deletedRoutine);
    return deletedRoutine;

  } catch (error) {
    console.log('Error removing the RoutineActivity for given ID:', id);
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
    console.log('Error executing getRoutineById within routines.js');
    throw error;
  }
}

async function canEditRoutineActivity(routineActivityId, userId) {
  console.log(`routActID = ${routineActivityId} and userID = ${userId}`);

  let routineActivity = await getRoutineActivityById(routineActivityId);

  let routine = await getRoutineById(routineActivity.routineId);

  console.log(`creatorID =  ${routine.creatorId}`);

  if (routine.creatorId === userId) {
    return true;
  }
}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};
