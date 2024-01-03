const con =require('../apis/config')

exports.affiliated_colleges_table = () => {
    try {
        const aff_clgs_sql =`CREATE TABLE IF NOT EXISTS affiliated_colleges(
            id int AUTO_INCREMENT PRIMARY KEY,
            logo varchar(500) NOT NULL,
            college_name varchar(255) NOT NULL,
            college_address varchar(255) NOT NULL,
            college_link varchar(255) NOT NULL);`;
         con.query(aff_clgs_sql,(err,result)=>{
        if(err){
            console.log(err)
            console.log("Affiliated Colleges Table not Created")
        }else{
            // console.log(result)
        }
      });
    } catch (err) {
      console.log(err + "Server Unreachable");
    }
  };
  