const con =require('../apis/config')
exports.admin_profile_table = () => {
  try {
      const admin_tab =`CREATE TABLE IF NOT EXISTS admins_profile(
        id int AUTO_INCREMENT PRIMARY KEY,
        name varchar(255) NOT NULL,
        username varchar(255) NOT NULL UNIQUE KEY,
        department varchar(255) NOT NULL,
        about varchar(255) NOT NULL,
        role varchar(255) NOT NULL);`;
      con.query(admin_tab);
    } catch (err) {
      console.log(err + "Admins Table not Created",
      (err,result)=>{
        if(err){
            console.log(err)
        }else{
            // console.log(result)
        }
      });
    }
  };
  
