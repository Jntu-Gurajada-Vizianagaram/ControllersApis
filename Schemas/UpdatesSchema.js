const con =require('../apis/config')

exports.notification_updates_table = () => {
    try {
        const updates_sql =`CREATE TABLE IF NOT EXISTS notification_updates(
            id int AUTO_INCREMENT PRIMARY KEY,
            date varchar(150) NOT NULL ,
            title varchar(500) NOT NULL,
            file_path varchar(500) NOT NULL,
            external_text varchar(2083),
            external_link varchar(500),
            main_page varchar(50) NOT NULL,
            scrolling varchar(50) NOT NULL,
            department varchar(30) NOT NULL DEFAULT 'JNTUGV',
            update_type varchar(50) NOT NULL,
            is_static varchar(10) NOT NULL DEFAULT 'false',
            expiry_date varchar(150),
            revised_date varchar(150),
            update_status varchar(50) NOT NULL,
            submitted_by varchar(45) NOT NULL,
            admin_approval varchar(45) NOT NULL);`; 
         con.query(updates_sql,(err,result)=>{
        if(err){
            console.log(err)
            console.log("Notifications Table not Created")
        }else{
            const migrations = [
              {
                sql: `ALTER TABLE notification_updates ADD COLUMN department VARCHAR(30) NOT NULL DEFAULT 'JNTUGV' AFTER scrolling`,
                label: 'department',
              },
              {
                sql: `ALTER TABLE notification_updates ADD COLUMN is_static VARCHAR(10) NOT NULL DEFAULT 'false' AFTER update_type`,
                label: 'is_static',
              },
              {
                sql: `ALTER TABLE notification_updates ADD COLUMN expiry_date VARCHAR(150) NULL AFTER is_static`,
                label: 'expiry_date',
              },
              {
                sql: `ALTER TABLE notification_updates ADD COLUMN revised_date VARCHAR(150) NULL AFTER expiry_date`,
                label: 'revised_date',
              },
            ];

            migrations.forEach((migration) => {
              con.query(migration.sql, (alterErr) => {
                if (alterErr && alterErr.code !== 'ER_DUP_FIELDNAME') {
                  console.log(alterErr);
                  console.log(`Notifications ${migration.label} column not updated`);
                }
              });
            });
            // console.log(result)
        }
      });
    } catch (err) {
      console.log("Server Unreachable");
    }
  };
  
