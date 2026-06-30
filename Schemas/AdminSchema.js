const con =require('../apis/config')
exports.admin_table = () => {
  try {
      const admin_tab =`CREATE TABLE IF NOT EXISTS admins(
        id int AUTO_INCREMENT PRIMARY KEY,
        name varchar(255) NOT NULL,
        username varchar(255) NOT NULL UNIQUE KEY,
        password varchar(255) NOT NULL,
        role varchar(255) NOT NULL,
        google_sub varchar(255) NULL UNIQUE KEY);`;
      con.query(admin_tab, (error) => {
        if (error) return console.error('Admins table not created:', error.message);
        con.query("SHOW COLUMNS FROM admins LIKE 'google_sub'", (columnError, columns) => {
          if (!columnError && columns.length === 0) {
            con.query('ALTER TABLE admins ADD COLUMN google_sub VARCHAR(255) NULL UNIQUE KEY');
          }
        });
      });
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
  
