var express = require('express');
var fs = require('fs');
var router = express.Router();
var app = express();
var path = require('path')
const port = 3000;
var hbs = require('express-handlebars');
const multer = require('multer');
var bodyParser = require('body-parser')
const upload = multer({
  dest: 'uploads/', // this saves your file into a directory called "uploads"
});

var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.engine('hbs', hbs.engine({defaultLayout: null,
                              extname: '.hbs',
                              helpers: {
                                eq: function(a, b) {
                                  if (a == b) return true;
                                  else return false;
                                }}}));
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

var listpath = '/../cfgList.json';
var csvpath = '/../cfgList.csv';

/* GET home page. */
var rawdata;
app.get('/', function(req, res, next) {
  res.render('load');
});

app.post("/download", urlencodedParser, (req, res) => {
   console.log(req.body.output)
   fs.writeFile('test.txt', req.body.output, function (err) {
   if (err) return console.log(err);
   res.download(__dirname + "/../test.txt", "download_test.txt");
});
})

app.post("/view", upload.single('cfg-to-upload'), (req, res) => {
  let filepath = __dirname + "/../" + JSON.stringify(req.file.path).replace(/["]+/g, '');
  let filename = JSON.stringify(req.file.path);
  let data = fs.readFileSync(filepath, 'utf8');
  let outputList = {};
  console.log(data);
  lines = data.split("\n");
  outputList["cfgid"] = -1;
  outputList["cfgName"] = filename;
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].includes("=")) {
      data = lines[i].split("=");
      key = data[0].trim();
      data = data[1].trim();
      value = data.split("#");
      outputList[key] = value[0].trim();
    }
  }
  res.redirect("/view?id=-1&text=" + JSON.stringify(outputList));
})

app.post('/', upload.single('file-to-upload'), (req, res) => {
  let filepath = __dirname + "/../" + JSON.stringify(req.file.path).replace(/["]+/g, '');
   console.log(filepath)
   res.redirect("/cfgList?filepath=" + filepath);
});

app.get('/cfgList', function(req, res) {
  let filepath = req.query.filepath;
  if (cfgDataOrigin.length == 0) {
    rawdata = fs.readFileSync(filepath);
    if (rawdata != null) cfgData = JSON.stringify(rawdata);
    cfgDataOrigin = cfgData;
  }
  if (fs.existsSync(filepath)) {
    fs.unlink(filepath, function (err) {
      if (err) {
        console.error(err);
      } else {
        console.log("File removed:", filepath);
      }
    });
  }
 res.render('cfglist', { title: 'Cfg List',
                       cfgData: cfgData});
});

app.get('/save_list', function(req, res, next) {
  var json = JSON.stringify(cfgData);
  cfgDataOrigin = cfgData;
  fs.writeFileSync(__dirname + listpath, json);
  res.redirect("/status?value=1");
});

app.get('/restore', function(req, res, next) {
   cfgData = cfgDataOrigin;
   var json = JSON.stringify(cfgData);
   fs.writeFileSync(__dirname + listpath, json);
   res.redirect("/cfgList");
});

app.get('/save_list_to_csv', function(req, res, next) {
 obj = JSON.parse(rawdata);
 var csv = "";
 if (obj.length > 0) {
    fs.open(__dirname + csvpath, "w", function (fileerr, file) {
        if (fileerr) throw err;
        console.log('File is opened in write mode.');
    });
    for (var i = 0; i < obj.length; i++) {
        var keyrow = "";
        var valuerow = "";
        for (const [key, value] of Object.entries(obj[i])) {
              if (key == "cfgid") continue;
              keyrow = keyrow + key + ",";
              valuerow = valuerow + value + ",";
        }
        keyrow = keyrow + "\n";
        valuerow = valuerow + "\n";
        if (i == 0) csv = csv + keyrow;
        csv = csv + valuerow;
    }
 }
 // write CSV to a file
 fs.writeFileSync(__dirname + csvpath, csv);
 res.redirect('/status?value=2');
});

app.get('/status', function(req, res, next) {
 res.render('cfglist', { title: 'Cfg List',
                       message: req.query.value == 1 ? "successfully saved" :
                                (req.query.value == 2 ? "successfully saved " + __dirname + csvpath : "failed to save due to duplicated cfgName"),
                                cfgData: cfgData});
});

app.get('/view', function(req, res, next) {
 var outputList = {};
 if (req.query.id == -1) {
    var obj = JSON.parse(req.query.text);
    obj["cfgid"] = cfgData.length;
    res.render('cfgdetail', {cfgField: obj});
 } else {
    if (req.query.message == 100) {
       res.render('cfgdetail', {cfgField: cfgData[req.query.id], message: "cfg generated at " + req.query.location});
    } else {
       res.render('cfgdetail', {cfgField: cfgData[req.query.id]});
    }
 }
});

app.post("/save", function(req, res, next) {
 var id = req.body.cfgid;
 var i = 0;
 for (; i < cfgData.length; i++) {
    if (i == id) continue;
    if (cfgData[i]["cfgName"] == req.body.cfgName) {
       res.redirect('/status?value=0');
       break;
    }
 }
 if (i >= cfgData.length) {
    cfgData[id] = req.body;
    var json = JSON.stringify(cfgData);
    fs.writeFileSync(__dirname + listpath, json);
    res.redirect("/status?value=1");
 }
});

app.post("/genCfg", function(req, res, next) {
 try {
    var data = "";
    fs.open(__dirname + '/../../' + req.body.cfgName, "w", function (err, file) {
       if (err) throw err;
       console.log('File is opened in write mode.');
    });
    let obj = req.body;
    for (const [key, value] of Object.entries(obj)) {
       if (key == "cfgid" || key == "cfgName") continue;
       data = data + key + " = " + value + "\n";
    }
    fs.writeFileSync(__dirname + '/../../' + req.body.cfgName, data);
    res.redirect("/view?id="+req.body.cfgid + "&message=100" + "&location=" + __dirname + '/../../' + req.body.cfgName);
 } catch (err) {next(err);}
});

app.post("/delete", function(req, res, next) {
 var id = req.body.cfgid;
 var updatedcfgData = [];
 var index = 0;
 for (var i = 0; i < cfgData.length; i++) {
     if (cfgData[i].cfgid == id) continue;
     updatedcfgData.push(cfgData[i]);
     updatedcfgData[updatedcfgData.length - 1].cfgid = index;
     index++;
 }
 cfgData = updatedcfgData;
 var json = JSON.stringify(cfgData);
 fs.writeFileSync(__dirname + listpath, json);
 res.render('cfglist', {title: 'Cfg List',
                      cfgData: cfgData});
});

app.listen(process.env.PORT || port, ()=> console.log("example"));

module.exports = router;
