// npm run day <year> <day>  →  turbo run day --filter=<year> -- <day>
import { spawnSync } from "node:child_process"

const [year, day] = process.argv.slice(2)
if (!/^\d{4}$/.test(year ?? "") || !/^\d{1,2}$/.test(day ?? "")) {
  console.error("Usage: npm run day <year> <day>   e.g. npm run day 2022 5")
  process.exit(1)
}

const { status } = spawnSync(
  "npx",
  ["turbo", "run", "day", `--filter=${year}`, "--", day],
  { stdio: "inherit" },
)
process.exit(status ?? 1)
