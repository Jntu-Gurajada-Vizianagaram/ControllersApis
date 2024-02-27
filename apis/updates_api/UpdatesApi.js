const multer = require('multer');
const connection = require('../config')
require('dotenv').config()
const api_ip = process.env.domainip

const storage = multer.diskStorage({
  destination: (req, file, cb )=>{
    return cb(null,'./storage/notifications/')
  },
  filename: (req, file, cb)=>{
    return cb(null,`${file.originalname}`)
  }
})

exports.Upload = multer({storage}).single('file')

exports.insert_event =  (req, res) => {

  const  update  = req.body;
  const  file  = req.file;
  console.log(update)
  console.log("File"+file.originalname)
  const int = 0;
  const sql = 'INSERT INTO notification_updates (id, date, title,  file_path, external_text, external_link, main_page, scrolling, update_type, update_status, submitted_by, admin_approval) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?)';
  const values = [int, update.date, update.title,  file.originalname, update.external_txt, update.external_lnk, update.main_page, update.scrolling, update.update_type, update.update_status, update.submitted_by, update.admin_approval];
  console.log({values})
  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).json({ error: 'Error inserting data' });
      return;
    }
    console.log('Data inserted successfully');
    res.json({ message: 'Data inserted successfully' });
  });
};

exports.delete_event=(req, res) => {
  const id = req.params.id;
  const sql = `DELETE FROM notification_updates WHERE id = ${id}`;
  
  // connection.query(sql, (err, result) => {
  //   if (err) {
  //     console.error('Error deleting data:', err);
  //     res.status(500).json({ error: 'Error deleting data' });
  //     return;
  //   }
  //   console.log('Data deleted successfully');
  //   res.json({ message: 'Data deleted successfully' });
  // });
};

exports.update_event= (req, res) => {
  const updateId = req.params.id;
  const { update } = req.body;

  const sql = 'UPDATE notification_updates SET date=?, title=?,  fil_path=?, main_Page=?, scrolling=? update_type=? update_status=? WHERE id=?';
  const values = [update.date, update.title,  update.filepath, update.mainpage, update.scrolling, update.type,update.status, updateId];

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error updating data:', err);
      res.status(500).json({ error: 'Error updating data' });
      return;
    }
    console.log('Data updated successfully');
    res.json({ message: 'Data updated successfully' });
  });
};


exports.update_request_accept = (req, res) =>{
  const update = req.params.id;
  console.log(update)
  const sql = `select * from notification_updates WHERE id =${update}`
  connection.query(sql ,(err,result)=>{
    if(err){
      console.log(err)
      res.status(500).json({error:`error in accepting update ${err}`});
    }
    if(result.length > 0){
      console.log(result)
      connection.query(`UPDATE notification_updates set admin_approval='accepted' WHERE id=${update}`,(uperr,upres)=>{
        if(uperr){
          res.status(500).json({error:`error in accepting update ${err}`})
        }
        res.json({message:"Update Accepted Sueccfully"})
      })

    }
    else{
      console.log("edho eroor")
    }
  })
}
exports.update_request_deny = (req, res) =>{
  const update = req.params.id;
  const sql = `select * from notification_updates WHERE id =${update}`
  connection.query(sql ,(err,result)=>{
    if(err){
      res.status(500).json({error:`error in accepting update ${err}`})
    }
    else if(result.length > 0){
      connection.query(`UPDATE notification_updates set admin_approval='denied' WHERE id=${update}`,(uperr,upres)=>{
        if(uperr){
          res.status(500).json({error:`error in accepting update ${err}`})
        }
        res.json({message:"Update denied Sueccfully"})
      })

    }
  })
}

// Api for Admins
//
exports.every_events=(req, res) => {
  const sql = "SELECT * FROM notification_updates ORDER BY id DESC";

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error retrieving data:', err);
      res.status(500).json({ error: `Error retrieving data${err} `});
      return;
    }
    const final_events = results.map(eve=>{
      const filelink =`${api_ip}/media/${eve.file_path}`
      const outdate=new Date(eve.date)

      return{
        ...eve,
        file_link:filelink,
        day:outdate.getDate(),
        month: outdate.toLocaleString('en-US', { month: 'short' }),
        year: outdate.getFullYear(),
      }
    })

    console.log('Data retrieved successfully');
    // res.json({path:`api.jntugv.edu.in`})
    // results.push('api.jntugv.edu.in/files/')
    res.json(final_events);
  });
};

