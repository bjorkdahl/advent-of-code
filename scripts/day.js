// npm run day <year> <day>
//
// Runs `aocrunner day <day>` in the <year> workspace through turbo. If the
// year doesn't exist yet it is scaffolded first, using aocrunner's own config
// generators so it matches what `aocrunner init` would create.
import { execSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const aocrunnerDir = path.join(root, "node_modules", "aocrunner");

const [year, day] = process.argv.slice(2);
const thisYear = new Date().getFullYear();

if (
  !/^\d{4}$/.test(year ?? "") ||
  Number(year) < 2015 ||
  Number(year) > thisYear ||
  !/^\d{1,2}$/.test(day ?? "") ||
  Number(day) < 1 ||
  Number(day) > 25
) {
  console.error(
    `Usage: npm run day <year> <day>   (year 2015-${thisYear}, day 1-25)\n` +
      "  e.g. npm run day 2022 5"
  );
  process.exit(1);
}

const yearDir = path.join(root, year);
if (!fs.existsSync(yearDir)) await scaffoldYear();

const { status } = spawnSync(
  "npx",
  ["turbo", "run", "day", `--filter=${year}`, "--", String(Number(day))],
  {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, TURBO_NO_UPDATE_NOTIFIER: "1" },
  }
);
process.exit(status ?? 1);

async function scaffoldYear() {
  console.log(`\n🎄 No ${year}/ yet, creating it...\n`);

  const config = (name) =>
    import(path.join(aocrunnerDir, "lib", "configs", `${name}.js`)).then(
      (m) => m.default
    );
  const save = (file, content) =>
    fs.writeFileSync(
      path.join(yearDir, file),
      typeof content === "string"
        ? content
        : JSON.stringify(content, null, 2) + "\n"
    );

  const setup = { year: Number(year), language: "ts", packageManager: "npm" };
  const runner = (await config("runnerJSON"))(setup);

  fs.mkdirSync(path.join(yearDir, "src"), { recursive: true });
  save("package.json", {
    name: year,
    private: true,
    description: `Advent of Code ${year} - solutions`,
    type: "module",
    scripts: {
      day: "node --env-file-if-exists=../.env ../node_modules/aocrunner/lib/cli.js day",
      build: "aocrunner build",
      format: "prettier -w src",
    },
  });
  save(".aocrunner.json", runner);
  save("tsconfig.json", (await config("tsconfigJSON"))(setup));
  save(".gitignore", (await config("gitignoreTXT"))(setup));
  save(".prettierrc.json", (await config("prettierJSON"))(setup));
  save(".prettierignore", (await config("prettierignoreTXT"))(setup));
  save(
    "README.md",
    (await config("readmeMD"))(
      setup,
      `npm run day ${year}`,
      "npm install",
      runner
    )
  );
  fs.cpSync(
    path.join(aocrunnerDir, "templates", "ts"),
    path.join(yearDir, "src"),
    {
      recursive: true,
    }
  );

  addToRootReadme();

  // Register the new workspace in the root lockfile so turbo can see it.
  execSync("npm install --no-fund --no-audit", { cwd: root, stdio: "inherit" });
  execSync("npx prettier --loglevel warn -w src", {
    cwd: yearDir,
    stdio: "inherit",
  });

  console.log(`\n✅ Created ${year}/. Don't forget to commit it.\n`);
}

function addToRootReadme() {
  const readmePath = path.join(root, "README.md");
  const readme = fs.readFileSync(readmePath, "utf8");
  const rows = [...readme.matchAll(/^\| (\d{4}) \| .*$/gm)];
  if (rows.length === 0) return;

  const row = `| ${year} | [\`${year}/\`](${year}) |`;
  const all = [...rows.map((m) => m[0]), row].sort();
  const first = rows[0].index;
  const last = rows.at(-1).index + rows.at(-1)[0].length;
  fs.writeFileSync(
    readmePath,
    readme.slice(0, first) + all.join("\n") + readme.slice(last)
  );
}
