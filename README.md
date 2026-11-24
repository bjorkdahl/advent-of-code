# Advent of Code

My [Advent of Code](https://adventofcode.com) solutions in TypeScript. One
[npm workspace](https://docs.npmjs.com/cli/using-npm/workspaces) per year, run
with [aocrunner](https://github.com/caderek/aocrunner) and
[Turborepo](https://turborepo.com). Both are installed once at the root.

| Year | Folder |
|------|--------|
| 2021 | [`2021/`](2021) |
| 2022 | [`2022/`](2022) |

## Setup

```sh
npm install
cp .env.example .env   # add your AoC session cookie as AOC_SESSION_KEY
```

## Usage

```sh
npm run day 2022 5     # solve/watch a day (fetches input, can submit answers)
npm run build          # build every year (cached by turbo)
npm run format         # prettier across every year
```

`npm run day` opens turbo's terminal UI. Press `i` to type into aocrunner's
prompt, for example `s` to send a solution.

## Adding a year

Just run it: `npm run day 2026 1` creates `2026/` (config, template, README,
workspace entry and a row in the table above) the first time, then starts day 1.
Commit the new folder afterwards.

Merged from the former `aoc2021` and `aoc2022` repos with full history.
