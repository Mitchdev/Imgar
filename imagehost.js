var express = require("express");
var multer = require("multer");
var fs = require("fs");
var path = require("path");
var crypto = require("crypto");
var mime = require("mime");
var auth = require("http-auth");

var basic = auth.basic({
  realm: "Upload",
  file: __dirname + "/user.htpasswd"
});

var storage = multer.diskStorage({
  destination: "./static/images",
  filename: function(req, file, cb) {
    crypto.randomBytes(16, function(err, raw){
      if (err) return cb(err);

      cb(null, raw.toString('hex') + "." + mime.extension(file.mimetype));
    })
  }
});

var fileFilter = function(req, file, cb) {
  if (file.mimetype == "image/png" || file.mimetype == "image/jpeg" || file.mimetype == "image/gif") {
    cb(null, true);
  } else {
    cb(null, false);
    console.log("file isn't image");
  }
}

var app = express();
app.use(express.static('static'))
var upload = multer({ storage: storage, fileFilter: fileFilter });

app.get("/", function(req, res){
  res.send("HELLO WORLD!");
});

app.post("/upload", upload.single('fileToUpload'), auth.connect(basic), function(req, res){
  var filename = req.file.filename;
  res.redirect("/images/" + filename);
});

app.get("/upload", auth.connect(basic), function(req, res){
  res.sendFile(path.join(__dirname + "/upload.html"));
});

app.delete("/:filename", auth.connect(basic), function(req, res){
  fs.unlink("./static/images/" + req.params.filename, function(err){
    if (err) {
      res.sendStatus(500);
      console.log(err);
    } else {
      res.status(200).send("file deleted!");
    }
  });
});

app.listen(8080, function(){
  console.log("app running!");
});
