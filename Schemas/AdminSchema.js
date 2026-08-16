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
        con.query(
          `CREATE TABLE IF NOT EXISTS admin_password_reset_tokens(
            id INT AUTO_INCREMENT PRIMARY KEY,
            admin_id INT NOT NULL,
            token_hash VARCHAR(128) NOT NULL UNIQUE,
            expires_at DATETIME NOT NULL,
            used_at DATETIME NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX admin_password_reset_admin_idx (admin_id),
            CONSTRAINT admin_password_reset_admin_fk
              FOREIGN KEY (admin_id) REFERENCES admins(id)
              ON DELETE CASCADE
          );`,
          (tokenError) => {
            if (tokenError) console.error('Admin password reset table not created:', tokenError.message);
          },
        );
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
  
