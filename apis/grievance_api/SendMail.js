const { createTransporter, escapeHtml } = require('./mailer');

// const transporter = nodemailer.createTransport({
//     host:'smtp.ethereal.email',
//     port: 587,
//     auth:{
//         user:'kristina.smitham88@ethereal.email',
//         pass: process.env.SMTP_PASSWORD
//     },
// });

exports.send = (req,res)=>{
    try {
        
        const {rollno,email,name,phno,adhaarno,collegename,category,msg} = req.body;
        const attach =req.file ? {path:req.file.path} : null;

        const safe = Object.fromEntries(Object.entries({rollno,email,name,phno,adhaarno,collegename,category,msg}).map(([key, value]) => [key, escapeHtml(value)]));
        const body=`<!DOCTYPE html>
<html>
<head>
    <title>HTML Email Example</title>
</head>
<body>
    <h1>Hello, ${safe.name} </h1>
    <p>Thank You For Contacting JNTUGV GRIEVIANCE PORTAL </p>
    <p>Inconvinience is Deeply </p>

    <ul>
        <div>Name:${safe.name}</div>
        <div>Rollno:${safe.rollno}</div>
        <div>Email:${safe.email}</div>
        <div>Phone No:${safe.phno}</div>
        <div>Adhaar No:${safe.adhaarno}</div>
        <div>College Name:${safe.collegename}</div>
        <div>Category:${safe.category}</div>
        <div>Message:${safe.msg}</div>
        <div>File:${attach}</div>
        <h2><center>Your Grievance Recored Successfully</center></h2>
        <h3><center>Please use referenceid:<b>1234567</b> for more Deatails or Status</center></h3>
    </ul>
    <p>Please Go Through the Link for more information<a href="https://ucev.in">JNTU-GV</a> <a href="https://dsak.vercel.app">Dannana Sai Ajith Kumar</a></p>
</body>
</html>
`
        const mailoptions= {
            from:`JNTU-GV Grievance <${process.env.SMTP_USER}>`,
            to: process.env.GRIEVANCE_RECIPIENT,
            subject:'Grievance',
            text:` `,
            html:`${body}`,
            attachments: attach ? [attach] : []
        }

        if (!process.env.GRIEVANCE_RECIPIENT) {
            return res.status(500).json({ message: 'Grievance recipient is not configured' });
        }
        createTransporter().sendMail(mailoptions,(error,info)=>{
            if(error){
//console.log("Sending Error"+error)
                res.status(500).send('Email Sending Failed!')
            }
            else{
                //console.log("SENT"+info.response)
                res.json({success:true,data:{name,email,msg}})
            }
        })

        
    } catch (error) {
        console.log(error)
    }
}

exports.receive = (req,res)=>{
    try {
        res.send("im recieving")
    } catch (error) {
        console.log(error)
    }
}
