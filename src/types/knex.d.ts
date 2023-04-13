import knex from 'knex';

declare module 'knex/types/tables' {
  export interface Tables {
    teams: {
      id: string;
      name: string;
      logo: string;
      created_at: string;
    };
    matches: {
      id: string;
      team_home: string;
      team_away: string;
      date: string;
      time: string;
      championship: string;
      tv: string[];
      created_at: string;
    };
  }
}
