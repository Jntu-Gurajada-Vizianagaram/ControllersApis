const nodemailer = require('nodemailer')
const multer = require('multer')
const transporter = nodemailer.createTransport({
    service:'Gmail',
    auth:{
        user:'studentgrievances@jntugv.edu.in',
        pass:"ruhb pwut omkg cvxo"
    },
});


exports.send_grievance = (req,res)=>{
    console.log("entered into MAILING")
    try {        
        const {rollno,email,name,phno,adhaarno,collegename,category,msg,date} = req.body;
        const attach =req.file ? {path:req.file.path} : null;

        const body=`<!DOCTYPE html>
<html>
<head>
    <title>HTML Email Example</title>
</head>
<body>
    <h1>Hello, ${name} </h1>
    <p>Thank You For Contacting JNTUGV GRIEVIANCE PORTAL </p>
    <p> </p>

    <ul>
        <div>Name:${name}</div>
        <div>Rollno:${rollno}</div>
        <div>Email:${email}</div>
        <div>Phone No:${phno}</div>
        <div>Adhaar No:${adhaarno}</div>
        <div>College Name:${collegename}</div>
        <div>Category:${category}</div>
        <div>Message:${msg}</div>
        <div>File:${attach}</div>
        <h2><center>Your Grievance Recored Successfully on${date} </center></h2>
        
    </ul>
    <p><center>Please Go Through the Link for more information<a href="https://ucev.in">JNTU-GV</a></center></p>
</body>
</html>
`
if(rollno == null || email ==null || name ==null || phno ==null || adhaarno ==null || collegename ==null || category ==null || msg ==null || date ==null){
    const required = {
        "rollno":"",
        "email":"",
        "name":"",
        "phno":"",
        "adhaarno":"",
        "collegename":"",
        "category":"",
        "msg":"",
        "date":""
    }
    res.json({Error:"All These Fields Required",required})
    
}else{
        const mailoptions= {
            from:`Student Grievance<studentgrievances@jntugv.edu.in>`,
            to:`${email}`,
            subject:'Student Grievance',
            text:` `,
            html:`${body}`,
            // attachments:[attach]
        }
    
        transporter.sendMail(mailoptions,(error,info)=>{
            if(error){
                console.log("Sending Error"+error)
                res.status(500).send('Email Sending Failed!')
            }
            else{
                console.log("SENT"+info.response)
                res.json({success:true,data:{name,email,msg}})
            }
        })
    }
    } catch (error) {
        console.log(error)
    }
}

exports.receive= (req,res)=>{
    try {
        res.send("im recieving")
    } catch (error) {
        console.log(error)
    }
}