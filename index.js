const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const path = require('path');
const cors = require("cors");
require('dotenv').config()


//parse application json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

//routes
var routesUser = require("./routes/user");
routesUser(app);

// app.use('/images/logo', express.static(path.join(__dirname, 'images/logo')));
// app.use('/images/ktp', express.static(path.join(__dirname, 'images/ktp')));
// app.use('/images/legality-letter', express.static(path.join(__dirname, 'images/legality-letter')));
// app.use('/images/event', express.static(path.join(__dirname, 'images/event')));
// app.use('/images/site-plan', express.static(path.join(__dirname, 'images/site-plan')));

app.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`);  
});
