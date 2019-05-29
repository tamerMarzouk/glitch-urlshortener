'use strict';

var express = require('express');
var mongoose = require('mongoose');
var bodyParser=require('body-parser');
var cors = require('cors');
var isValid=require('./validateUrl');
const intEncoder=require('int-encoder');
intEncoder.alphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
var shortURLSchema;
var shortURL;
 shortURLSchema=new mongoose.Schema({id:{type:Number,required:true},enabled:{type:Boolean,required:true},url:{type:String,required:true}});

shortURLSchema.statics.getKey=function(callback){
  return this.findOne().sort({id:'desc'}).limit(1).exec(callback);
};
  shortURL=mongoose.model('ShortURL',shortURLSchema); 
mongoose.connect(process.env.MONGOLAB_URI,{ useNewUrlParser: true });
var db=mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
 
    console.log('db connection open!');
  
});





app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get("/api/shorturl/:key",(req,res)=>{
  let key=req.params.key;

  let id=getId(key)
  //get data from db
  shortURL.findOne({id:id},(err,data)=>{
    if (!err){
      res.redirect(data.url)
    }
    res.send('error:'+err)
  })
  
})
app.post("/api/shorturl/new",(req,res)=>{
  let url=req.body.url;
 //only save valid urls
  isValid(url).then(valid=>{
    
       let myshortUrl=new shortURL({id:0,enabled:true,url:url});
    shortURL.getKey((err,result)=>{
      //increment myshortUrl id
    let newId=1;
      if(!err &&result!=null){
      newId=result.id+1;  
      }
      
      myshortUrl.id=newId;
       myshortUrl.save().then(data=>{
           res.send({original_url:'',short_url:getKey(data.id)})
        });
    });
       
    
  }).catch(err=>{
    res.send({error:"invalid URL"});
  
  });
});
 

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});


//convert _id to url key
function getKey(id){
  
  return intEncoder.encode(id);
}
  function getId(key){
    return intEncoder.decode(key);
    }

