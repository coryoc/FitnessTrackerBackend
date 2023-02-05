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

async function getRoutineActivitiesByRoutine({ id }) { }

async function updateRoutineActivity({ id, ...fields }) {
  

  const setString = Object.keys(fields).map(
    (key, index) => `${key}=$${index + 1}`
  ).join(`, `);

  if (setString.length === 0) {
    return;
  }


  try {
  const { rows: [routine_activity] } = await client.query(`
    UPDATE routine_activities("routineId", "activityId", count, duration)
    SET count=$2
    SET duration=$3
   WHERE id=$1;
    `, Object.values(fields));

  return routine_activity;

} catch (error) {
  console.log('Error updating routine_activity with ID:', id);
  throw error;
}}

async function destroyRoutineActivity(id) {
  try { 
    const {rows: [routine_activity]} = await client.query(`
    DELETE FROM routine_activities
    WHERE id=$1;
  `,[id]);

  } catch(error) {
    console.log('Error removing the RoutineActivity for given ID:' , id);
    throw error;
  }
  
}

async function canEditRoutineActivity(routineActivityId, userId) { 


    const routineActivity = await getRoutineActivityById(routineActivityId);


    if (!routineActivity) {
      throw Error("Routine Activity does not exist with that id");
    }

      if (userId != routines . creatorId) {
          throw Error("Only the original user is able to edit the routine activity");
      }

      else {
        await updateRoutineActivity(routineActivityId);
      }

    return ({"message": "Routine Activity successfully updated!"})



}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};
