const con = require('../apis/config')

const ensureColumn = (column, definition) => {
  con.query(`SHOW COLUMNS FROM admins_profile LIKE ?`, [column], (error, rows) => {
    if (error || rows.length) return;
    con.query(`ALTER TABLE admins_profile ADD COLUMN ${column} ${definition}`, (alterError) => {
      if (alterError) console.error(`Unable to add admins_profile.${column}:`, alterError.message);
    });
  });
};

exports.admin_profile_table = () => {
  try {
      const admin_tab = `CREATE TABLE IF NOT EXISTS admins_profile(
        id int AUTO_INCREMENT PRIMARY KEY,
        admin_id int NULL,
        name varchar(255) NOT NULL,
        username varchar(255) NOT NULL UNIQUE KEY,
        profile_type varchar(80) NOT NULL DEFAULT 'Administrator',
        designation varchar(255) NULL,
        department varchar(255) NOT NULL DEFAULT '',
        unit varchar(255) NULL,
        phone varchar(80) NULL,
        about text NULL,
        role varchar(255) NOT NULL,
        public_url varchar(500) NULL,
        visibility varchar(40) NOT NULL DEFAULT 'private',
        status varchar(40) NOT NULL DEFAULT 'active',
        created_at timestamp DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX admins_profile_admin_idx (admin_id));`;
      con.query(admin_tab, (error) => {
        if (error) return console.error('Admins profile table not created:', error.message);
        ensureColumn('admin_id', 'INT NULL');
        ensureColumn('profile_type', "VARCHAR(80) NOT NULL DEFAULT 'Administrator'");
        ensureColumn('designation', 'VARCHAR(255) NULL');
        ensureColumn('unit', 'VARCHAR(255) NULL');
        ensureColumn('phone', 'VARCHAR(80) NULL');
        ensureColumn('public_url', 'VARCHAR(500) NULL');
        ensureColumn('visibility', "VARCHAR(40) NOT NULL DEFAULT 'private'");
        ensureColumn('status', "VARCHAR(40) NOT NULL DEFAULT 'active'");
        ensureColumn('created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
        ensureColumn('updated_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
        con.query('ALTER TABLE admins_profile MODIFY about TEXT NULL', () => {});
        con.query("ALTER TABLE admins_profile MODIFY department VARCHAR(255) NOT NULL DEFAULT ''", () => {});
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
  
