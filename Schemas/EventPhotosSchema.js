const con =require('../apis/config')

exports.event_photos_table = () => {
    try {
        const upload_sql =`CREATE TABLE IF NOT EXISTS event_photos(
            id int AUTO_INCREMENT PRIMARY KEY,
            uploaded_date varchar(150) NOT NULL,
            event_name varchar(250) NOT NULL,
            folderpath varchar(200) NOT NULL,
            description varchar(500) NOT NULL,
            added_by varchar(100) NOT NULL,
            admin_approval varchar(50) NOT NULL,
            main_page varchar(20) NOT NULL)`;
         con.query(upload_sql,(err,result)=>{
        if(err){
            console.log(err)
            console.log("Event Photos Table not Created")
        }else{
            // console.log(result)
        }
      });
    } catch (err) {
      console.log(err + "Server Unreachable");
    }
  };
  