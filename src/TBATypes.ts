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

export interface Team {
  address: any;
  city: string;
  country: string;
  gmaps_place_id: any;
  gmaps_url: any;
  key: string;
  lat: any;
  lng: any;
  location_name: any;
  motto: any;
  name: string;
  nickname: string;
  postal_code?: string;
  rookie_year: number;
  school_name: string;
  state_prov: string;
  team_number: number;
  website?: string;
}
