# ⚽ Sub Planner

A single-file web app for planning and tracking soccer substitutions across a season. Built for 7-a-side, 40-minute games.

## Quickstart

Open `index.html` in any modern browser — no installation, no server, no dependencies. Everything runs in the browser and data is saved automatically to `localStorage`.

Hosted at [warrickhunter.github.io/sub-planner](https://warrickhunter.github.io/sub-planner/). 

---

## Features

### Squad management
- Add players individually or in bulk (one name per line)
- Remove players at any time; their season history is preserved until removed

### Substitution planning
- Select which players are available for each game
- Choose a formation and game duration
- Add extra sub windows beyond halftime (comma-separated minutes)
- Sub windows are auto-suggested based on player count:
  - **8 players** → `3, 6, 10, 13, 16, 23, 26, 30, 33, 36`
  - **9 players** → `5, 10, 15, 25, 30, 35`
  - **10 players** → `6, 13, 26, 33`
- Generate a plan instantly; regenerate as many times as you like before saving

### GK rotation
- GK only rotates at halftime — no mid-game GK changes
- The two players with the fewest GK minutes this season are automatically selected
- Season view shows the full GK queue ordered by fewest minutes, so you always know who's next

### Position group balancing
- Position groups: **GK**, **Back**, **Mid**, **Fwd**
- The algorithm balances position group time across the season — if a player spent most of last game as a Forward, they'll be prioritised for Back or Mid roles next game
- At halftime, all field positions are re-assigned from scratch to allow position group shuffling within the same game (a player can be a Back in the first half and a Forward in the second)
- Within-game position history is tracked and weighted heavily so the same player won't play the same group all game if it can be avoided

### Equal playing time
- The algorithm targets equal field time for all players across each game
- Re-entry is allowed — players can come off and come back on
- Bench players who have sat out longer are prioritised for the next slot

### Manual overrides
- In the **Schedule** view, click any cell to lock a specific player into that position for that time slot
- The rest of the plan automatically adjusts around the locked slots
- Locked cells are shown with a 🔒 indicator and an indigo ring
- An override counter banner shows how many locks are active, with a "Clear all" link
- Clicking **↻ Regenerate** clears all overrides and produces a fresh plan

### Views
After generating a plan, four views are available:

| View | Description |
|---|---|
| **Substitutions** | Chronological list of who goes on and off at each window |
| **Schedule** | Grid of positions × time periods showing every assignment |
| **Timeline** | Horizontal bar chart per player showing on/bench/position across the game |
| **Minutes** | Table of total and per-group minutes for each player |

### Season tracking
- Save a completed game to accumulate season history
- Season tab shows total minutes, GK minutes, and Back/Mid/Fwd minutes per player across all games
- Undo the last saved game if needed
- Past games list shows formation and GK assignments at a glance

### Print view
Click the 🖨 button (or Ctrl/Cmd+P) after generating a plan to print a clean one-page summary containing:
- GK assignments for each half
- Full substitution list (halftime shows the complete new lineup rather than individual swaps)
- Schedule grid
- Timeline (kept on a single page — page breaks before it if needed)

The printed page strips all navigation, settings, background colours, and UI chrome.

---

## Formations

All formations are 7-a-side (6 outfield + GK):

| Formation | Positions |
|---|---|
| 2-3-1 | GK, LB, RB, LM, CM, RM, ST |
| 3-2-1 | GK, CB1, CB2, CB3, CM1, CM2, ST |
| 2-2-2 | GK, LB, RB, CM1, CM2, LW, RW |
| 1-3-2 | GK, CB, LM, CM, RM, ST1, ST2 |
| 3-1-2 | GK, CB1, CB2, CB3, CM, ST1, ST2 |

---

## Algorithm notes

- **Carry-forward** — at regular sub windows, players stay in their current position unless substituted. Only the position being subbed changes.
- **Halftime reshuffle** — all field positions are re-assigned from scratch at halftime, allowing position group rotation without substitutions.
- **Scoring** — each candidate player is scored on: slots remaining to target (field time balance) · season group minutes (position balance) · in-game group slots × 8 (strong within-game position balance). A small random tiebreaker prevents repetitive plans.
- **Sub threshold** — a bench player must outscore the current occupant by 30+ points to trigger a substitution, preventing unnecessary churn.
- **GK normalisation** — when a GK returns to the field at halftime, their slot count is set to the average of other outfield players so they don't dominate second-half field time.

---

## Data persistence

All data (squad, season history, past games, selected formation) is saved to `localStorage` automatically. Data lives in the browser — each device/browser has its own independent copy. Clearing browser storage will erase the data.