const multer = require('multer');
const connection = require('../config')
const api_ip = 'https://api.jntugv.edu.in'

const storage = multer.diskStorage({
  destination: (req, file, cb )=>{
    return cb(null,'./storage/dmc/')
  },
  filename: (req, file, cb)=>{
    return cb(null,`${file.originalname}`)
  }
})

exports.dmcUpload = multer({storage}).single('file')

exports.insert_img =  (req, res) => {

  const  dmcupload  = req.body;
  const  file  = req.file
  console.log(dmcupload)
  console.log("File"+file.originalname)
  const int = 0;
  const sql = 'INSERT INTO dmc_upload (id, date, title,  file_path, description, submitted, admin_approval, carousel_scrolling, gallery_scrolling) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const values = [int, dmcupload.date, dmcupload.title,  file.originalname , dmcupload.description, dmcupload.submitted, dmcupload.admin_approval, dmcupload.carousel_scrolling, dmcupload.gallery_scrolling];

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
 
exports.delete_img=(req, res) => {
const id = req.params.id;
const sql = `DELETE FROM dmc_upload WHERE id = ${id}`;

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

exports.all_imgs=(req, res) => {
  const sql = "SELECT * FROM dmc_upload ORDER BY id DESC";

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error retrieving data:', err);
      res.status(500).json({ error: `Error retrieving data${err} `});
      return;
    }

    const img_list = results.map(img=>{
      const img_link = `${api_ip}/dmc/${img.file_path}`

      return {
        ...img,
      imglink:img_link
      }
    })
    console.log('DMC Data retrieved successfully');

    res.json(img_list);
  });
};



exports.update_gallery= (req, res) => {
  const uploadId = req.params.id;
  const { dmcupload } = req.body;

  const sql = 'UPDATE dmc_upload SET date=?, title=?,  fil_path=?, description=?, submitted=?, admin_approval=?, carousel_scrolling=?, gallery_scrolling=?  WHERE id=?';
  const values = [dmcupload.date, dmcupload.title,  dmcupload.filepath, dmcupload.description, dmcupload.submitted, dmcupload.admin_approval, dmcupload.carousel_scrolling, dmcupload.gallery_scrolling];

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


