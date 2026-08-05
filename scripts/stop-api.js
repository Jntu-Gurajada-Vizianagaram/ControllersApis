const { execSync } = require("child_process");

const port = process.env.PORT || "8888";

const run = (command) =>
  execSync(command, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();

const stopWindows = () => {
  const ids = run(
    `powershell -NoProfile -Command "$ids = Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique; if ($ids) { $ids -join ',' }"`
  );

  if (!ids) {
    console.log(`No API process is listening on port ${port}.`);
    return;
  }

  ids
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .forEach((id) => {
      run(`powershell -NoProfile -Command "Stop-Process -Id ${id} -Force"`);
      console.log(`Stopped API process ${id} on port ${port}.`);
    });
};

const stopUnix = () => {
  const ids = run(`sh -c "lsof -ti tcp:${port} -sTCP:LISTEN || true"`);

  if (!ids) {
    console.log(`No API process is listening on port ${port}.`);
    return;
  }

  ids
    .split(/\r?\n/)
    .map((id) => id.trim())
    .filter(Boolean)
    .forEach((id) => {
      run(`kill ${id}`);
      console.log(`Stopped API process ${id} on port ${port}.`);
    });
};

try {
  if (process.platform === "win32") {
    stopWindows();
  } else {
    stopUnix();
  }
} catch (error) {
  const message = error.stderr?.toString().trim() || error.message;
  console.error(`Unable to stop API on port ${port}: ${message}`);
  process.exit(1);
}
