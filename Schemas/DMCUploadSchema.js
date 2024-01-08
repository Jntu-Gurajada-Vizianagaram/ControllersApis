const con =require('../apis/config')

exports.dmc_upload_table = () => {
    try {
        const upload_sql =`CREATE TABLE IF NOT EXISTS dmc_upload(
            id int AUTO_INCREMENT PRIMARY KEY,
            date varchar(150) NOT NULL,
            title varchar(500) NOT NULL,
            file_path varchar(500) NOT NULL,
            description varchar(500) NOT NULL,
            submitted varchar(100) NOT NULL,
            admin_approval varchar(100) NOT NULL,
            carousel_scrolling varchar(100) NOT NULL,
            gallery_scrolling varchar(50) NOT NULL);`;
         con.query(upload_sql,(err,result)=>{
        if(err){
            console.log(err)
            console.log("DMC Table not Created")
        }else{
            // console.log(result)
        }
      });
    } catch (err) {
      console.log(err + "Server Unreachable");
    }
  };
  