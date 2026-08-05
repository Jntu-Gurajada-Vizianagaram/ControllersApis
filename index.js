const express = require("express");
const cors = require("cors");
const path = require('path');
const crypto = require('crypto');
const app = express();
app.disable('x-powered-by');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Routes Import
const schemas = require("./Schemas/AllSchemas");
const admins = require("./routes/admin_routes/AdminRoute");
const mailing = require("./routes/grievance_routes/GrievanceRoutes");
const updates = require("./routes/updates_routes/updates_api_routes");
const dmcupload = require("./routes/dmc_routes/upload_api_routes");
const affliatedColleges = require("./routes/affliated_colleges_routes/AffliatedCollegesRoutes");
const results = require("./routes/results_routes/ResultsRoutes");
const gallery = require("./routes/gallery_routes/gallery_routes");
const directors = require('./routes/directors_routes/DirectorsRoutes');
const siteContent = require('./routes/site_routes/SiteContentRoutes');
const pressNotes = require('./routes/press_notes_routes/PressNotesRoutes');
const websiteRoutes = require('./routes/website_routes/WebsiteRoutes');

// Middleware Imports
const session = require("express-session");
const passport = require('passport');
const bodyparser = require("body-parser");
const cookieparser = require("cookie-parser");
const con = require("./apis/config");
const MySQLSessionStore = require('./middleware/MySQLSessionStore');

const adminRoutes = require("./routes/adminRoutes");
const webadminRoutes = require("./routes/webadminRoutes");
const developerRoutes = require("./routes/developerRoutes");


if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET is required in production');
}
const sessionSecret = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const sessionStore = new MySQLSessionStore(con);

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed domains and subdomains
    const configuredOrigins = (process.env.CORS_ORIGINS || '')
      .split(',')
      .map(value => value.trim())
      .filter(Boolean);
    const allowedOrigins = new Set([
      'https://jntugv.edu.in',
      'https://www.jntugv.edu.in',
      'https://admin.jntugv.edu.in',
      'https://jntugv.vercel.app',
      ...configuredOrigins,
    ]);
    
    // Check if the origin matches any of the allowed patterns
    const isAllowed = allowedOrigins.has(origin) || /^https?:\/\/localhost(:\d+)?$/.test(origin);
    
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
app.set('trust proxy', 1);
app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('Referrer-Policy', 'no-referrer');
  res.set('X-Frame-Options', 'DENY');
  next();
});

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(cookieparser());
app.use(bodyparser.urlencoded({ extended: true }));

app.use(
  session({
    key: "userId",
    name: 'jntugv.sid',
    secret: sessionSecret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60 * 60 * 24 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure in production
      sameSite: "lax"
    },
  }),
);

// Static Files Configuration
app.use("/media", express.static("./storage/notifications"));
app.use("/dmc", express.static("./storage/dmc"));
app.use("/events", express.static("./storage/dmc/events"));
app.use("/gallery/image", express.static("./storage/gallery"));
app.use("/press-notes", express.static("./storage/press_notes", { dotfiles: 'deny', index: false }));
app.use('/director-images', express.static('./storage/directors', { dotfiles: 'deny', index: false }));
const resultsDirectory = path.resolve(
  process.env.RESULTS_DIR || path.join(__dirname, '..', 'Controllers', 'public', 'Storage', 'Results')
);
app.use(passport.initialize());
app.use("/exam-files", express.static(resultsDirectory, { dotfiles: 'deny', index: false }));

// Route Handling
app.use("/api/admins", admins);
app.use("/api/mailing", mailing);
app.use("/api/updates", updates);
app.use("/api/webadmin", dmcupload);
app.use("/api/gallery", gallery);
app.use("/api/affliated-colleges", affliatedColleges);
app.use("/api/results", results);
app.use('/api/directors', directors);
app.use('/api/website', websiteRoutes);
app.use('/api/site', siteContent);
app.use('/api/press-notes', pressNotes);



app.use("/admin", adminRoutes);
app.use("/webadmin", webadminRoutes);
app.use("/developer", developerRoutes);

app.get('/', (req, res) => {
  res.json('Hey JNTUGV Devops API Working Successfully');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS policy blocked this request' });
  }
  if (err.name === 'MulterError' || err.message === 'Unsupported file type' || err.message?.startsWith('Only ')) {
    return res.status(400).json({ error: err.message });
  }
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Server Listener
const port = process.env.PORT || 8888;
const initializeDatabase = async () => {
  await con.promise().query('SELECT 1');
  await sessionStore.initialize();
  schemas.allSchemas();
};

if (require.main === module) {
  initializeDatabase()
    .then(() => {
      app.listen(port, () => console.log(`Server running at port no:${port}`));
    })
    .catch((error) => {
      console.error(`Database startup failed: ${error.message}`);
      process.exitCode = 1;
    });
}

module.exports = app;
module.exports.initializeDatabase = initializeDatabase;
