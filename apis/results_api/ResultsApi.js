const fs = require('fs')
const path = require('path')

// const folderpath = path.join('D:', 'Work Shop', 'Project', 'login', 'src','Storage','Results','BTECH3-2','R20 PASS LIST');
// const folderpath = path.join('../../public/Storage/Results/BTECH3-2/r13 PASS lIST');
// const folderpath = path.join('apis/results_api/R13 PASS LIST');


exports.r13results=(req,res)=>{
    const regulation = req.params.reg
    const folderpath = path.join(`../../public/Storage/Results/BTECH3-2/${regulation}`);
    fs.readdir(folderpath,(err,files)=>{
        if(err){
            console.log(err)
            res.status(500).json({
                error:err,
                msg:" Result Files Not Fetched"
            })
        }
        else{
            const filesOnly = files.filter((file)=>{
                const filepath = path.join(folderpath,file);
                const stats = fs.statSync(filepath)
                return stats.isFile();
            }) 
            res.json({ files: filesOnly });
        }
    })
}

exports.results = (req,res)=>{
    res.json({Message: "Result Api Reached Successfully"})
}