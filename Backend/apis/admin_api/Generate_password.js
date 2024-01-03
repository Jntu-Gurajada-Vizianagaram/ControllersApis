
exports.generate_password=(req,res)=>{
    try{
    const chars = [
        "A","a","B","b","C","c","D","d","1","2","3","4","5","6","7","8","9","0","!","@","#","$","&",
        "E","e","F","f","G","g","H","h","I","i","J","j","K","k","L","l","M",
        "m","N","n","O","o","P","p","Q","q","R","r","S","s","T","t","U","u","V","v","W","w","X","x","Y","y","Z","z"
        ]
        var password = "";
        var i =0;
        for(i;i<=7;i++){
            password= password+chars[Math.floor(Math.random()*62)]
        }
        res.json({pwd:password})
        // console.log(password)
    }
    catch(error){
        console.log(error) 
    }
        
}