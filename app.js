const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbpath = path.join(__dirname, "cricketTeam.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    app.listen(3000, () => {
      console.log("server running");
    });
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
//get players details
app.get("/players/", async (request, response) => {
  const getPlayers = `SELECT player_id AS playerId,player_name AS playerName,
  jersey_number AS jerseyNumber,role FROM cricket_team;`;
  const playerArray = await db.all(getPlayers);
  response.send(playerArray);
});
//post player details
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayer = `INSERT INTO
    cricket_team (player_name,jersey_number,role)
    values('${playerName}',${jerseyNumber},'${role}');`;
  const dbResponse = await db.run(addPlayer);
  const playerId = dbResponse.lastID;
  response.send("Player Added to Team");
});
//get player by id
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `SELECT player_id AS playerId,player_name AS playerName,
  jersey_number AS jerseyNumber,role FROM cricket_team
  WHERE player_id=${playerId};`;
  const playerInfo = await db.get(getPlayerQuery);
  response.send(playerInfo);
});
// put player details
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  const updatePlayerDetailsQuery = `
  UPDATE cricket_team
  SET player_name='${playerName}',
  jersey_number=${jerseyNumber},
  role='${role}'
  WHERE player_id=${playerId}

  ;`;
  await db.run(updatePlayerDetailsQuery);
  response.send("Player Details Updated");
});
//delete a player
app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayer = `
    DELETE FROM cricket_team
    WHERE player_id=${playerId};`;
  await db.run(deletePlayer);
  response.send("Player Removed");
});
module.exports = app;