exports.all_admin_events=(req, res) => {
  const sql = "SELECT * FROM notification_updates WHERE submitted_by='admin' ORDER BY id DESC";

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error retrieving data:', err);
      res.status(500).json({ error: `Error retrieving data${err} `});
      return;
    }
    const final_events = results.map(eve=>{
      const filelink =`${api_ip}/media/${eve.file_path}`
      const outdate=new Date(eve.date)

      return{
        ...eve,
        file_link:filelink,
        day:outdate.getDate(),
        month: outdate.toLocaleString('en-US', { month: 'short' }),
        year: outdate.getFullYear(),
      }
    })

    console.log('Data retrieved successfully');
    // res.json({path:`api.jntugv.edu.in`})
    // results.push('api.jntugv.edu.in/media/')
    res.json(final_events);
  });
};

exports.all_updater_events=(req, res) => {
  adminid = req.params.adminid
  const sql = `SELECT * FROM notification_updates WHERE submitted_by='${adminid}' ORDER BY id DESC`;

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error retrieving data:', err);
      res.status(500).json({ error: `Error retrieving data${err} `});
      return;
    }
    const final_events = results.map(eve=>{
      const filelink =`${api_ip}/media/${eve.file_path}`
      const outdate=new Date(eve.date)

      return{
        ...eve,
        file_link:filelink,
        day:outdate.getDate(),
        month: outdate.toLocaleString('en-US', { month: 'short' }),
        year: outdate.getFullYear(),
      }
    })

    console.log('Data retrieved successfully');
    // res.json({path:`api.jntugv.edu.in`})
    // results.push('api.jntugv.edu.in/media/')
    res.json(final_events);
  });
};

exports.update_requests=(req, res) => {
  const sql = "SELECT * FROM notification_updates WHERE admin_approval='pending' ORDER BY id DESC";

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error retrieving data:', err);
      res.status(500).json({ error: `Error retrieving data${err} `});
      return;
    }
    const final_events = results.map(eve=>{
      const filelink =`${api_ip}/media/${eve.file_path}`
      const outdate=new Date(eve.date)

      return{
        ...eve,
        file_link:filelink,
        day:outdate.getDate(),
        month: outdate.toLocaleString('en-US', { month: 'short' }),
        year: outdate.getFullYear(),
      }
    })

    console.log('Data retrieved successfully');
    // res.json({path:`api.jntugv.edu.in`})
    // results.push('api.jntugv.edu.in/files/')
    res.json(final_events);
  });
};



// Api Methods For Frontend
exports.get_notifiactions=(req, res) => {
  const sql = "SELECT * FROM notification_updates WHERE update_status = 'update' AND  admin_approval='accepted' AND main_page = 'yes'  ORDER BY id DESC";

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error retrieving data:', err);
      res.status(500).json({ error: `Error retrieving data${err} `});
      return;
    }
    const final_events = results.map(eve=>{
      const filelink =`${api_ip}/media/${eve.file_path}`
      const outdate=new Date(eve.date)
      
      return{
        ...eve,
        file_link:filelink,
        day:outdate.getDate(),
        month: outdate.toLocaleString('en-US', { month: 'short' }),
        year: outdate.getFullYear(),
      }
    })
    console.log('Data retrieved successfully');
    // res.json({path:`api.jntugv.edu.in`})
    // results.push('api.jntugv.edu.in/files/')
    res.json(final_events);
  });
};


exports.get_scrolling_notifiactions=(req, res) => {
  const sql = "SELECT * FROM notification_updates WHERE update_status = 'update' && scrolling = 'yes' ORDER BY id DESC";

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error retrieving data:', err);
      res.status(500).json({ error: `Error retrieving data${err} `});
      return;
    }
    console.log('Scrolling Notifications Data retrieved successfully');
    res.json(results);
  });
};

