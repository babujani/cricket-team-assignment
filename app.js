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
app.get("/players/", async (request, response) => {
  const getPlayers = `SELECT * FROM cricket_team;`;
  const playerArray = await db.all(getPlayers);
  response.send(playerArray);
});
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayer = `INSERT INTO
    cricket_team (player_name,jersey_number,role)
    values(${playerName},${jerseyNumber},${role});`;
  const dbResponse = await db.run(addPlayer);
  const playerId = dbResponse.lastID;
  response.send({ playerId: playerId });
});
