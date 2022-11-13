var express = require('express');
var router = express.Router();
var app = express();
/* GET home page. */
app.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

app.listen(process.env.PORT || port, ()=> console.log("example"));

module.exports = router;
