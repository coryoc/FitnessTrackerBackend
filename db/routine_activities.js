const client = require("./client");

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

  let routineId = id ;
  console.log(routineId);
  try {
    const { rows: [routine_activity] } = await client.query(`
      SELECT * FROM routine_activities
      WHERE id=$1;
    `, [ id ]);

    return routine_activity;

  } catch (error) {
    console.log('Error executing getActivityById within activities.js');
    throw error;
  }


}

async function updateRoutineActivity({ id, count, duration }) {
  




  try {
  const { rows: [routine_activity] } = await client.query(`
    UPDATE routine_activities
    SET count=$2, duration=$3
    WHERE id=$1;
    `,[id, count, duration]);

  return routine_activity;

} catch (error) {
  console.log('Error updating routine_activity with ID:', id);
  throw error;
}}

async function destroyRoutineActivity(id) {


  try { 
    const {rows: routine_activity } = await client.query(`
    DELETE FROM routine_activities
    WHERE id=$1;
  `,[id]);

  return id;

  } catch(error) {
    console.log('Error removing the RoutineActivity for given ID:' , id);
    throw error;
  }
  
}

async function canEditRoutineActivity(routineActivityId, userId) { 

}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};
