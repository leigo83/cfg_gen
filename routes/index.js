var express = require('express');
var fs = require('fs');
var router = express.Router();
var app = express();
var path = require('path')
const port = 3000;
var hbs = require('express-handlebars');
const multer = require('multer');
const upload = multer({
  dest: 'uploads/', // this saves your file into a directory called "uploads"
});

app.engine('hbs', hbs.engine({defaultLayout: null, extname: '.hbs'}));
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', '.hbs');

/* GET home page. */
/*app.get('/', function(req, res, next) {
  console.log(__dirname)
  res.render('index.hbs', { title: 'Express' });
  //res.send("Express example");
});

app.listen(process.env.PORT || port, ()=> console.log("example"));*/

var cfgDataOrigin = [];
var cfgData = [];

var listpath = '/Users/leigo/fbsource/fbcode/infra_asic_fpga/ip/xcoder2_0/main/sam/cmodel/src/apps/av1e/cfg_gen/cfgList.json'; //'/../cfgList.json'
var csvpath = '/../cfgList.csv'

/* GET home page. */
var rawdata;
app.get('/', function(req, res, next) {
  /*if (cfgDataOrigin.length == 0) {
     rawdata = fs.readFileSync(listpath);
     if (rawdata != null) cfgData = JSON.parse(rawdata);
     cfgDataOrigin = cfgData;
  }*/
  res.render('load', { title: 'Cfg List',
                        cfgData: cfgData});
});

app.post('/', upload.single('file-to-upload'), (req, res) => {
   data = fs.readFileSync(__dirname + "/../" + JSON.stringify(req.file.path).replace(/["]+/g, '')) + '';
   console.log(__dirname + "/../" + JSON.stringify(req.file.path).replace(/["]+/g, ''));
   console.log(data)
});

app.listen(process.env.PORT || port, ()=> console.log("example"));

module.exports = router;
