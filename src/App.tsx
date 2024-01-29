import React, { useEffect, useState } from "react";
import "./App.css";
import { MatchSimple, Team } from "./TBATypes";
import axios from "axios";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";

const queryClient = new QueryClient();

const fetchData = async (eventKey: string): Promise<MatchSimple[]> => {
  const response = await axios.get(
    `https://www.thebluealliance.com/api/v3/event/${eventKey}/matches/simple`,
    {
      headers: {
        "X-TBA-Auth-Key":
          "1EhUOwczJi4vDUXza94fAo7s4UFrKgBrTJ6A3MTeYR0WrgzlyGR0Tzyl1TN2P6Tu",
      },
    }
  );
  return response.data;
};
const fetchTeams = async (eventKey: string): Promise<Team[]> => {
  const response = await axios.get(
    `https://www.thebluealliance.com/api/v3/event/${eventKey}/teams`,
    {
      headers: {
        "X-TBA-Auth-Key":
          "1EhUOwczJi4vDUXza94fAo7s4UFrKgBrTJ6A3MTeYR0WrgzlyGR0Tzyl1TN2P6Tu",
      },
    }
  );
  return response.data;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <App2 />
    </QueryClientProvider>
  );
}

function App2() {
  const [eventKey, setEventKey] = useState("2023mabos");
  const { data, isLoading, isError, refetch } = useQuery("matches", () =>
    fetchData(eventKey)
  );
  const {
    data: teamsData,
    isLoading: teamsIsLoading,
    isError: teamsIsError,
    refetch: teamsRefetch,
  } = useQuery("teams", () => fetchTeams(eventKey));

  const handleClick = async () => {
    refetch();
    teamsRefetch();
  };

  const [output, setOutput] = useState("loading...");

  const [teamInfo, setTeamInfo] = useState("loading...");

  useEffect(() => {
    if (data !== undefined) {
      setOutput(
        ["Comp Level,Match Number,R1,R2,R3,B1,B2,B3"]
          .concat(
            data
              .filter((m) => m.comp_level === "qm")
              .sort((m1, m2) => m1.match_number - m2.match_number)
              .map((m) =>
                [
                  m.comp_level,
                  m.match_number,
                  m.alliances.red.team_keys[0].slice(3),
                  m.alliances.red.team_keys[1].slice(3),
                  m.alliances.red.team_keys[2].slice(3),
                  m.alliances.blue.team_keys[0].slice(3),
                  m.alliances.blue.team_keys[1].slice(3),
                  m.alliances.blue.team_keys[2].slice(3),
                ].join(",")
              )
          )
          .join("\n")
      );
    }
  }, [data]);

  useEffect(() => {
    if (teamsData !== undefined) {
      setTeamInfo(
        ["Team Number,Team Name"]
          .concat(
            teamsData
              .sort((t1, t2) => t1.team_number - t2.team_number)
              .map((t) => [t.team_number, t.nickname].join(","))
          )
          .join("\n")
      );
    }
  }, [teamsData]);

  return (
    <div className="App">
      <label htmlFor="eventKey">Event Key</label>
      <input
        id="eventKey"
        value={eventKey}
        onChange={(e) => setEventKey(e.target.value)}
        type={"text"}
      />
      <button onClick={handleClick}>Generate</button>
      <br />
      <br />
      {isLoading && <div>Loading</div>}
      {isError && <div>Error fetching data</div>}
      <textarea cols={40} rows={55} value={teamInfo} /> <br />
      <textarea cols={40} rows={120} value={output} />
      <br />
    </div>
  );
}

export default App;
