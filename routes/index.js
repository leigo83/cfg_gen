var express = require('express');
var router = express.Router();
var app = express();
const port = 3000;
/* GET home page. */
app.get('/', function(req, res, next) {
  //res.render('index', { title: 'Express' });
  res.send("Express example");
});

app.listen(process.env.PORT || port, ()=> console.log("example"));

module.exports = router;
