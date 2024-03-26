const express = require("express");
const cors = require("cors");
const app = express();
require('dotenv').config()
//Routes Import
const schemas = require("./Schemas/AllSchemas");
const admins = require("./routes/admin_routes/AdminRoute");
const mailing = require("./routes/grievance_routes/GrievanceRoutes");
const updates = require("./routes/updates_routes/upates_api_routes");
const dmcupload = require("./routes/dmc_routes/upload_api_routes");
const affliatedColleges = require("./routes/affliated_colleges_routes/AffliatedCollegesRoutes");
const results = require("./routes/results_routes/ResultsRoutes");

//middle ware import
app.use(express.json());

const session = require("express-session");
const bodyparser = require("body-parser");
const cookieparser = require("cookie-parser");
const con = require("./apis/config");
app.use(express.json());
app.use(cors());
// app.use(cors({
//   origin :["http://localhost:3001"],
//   methods :["GET","POST"],
//   credentials : true,
// }))

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

//apis start
app.use("/media", express.static("./storage/notifications"));
app.use("/dmc", express.static("./storage/dmc"));
app.use("/api/admins", admins);
app.use("/api/mailing", mailing);
app.use("/api/updates", updates);
app.use("/api/dmcupload", dmcupload);
app.use("/api/affliated-colleges", affliatedColleges);
app.use("/api/results", results);
// app.use('/api/addhod',)
// const check = require('./apis/ApiKeyAuth')
// app.use('/checkip',check.checkip)

// const gen = require('./apis/admin_api/Generate_password')
// gen.generate_password()



// server listener
const port = 8888;
app.listen(port, () => {
  schemas.allSchemas();
  console.log(`Server ruinning at port no:${port}`);
});
