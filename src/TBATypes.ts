export interface MatchSimple {
  actual_time: number;
  alliances: ColoredAlliances;
  comp_level: string;
  event_key: string;
  key: string;
  match_number: number;
  predicted_time: number;
  set_number: number;
  time: number;
  winning_alliance: string;
}

export interface ColoredAlliances {
  blue: Alliance;
  red: Alliance;
}

export interface Alliance {
  dq_team_keys: any[];
  score: number;
  surrogate_team_keys: any[];
  team_keys: string[];
}
