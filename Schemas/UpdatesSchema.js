const con =require('../apis/config')

exports.notification_updates_table = () => {
    try {
        const updates_sql =`CREATE TABLE IF NOT EXISTS notification_updates(
            id int AUTO_INCREMENT PRIMARY KEY,
            date varchar(150) NOT NULL ,
            title varchar(500) NOT NULL,
            file_path varchar(500) NOT NULL,
            external_text varchar(45),
            external_link varchar(150),
            main_page varchar(50) NOT NULL,
            scrolling varchar(50) NOT NULL,
            update_type varchar(50) NOT NULL,
            update_status varchar(50) NOT NULL,
            submitted_by varchar(45) NOT NULL,
            admin_approval varchar(45) NOT NULL);`; 
         con.query(updates_sql,(err,result)=>{
        if(err){
            console.log(err)
            console.log("Notifications Table not Created")
        }else{
            // console.log(result)
        }
      });
    } catch (err) {
      console.log("Server Unreachable");
    }
  };
  