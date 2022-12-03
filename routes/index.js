var express = require('express');
var router = express.Router();
var app = express();
var path = require('path')
const port = 3000;
var hbs = require('express-handlebars');

app.engine('hbs', hbs.engine({defaultLayout: null, extname: '.hbs'}));
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', '.hbs');

/* GET home page. */
app.get('/', function(req, res, next) {
  console.log(__dirname)
  res.render('index.hbs', { title: 'Express' });
  //res.send("Express example");
});

app.listen(process.env.PORT || port, ()=> console.log("example"));

module.exports = router;
