import { knex } from '../src/database';
import crypto from 'node:crypto';
import fs from 'fs';

// Save the data in the bd.
const data = fs.readFileSync('assets/json/matches.json');
const teamsMatches = JSON.parse(data.toString());

// console.log(JSON.stringify(teamsMatches, null, 2));

async function insertTeamData() {
  // Insert the team data in table `teams`.s
  for (const teamMatch of teamsMatches) {
    const teamData = {
      id: crypto.randomUUID(),
      name: teamMatch.name,
      logo: teamMatch.logo
    };

    await knex('teams')
      .insert(teamData)
      .then(() => {
        console.log(`Time ${teamMatch.name} inserido com sucesso!`);
      })
      .catch(err => {
        console.error(`Erro ao inserir o time ${teamMatch.name}: ${err}`);
      });
  }
}

async function insertMatchesData() {
  for (const teamMatch of teamsMatches) {
    const { matches } = teamMatch;
    for (let i = 0; i < matches.length; i += 1) {
      const matchData = {
        id: crypto.randomUUID(),
        team_home: matches[i].team_home as string,
        team_away: matches[i].team_away as string,
        date: matches[i].date as string,
        time: matches[i].time as string,
        championship: matches[i].championship as string,
        tv: JSON.stringify(teamMatch.matches[i].tv) as unknown as string[]
      };

      try {
        await knex('matches').insert(matchData);
        console.log(`Partida do time ${teamMatch.name} inserida com sucesso!`);
      } catch (err) {
        console.error(
          `Erro ao inserir a partida do time ${teamMatch.name}: ${err}`
        );
      }
    }
  }
  process.exit(0);
}

insertTeamData();
insertMatchesData();
