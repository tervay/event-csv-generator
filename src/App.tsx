import React, { useEffect, useState } from "react";
import "./App.css";
import { MatchSimple, Team } from "./TBATypes";
import axios from "axios";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";

const queryClient = new QueryClient();

const fetchData = async (eventKey: string): Promise<MatchSimple[]> => {
  const response = await axios.get(
    `https://www.thebluealliance.com/api/v3/event/${eventKey}/matches`,
    {
      headers: {
        "X-TBA-Auth-Key":
          "1EhUOwczJi4vDUXza94fAo7s4UFrKgBrTJ6A3MTeYR0WrgzlyGR0Tzyl1TN2P6Tu",
      },
    },
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
    },
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

function flattenObject(obj: any, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value === null || value === undefined) {
      result[fullKey] = "";
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        result[fullKey] = "";
      } else if (typeof value[0] === "object" && value[0] !== null) {
        value.forEach((item, i) => {
          Object.assign(result, flattenObject(item, `${fullKey}.${i}`));
        });
      } else {
        result[fullKey] = value.join(";");
      }
    } else if (typeof value === "object") {
      Object.assign(result, flattenObject(value, fullKey));
    } else {
      result[fullKey] = String(value);
    }
  }
  return result;
}

function generateMatchDetailsCsv(matches: MatchSimple[]): string {
  const rows = matches.map((m) => ({
    key: m.key,
    ...flattenObject((m as any).score_breakdown ?? {}),
  }));
  const allKeys = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const csvRows = rows.map((row) =>
    allKeys
      .map((k) => {
        const val = (row as any)[k] ?? "";
        return String(val).includes(",") ? `"${val}"` : val;
      })
      .join(","),
  );
  return [allKeys.join(","), ...csvRows].join("\n");
}

function App2() {
  const [eventKey, setEventKey] = useState("2026marea");
  const { data, isLoading, isError, refetch } = useQuery("matches", () =>
    fetchData(eventKey),
  );
  const {
    data: teamsData,
    refetch: teamsRefetch,
  } = useQuery("teams", () => fetchTeams(eventKey));

  const handleClick = async () => {
    refetch();
    teamsRefetch();
  };

  const [output, setOutput] = useState("loading...");

  const [teamInfo, setTeamInfo] = useState("loading...");
  const [matchDetails, setMatchDetails] = useState("loading...");

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
                ].join(","),
              ),
          )
          .join("\n"),
      );

      const csv = generateMatchDetailsCsv(data);
      setMatchDetails(csv);
      console.log(csv);
    }
  }, [data]);

  useEffect(() => {
    if (teamsData !== undefined) {
      setTeamInfo(
        ["Team Number,Team Name"]
          .concat(
            teamsData
              .sort((t1, t2) => t1.team_number - t2.team_number)
              .map((t) => [t.team_number, t.nickname].join(",")),
          )
          .join("\n"),
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
      <textarea cols={40} rows={120} value={output} /> <br />
      <textarea cols={40} rows={120} value={matchDetails} />
      <br />
    </div>
  );
}

export default App;
