const dns = require('dns');
const url=require('url');


function isValid(urlStr){
  return new Promise((resolve,reject)=>{
  //parse url to get the host name
    let hostname=url.parse(urlStr).hostname;
    dns.lookup(hostname,(err,address,family)=>{
   
    if(err) reject(err)
    resolve(true)
  });  
  
})

  

}
module.exports=isValid