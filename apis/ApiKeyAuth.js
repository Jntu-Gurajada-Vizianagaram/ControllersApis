const url = require('url');
const dns = require('dns');
const Apikeys = require('./ApiKeys.json')
// console.log(Apikeys)
exports.ApiKeyAuth=(Apikey)=>{
   return Apikeys.includes(Apikey)
}


// const gen = () =>{
//     string = "AQWERTYUIOPASDFGHJKLZXCVBNM"
    
//     var password = "";
//     var i =0;
//     for(i;i<=7;i++){
//         password = password+string.charAt(Math.floor(Math.random()*62))
//     }
//     console.log(password)
// }
// gen()
// console.log(ApiKeyAuth("notificationsforindividual"))
// ApiKeyAuth("notificationsforjntug");




// const bcrypt = require('bcrypt')
// const sr = 10;

// const key = "notificationsforjntugv"
// const salt = bcrypt.genSaltSync(sr)
// const apihashed = bcrypt.hashSync(key,sr)
// console.log(apihashed)

// if(bcrypt.compareSync("$2b$10$T2JkiCsOgolCJTICMBRG/u/6gOOmdy9CbL/Mrhay0JMifEAJiDjq.",bcrypt.hashSync(key,salt))){
//     console.log("done")
// }
// else{
//     console.log("flase")

// }



// const url = require('url');
// const dns = require('dns');


exports.checkip= (requestip) => {
   let link = requestip
   console.log(link)
   link == "/" ? link = "http://localhost" : link = link
   console.log(link) 
   const parsedUrl = url.parse(link); // Parse the URL
   const domain = parsedUrl.hostname; // Extract the domain from the parsed URL
   console.log(domain)

   // return Apikeys.includes(link)
   return Apikeys.includes(domain)

   // dns.lookup(domain, (err, address, family) => { // Use DNS module to look up IP address
   //     if (err) {
   //         console.error(err);
   //         res.status(500).json({ error: 'Failed to lookup IP address for the domain' });
   //         return false
   //     } else {
   //         res.json({ domain, ipAddress: address ,family});
   //         return true
   //     }
   // });

}

