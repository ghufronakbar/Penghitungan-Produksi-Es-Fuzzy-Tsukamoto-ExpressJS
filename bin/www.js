const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
require('dotenv').config()


//parse application json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

//routes
var routesUser = require("../routes/user");
routesUser(app);

app.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`);  
});
