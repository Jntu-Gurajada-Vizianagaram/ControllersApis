const fs = require('fs')
const path = require('path')
const ipadd = process.env.domainIp

exports.Allstoredfiles=(req,res)=>{
    const folderpath = path.join(`./storage/notifications`);
    fs.readdir(folderpath,(err,files)=>{
        if(err){
            console.log(err)
            res.status(500).json({
                error:err,
                msg:" Result Files Not Fetched"
            })
        }
        else{
            const filesnames = files.filter((file)=>{
                const filepath = path.join(folderpath,file);
                const stats = fs.statSync(filepath)
                return stats.isFile();
            })
            
            const filesOnly = filesnames.map((filename)=>{
                const filelink = `${ipadd}/media/${filename}` 
                return {filename,filelink}

            })
            
            res.json({ files: filesOnly });
        }
    })
}