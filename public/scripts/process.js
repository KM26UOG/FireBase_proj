async function loadMatches() {
  const response = await fetch("data/season-2526.csv");
  if (!response.ok) {
    throw new Error(`Could not load data: ${response.status}`);
  }
  const csvData = await response.text();
  const [header, ...rows] = csvData.trim().split(/\r?\n/);
  const columns = header.split(",").map((column) => column.trim());

  return rows
    .filter((row) => row.trim())
    .map((row) => {
      const values = row.split(",").map((value) => value.trim());
      const match = {};
      columns.forEach((column, index) => {
        match[column] = values[index];
      });
      return match;
    });
}

function displayMatches(matches, startDate, endDate) {
  console.log(
    "Displaying matches with startDate:",
    startDate,
    "and endDate:",
    endDate,
  );
  const matchesContainer = document.getElementById("matches-container");
  const matchesStatus = document.getElementById("matches-status");
  matchesContainer.innerHTML = "";

  if (startDate && endDate && startDate > endDate) {
    matchesStatus.textContent =
      "The start date must be on or before the end date.";
    return;
  }

  const filteredMatches = matches.filter(
    (match) =>
      (!startDate || match.Date >= startDate) &&
      (!endDate || match.Date <= endDate),
  );

  matchesStatus.textContent = filteredMatches.length
    ? `Showing ${filteredMatches.length} match${filteredMatches.length === 1 ? "" : "es"}.`
    : "No matches found for this date range.";

  filteredMatches.forEach((match) => {
    const matchElement = document.createElement("div");
    matchElement.classList.add("col-12", "col-md-4", "match");

    const title = document.createElement("h3");
    title.textContent = `${match.HomeTeam} vs ${match.AwayTeam}`;

    const date = document.createElement("p");
    date.textContent = `Date: ${match.Date}`;
    const referee = document.createElement("p");
    referee.textContent = `Referee: ${match.Referee}`;
    const score = document.createElement("p");
    score.textContent = `Score: ${match.FTHG} - ${match.FTAG}`;
    if (match.FTR === "H") {
      score.textContent += " (Home Win)";
      title.style.color = "green"; // Home win in green
    } else if (match.FTR === "A") {
      score.textContent += " (Away Win)";
      title.style.color = "red"; // Away win in red
    } else {
      score.textContent += " (Draw)";
      title.style.color = "blue"; // Draw in blue
    }

    matchElement.append(title, date, referee, score);
    matchesContainer.appendChild(matchElement);
  });
}

////////////////////////////
function teamSelector(matches) {
  const teamSelect = document.getElementById("team-select");
  const uniqueTeams = new Set();

  matches.forEach((match) => {
    uniqueTeams.add(match.HomeTeam);
  });
  const sortedTeams = Array.from(uniqueTeams).sort();

  // Populate the team selector
  sortedTeams.forEach((team) => {
    const option = document.createElement("option");
    option.value = team;
    option.textContent = team;
    teamSelect.appendChild(option);
  });
}

function refereeSelector(matches) {
  const refereeSelect = document.getElementById("ref-select");
  const uniqueReferees = new Set();

  matches.forEach((match) => {
    uniqueReferees.add(match.Referee);
  });
  const sortedReferees = Array.from(uniqueReferees).sort();

  // Populate the referee selector
  sortedReferees.forEach((referee) => {
    const option = document.createElement("option");
    option.value = referee;
    option.textContent = referee;
    refereeSelect.appendChild(option);
  });
}
function filterMatchesByTeam(matches, team, referee) {
  if (referee) {
    return matches.filter(
      (match) =>
        (match.HomeTeam === team || match.AwayTeam === team) &&
        match.Referee === referee,
    );
  }
  return matches.filter(
    (match) => match.HomeTeam === team || match.AwayTeam === team,
  );
}
function filterMatchesbyReferee(matches, referee, team) {
  if (team) {
    return matches.filter(
      (match) =>
        match.Referee === referee &&
        (match.HomeTeam === team || match.AwayTeam === team),
    );
  }
  return matches.filter((match) => match.Referee === referee);
}

function createPremTable(matches) {
  const uniqueTeams = new Set();

  matches.forEach((match) => {
    uniqueTeams.add(match.HomeTeam);
  });
}
async function init() {
  const startSeasonDate = "2025-08-09";
  const endSeasonDate = "2026-05-18";
  try {
    const matches = await loadMatches();
    const startDateInput = document.getElementById("start-date");
    const endDateInput = document.getElementById("end-date");
    const teamSelect = document.getElementById("team-select");
    const refereeSelect = document.getElementById("ref-select");

    const updateMatches = () =>
      displayMatches(matches, startDateInput.value, endDateInput.value);

    startDateInput.addEventListener("input", updateMatches);
    endDateInput.addEventListener("input", updateMatches);
    teamSelect.addEventListener("change", () => {
      displayMatches(
        filterMatchesByTeam(matches, teamSelect.value, refereeSelect.value),
        startSeasonDate,
        endSeasonDate,
      );
    });
    refereeSelect.addEventListener("change", () => {
      displayMatches(
        filterMatchesbyReferee(matches, refereeSelect.value, teamSelect.value),
        startSeasonDate,
        endSeasonDate,
      );
    });
    document.getElementById("clear-dates").addEventListener("click", () => {
      startDateInput.value = "";
      endDateInput.value = "";
      teamSelect.value = "";
      refereeSelect.value = "";
      updateMatches();
    });
    teamSelector(matches);
    refereeSelector(matches);
    createPremTable(matches);
  } catch (error) {
    console.error(error);
  }
}

document.addEventListener("DOMContentLoaded", init);
