import { knex } from '../src/database';
import crypto from 'node:crypto';
import fs from 'fs';

// Save the data in the bd.
const matchesData = fs.readFileSync('assets/json/matches.json');
const matches = JSON.parse(matchesData.toString());

async function insertMatchesData() {
  for (const match of matches) {
    const matchData = {
      id: crypto.randomUUID(),
      team_home: match.team_home,
      team_home_logo: match.team_home_logo,
      team_away: match.team_away,
      team_away_logo: match.team_away_logo,
      date: match.date,
      time: match.time,
      championship: match.championship,
      championship_logo: match.championship_logo,
      location: match.location,
      description: match.description,
      tv: match.tv
    };

    try {
      await knex('matches').insert(matchData);
      console.log(
        `Partida ${match.team_home} x ${match.team_away} inserida com sucesso!`
      );
    } catch (err) {
      console.error(
        `Erro ao inserir a partida Partida ${match.team_home} x ${match.team_away}: ${err}`
      );
    }
  }
  process.exit(0);
}

insertMatchesData();
