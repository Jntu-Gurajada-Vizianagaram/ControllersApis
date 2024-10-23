const express = require("express");
const cors = require("cors");
const app = express();
require('dotenv').config();


// Routes Import
const schemas = require("./Schemas/AllSchemas");
const admins = require("./routes/admin_routes/AdminRoute");
const mailing = require("./routes/grievance_routes/GrievanceRoutes");
const updates = require("./routes/updates_routes/updates_api_routes");
const dmcupload = require("./routes/dmc_routes/upload_api_routes");
const affliatedColleges = require("./routes/affliated_colleges_routes/AffliatedCollegesRoutes");
const results = require("./routes/results_routes/ResultsRoutes");
const gallery = require("./routes/gallery_routes/gallery_routes"); // Added Gallery Routes

// Middleware Imports
const session = require("express-session");
const bodyparser = require("body-parser");
const cookieparser = require("cookie-parser");
const con = require("./apis/config");

const alloweddomains = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://jntugv.edu.in",
  "https://admin.jntugv.edu.in",
];

// CORS Configuration
app.use(cors({
  origin: alloweddomains,
  methods: ["GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Handle preflight requests for DELETE and other methods
app.options('*', cors());

app.use(express.json());
app.use(cookieparser());
app.use(bodyparser.urlencoded({ extended: true }));

app.use(
  session({
    key: "userId",
    secret: "subscribe",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 60 * 60 * 24,
    },
  }),
);

// Static Files Configuration
app.use("/media", express.static("./storage/notifications"));
app.use("/dmc", express.static("./storage/dmc"));
app.use("/events", express.static("./storage/dmc/events"));
app.use("/gallery/image", express.static("./storage/gallery"));
app.use("/exam-files", express.static('./'));

// Route Handling
app.use("/api/admins", admins);
app.use("/api/mailing", mailing);
app.use("/api/updates", updates);
app.use("/api/webadmin", dmcupload);
app.use("/api/gallery", gallery); // Added Gallery Routes
app.use("/api/affliated-colleges", affliatedColleges);
app.use("/api/results", results);

app.get('/', (req, res) => {
  res.json('Hey JNTUGV Devops API Working Successfully');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Server Listener
const port = process.env.PORT || 8888;
app.listen(port, () => {
  schemas.allSchemas();
  console.log(`Server running at port no:${port}`);
});
