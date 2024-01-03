const multer = require('multer');
const connection = require('../config')

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
  console.log(update )
  console.log("File"+file.originalname)
  const int = 0;
  const sql = 'INSERT INTO notification_updates (id, date, title,  file_path, main_page, scrolling, update_type, update_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  const values = [int, update.date, update.title,  file.originalname , update.main_page, update.scrolling, update.update_type, update.update_status];

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

connection.query(sql, (err, result) => {
  if (err) {
    console.error('Error deleting data:', err);
    res.status(500).json({ error: 'Error deleting data' });
    return;
  }
  console.log('Data deleted successfully');
  res.json({ message: 'Data deleted successfully' });
});
};

exports.all_events=(req, res) => {
  const sql = "SELECT * FROM notification_updates ORDER BY id DESC";

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error retrieving data:', err);
      res.status(500).json({ error: `Error retrieving data${err} `});
      return;
    }
    const final_events = results.map(eve=>{
      const filelink =`http://3.27.18.117:8888/files/${eve.file_path}`
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
exports.get_notifiactions=(req, res) => {
  const sql = "SELECT * FROM notification_updates WHERE update_status = 'update' ORDER BY id DESC";

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error retrieving data:', err);
      res.status(500).json({ error: `Error retrieving data${err} `});
      return;
    }
    const final_events = results.map(eve=>{
      const filelink =`http://3.27.18.117:8888/files/${eve.file_path}`
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


