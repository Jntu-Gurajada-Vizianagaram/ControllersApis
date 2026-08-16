const fs = require("fs");
const path = require("path");
const db = require("../apis/config");

const confirmDelete = process.argv.includes("--confirm");

const eventMatchers = [
  "emergingtechnologiesbyjntugv.netlify.app",
  "Vanda mataram",
  "NIELIT and CSC India",
  "Meeting with all Principals of Constituent and Affiliated Colleges",
  "Strengthening MSMEs",
  "First B. Pharm Students Induction Program-2025",
  "Annual Day & Sports",
];

const buildWhereClause = () =>
  eventMatchers
    .map(() => "(event_name LIKE ? OR description LIKE ?)")
    .join(" OR ");

const buildParams = () =>
  eventMatchers.flatMap((term) => [`%${term}%`, `%${term}%`]);

const safeRemoveEventFolder = (eventId) => {
  const storageRoot = path.resolve(__dirname, "../storage/dmc/events");
  const target = path.resolve(storageRoot, String(eventId));

  if (!target.startsWith(storageRoot + path.sep)) {
    console.warn(`Skipped unsafe storage path for event ${eventId}`);
    return;
  }

  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
  }
};

const query = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (error, results) => {
      if (error) reject(error);
      else resolve(results);
    });
  });

const run = async () => {
  const whereClause = buildWhereClause();
  const params = buildParams();
  const rows = await query(
    `SELECT id, event_name, uploaded_date, main_page, admin_approval FROM event_photos WHERE ${whereClause} ORDER BY id`,
    params,
  );

  console.log(`Matched ${rows.length} event album row(s).`);
  rows.forEach((row) => {
    console.log(
      `${row.id}\t${row.uploaded_date}\t${row.main_page}\t${row.admin_approval}\t${row.event_name}`,
    );
  });

  if (!confirmDelete) {
    console.log("Dry run only. Re-run with --confirm to delete these rows.");
    return;
  }

  if (!rows.length) {
    console.log("No rows to delete.");
    return;
  }

  await query(`DELETE FROM event_photos WHERE ${whereClause}`, params);
  rows.forEach((row) => safeRemoveEventFolder(row.id));

  const remaining = await query(
    `SELECT COUNT(*) AS count FROM event_photos WHERE ${whereClause}`,
    params,
  );
  console.log(`Deleted ${rows.length} row(s). Remaining matches: ${remaining[0].count}`);
};

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    db.end();
  });
