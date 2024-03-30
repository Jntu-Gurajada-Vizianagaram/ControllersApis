const fs = require('fs')
const path = require('path')
const ipadd = process.env.domainIp

exports.exam_pdfs=(req,res)=>{
    const folderpath = path.join(`./`);
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
                const filelink = `${ipadd}/exam-files/${filename}` 
                return {filename,filelink}

            })
            
            res.json({ files: filesOnly });
        }
    })
}