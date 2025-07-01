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
const gallery = require("./routes/gallery_routes/gallery_routes");

// Middleware Imports
const session = require("express-session");
const bodyparser = require("body-parser");
const cookieparser = require("cookie-parser");
const con = require("./apis/config");

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed domains and subdomains
    const allowedDomains = [
      /^https?:\/\/(.*\.)?jntugv\.edu\.in$/,
      /^https?:\/\/localhost(:\d+)?$/,
      /^https?:\/\/jntugv\.vercel\.app$/
    ];
    
    // Check if the origin matches any of the allowed patterns
    const isAllowed = allowedDomains.some(domain => domain.test(origin));
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(cookieparser());
app.use(bodyparser.urlencoded({ extended: true }));

app.use(
  session({
    key: "userId",
    secret: process.env.SESSION_SECRET || "subscribe", // Use environment variable for secret
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 60 * 60 * 24 * 1000, // Fixed: should be in milliseconds
      secure: process.env.NODE_ENV === "production", // Secure in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
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
app.use("/api/gallery", gallery);
app.use("/api/affliated-colleges", affliatedColleges);
app.use("/api/results", results);

app.get('/', (req, res) => {
  res.json('Hey JNTUGV Devops API Working Successfully');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS policy blocked this request' });
  }
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Server Listener
const port = process.env.PORT || 8888;
app.listen(port, () => {
  schemas.allSchemas();
  console.log(`Server running at port no:${port}`);
});