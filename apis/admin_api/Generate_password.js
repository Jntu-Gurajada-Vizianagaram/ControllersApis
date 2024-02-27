const ApiKeyAuthentication = require('../ApiKeyAuth')
const url = require('url');
const dns = require('dns');

exports.generate_password=(req,res)=>{
    try{
        const apikey = req.url

        if(ApiKeyAuthentication.checkip("/")){
            let password = ""
            const string = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPLKJHGFDSAZXCVBNM1234567098"
            var i =0;
            for(i;i<=7;i++){
                password = password+string.charAt(Math.floor(Math.random()*62))
            }
        res.json({verification:"API Key Validated",pwd:password})
        console.log(password)
        }
        else{
            
            console.log("Inavlid Key generate password")
            res.json({verification:"Inavlid API Key "})
            
        }
        
    } 
    catch(error){
        console.log(error)
        res.status(400).json({verification :error})

    }
}





