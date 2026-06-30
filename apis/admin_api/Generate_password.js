const crypto = require('crypto');

exports.generate_password=(req,res)=>{
    try{
        const password = crypto.randomBytes(12).toString('base64url');
        res.json({ verification: 'Authenticated', pwd: password });
        
    } 
    catch(error){
        console.log(error)
        res.status(400).json({verification :error})

    }
}





