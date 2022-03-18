const express = require('express')

const fs = require('fs')
const util = require('util')
const unlinkFile = util.promisify(fs.unlink)
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const port = process.env.PORT || 8000;

mongoose.connect("mongodb");
const Schema = mongoose.Schema;

const serialSchema = new Schema({
    title : { type: String },
    description : { type: String },
    key: { type: String },
    hashtag : { type: String },
}, { timestamps: true });

// const db = mongoose.model('serials', serialSchema);
const db = mongoose.model("Images", serialSchema, "images", {});

db.on("error", console.log.bind(console, "connection error"));
db.once("open", function(callback) {
    console.log("connection succeeded");
});



const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

const { uploadFile, getFileStream } = require('./s3')

const app = express()
app.use(bodyParser.urlencoded({ extended: false }));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.set("view engine", "ejs");
app.set("views", "views");

app.get("/", (req, res) =>{
  res.render("login", {
    path:"/login",
    err:0
  })
  
})

app.get("/home", (req, res) =>{
  res.render("home", {
    path:"/home"
  })
  
})
app.get("/memories", (req, res) =>{
  
  db.find().sort({createdAt: "descending"}).then(result =>{
    res.render("fav", {
      path:"/home",
      images:result
    })
  })
    
})

app.get("/login", (req, res,next) =>{
  console.log("login");
})
app.post("/login", (req, res) =>{
  // res.render("login", {
  //   path:"/login",
  // })
  const email = req.body.email;
  const password = req.body.password;
  console.log(email + password);
  if(valid)
  {
     res.redirect("/home")
  }
  else
  {
    res.render("login", {
      path:"/login",
      err:1
    })
  }
  
})

app.get('/images/:key', (req, res,next) => {
  
  const key = req.params.key
  
  const readstream = getFileStream(key);
  readstream.on('data', (chunk) => {
    res.render('home1', { image: chunk.toString('base64') });
  })
  // readstream.pipe(res);
  
})

app.post('/images', upload.single('image'), async (req, res,next) => {
  const file = req.file;


  // apply filter
  // resize 

  const result = await uploadFile(file)
  await unlinkFile(file.path)
  console.log(result)
  const key = result.Key;
  const title = req.body.title;
  const description = req.body.description;
  const hashtag = req.body.hashtag;
console.log(hashtag)
  const data = {
    title: title,
    description: description,
    key: key,
    hashtag: hashtag
  }
  db.create(data)
        .then((result) => {
            console.log("Inserted successfully");
            res.redirect('/memories')
        })
        .catch((err) => {
            console.log(err);
        });
  
  
  // res.redirect(`/images/${result.Key}`)
  
})

app.listen(port, () => console.log("listening on port 8000"))
