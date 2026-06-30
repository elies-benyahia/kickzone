const pool = require('../config/db');

const getPronostics = async (userId = null) => {
  const base = `SELECT p.id, p.fixture_id AS fixtureId,
            p.home_team AS homeTeam, p.away_team AS awayTeam,
            p.home_team_id AS homeTeamId, p.away_team_id AS awayTeamId,
            p.prediction, p.score_home AS scoreHome, p.score_away AS scoreAway,
            p.result, p.confidence,
            p.league, p.match_date AS matchDate,
            p.user_id AS userId, p.created_at AS createdAt,
            u.email AS userEmail, u.username AS username
     FROM pronostics p
     JOIN users u ON p.user_id = u.id`;
  const [rows] = userId
    ? await pool.execute(`${base} WHERE p.user_id = ? ORDER BY p.match_date DESC`, [Number(userId)])
    : await pool.execute(`${base} ORDER BY p.match_date DESC`);
  return rows;
};

const createPronostic = async ({
  fixtureId, homeTeam, awayTeam, homeTeamId, awayTeamId,
  prediction, scoreHome, scoreAway, confidence, league, matchDate, userId
}) => {
  const [result] = await pool.execute(
    `INSERT INTO pronostics
       (fixture_id, home_team, away_team, home_team_id, away_team_id,
        prediction, score_home, score_away, confidence, league, match_date, user_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      fixtureId   ? Number(fixtureId)   : null,
      homeTeam,
      awayTeam,
      homeTeamId  ? Number(homeTeamId)  : null,
      awayTeamId  ? Number(awayTeamId)  : null,
      prediction,
      scoreHome !== undefined && scoreHome !== null ? Number(scoreHome) : null,
      scoreAway !== undefined && scoreAway !== null ? Number(scoreAway) : null,
      Number(confidence) || 50,
      league ?? null,
      new Date(matchDate),
      Number(userId),
    ]
  );
  return { id: result.insertId, fixtureId, homeTeam, awayTeam, prediction, scoreHome, scoreAway, confidence, league, matchDate };
};

const updatePronostic = async (id, { prediction, confidence, result }) => {
  await pool.execute(
    'UPDATE pronostics SET prediction=?, confidence=?, result=? WHERE id=?',
    [prediction, Number(confidence), result, Number(id)]
  );
  return { id: Number(id), prediction, confidence, result };
};

const deletePronostic = async (id) => {
  await pool.execute('DELETE FROM pronostics WHERE id = ?', [Number(id)]);
  return { success: true };
};

const getStats = async () => {
  const [[stats]] = await pool.execute(
    `SELECT
       COUNT(*) AS total,
       SUM(result = 'CORRECT')    AS correct,
       SUM(result = 'RATE')       AS rate,
       SUM(result = 'EN_ATTENTE') AS en_attente,
       ROUND(
         SUM(result = 'CORRECT')
         / NULLIF(SUM(result != 'EN_ATTENTE'), 0)
         * 100, 1
       ) AS taux_reussite
     FROM pronostics`
  );
  return stats;
};

module.exports = { getPronostics, createPronostic, updatePronostic, deletePronostic, getStats };
