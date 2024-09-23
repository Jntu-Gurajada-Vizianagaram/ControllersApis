const multer = require('multer');
const connection = require('../config');
const con = require('../config');
const api_ip ='http://localhost:8888';

//const { server_ip: api_ip } = require('../api.json');

//const { server_ip: api_ip } = require('../api.json');


//const api_ip = 'https://api.jntugv.edu.in'
const fs_existsSync = require('fs').existsSync
const fs_mkdirSync = require('fs').mkdirSync
const fs = require('fs')
const path = require('path')
// const ipadd = process.env.domainIp

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
  //console.log(dmcupload)
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
    // console.log('Data inserted successfully');
    res.json({ message: 'Data inserted successfully' });
  });
};
 
exports.delete_img=(req, res) => {
const id = req.params.id;
const sel = `SELECT * FROM dmc_upload WHERE id = ${id}`;
const del = `DELETE FROM dmc_upload WHERE id = ${id}`;
  
  connection.query(sel, (err, result) => {
    if (err) {
      console.error('Error deleting data:', err);
      res.status(500).json({ error: 'Error deleting data' });
      return;
    }
    
    const filepath = `./storage/dmc/${result[0].file_path}`
    
    connection.query(del, (err,result)=>{
      if(err){
        console.log(err);
        res.status(500).json({ error: 'No Records Found!' });
        return;
      }else{
        fs.access(filepath, fs.constants.F_OK, (err) => {
          if(err) {
            res.json(err)
            console.error('File does not exist');
            return;
          }
          
          // If the file exists, remove it
          fs.unlink(filepath, (err) => {
            if (err) {
              console.error('Error removing file:', err);
              return;
            }
            console.log('File removed successfully');
          });
        });
      }
    });

    console.log('Data deleted successfully');
    res.json({ message: 'Data deleted successfully',result});
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
    // console.log('DMC Data retrieved successfully');

    res.json(img_list);
  });
};

//carousel api 
exports.carousel_imgs=(req, res) => {
  const sql = "SELECT * FROM dmc_upload WHERE admin_approval='accepted' AND carousel_scrolling='yes' ORDER BY id DESC";

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
    // console.log('DMC carousel Images Data retrieved successfully');
    res.json(img_list);

  });
};

exports.carousel_imgs_preview=(req, res) => {
  const sql = "SELECT * FROM dmc_upload WHERE admin_approval='pending' AND carousel_scrolling='yes' ORDER BY id AND admin_approval DESC";

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
    // console.log('DMC carousel Images Data retrieved successfully');
    res.json(img_list);

  });
};

exports.remove_from_carousel = (req,res)=>{
  const img_id = req.params.imgid
  const query1 = `SELECT * FROM dmc_upload WHERE id=${img_id} AND carousel_scrolling='yes'`
  const query2 = `UPDATE dmc_upload SET carousel_scrolling='no', admin_approval = 'pending' WHERE id=${img_id}`
  con.query(query1,(err,result1)=>{
    if(err){
      console.log(err)
    }
    else{
      con.query(query2,(err,result2)=>{
        if (err){
          console.log(err)
        }
        else{
          res.json({message:`${img_id}`,result:result2})
        }
      })
    }
  })
}

exports.add_to_carousel = (req,res)=>{
  const img_id = req.params.imgid
  const query1 = `SELECT * FROM dmc_upload WHERE id=${img_id} AND carousel_scrolling='no'`
  const query2 = `UPDATE dmc_upload SET carousel_scrolling='yes', admin_approval = 'pending' WHERE id=${img_id}`
  con.query(query1,(err,result1)=>{
    if(err){
      console.log(err)
    }
    else{
      con.query(query2,(err,result2)=>{
        if (err){
          console.log(err)
        }
        else{
          res.json({message:`${img_id}`,result:result2})
        }
      })
    }
  })
}


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
    // console.log('Data updated successfully');
    res.json({ message: 'Data updated successfully' });
  });
};



//----------REQUEST HANDLING APIS --------------//


exports.webadmin_requests=(req, res) => {
  const sql = "SELECT * FROM dmc_upload WHERE admin_approval='pending' AND carousel_scrolling='yes' ORDER BY id DESC";

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error retrieving data:', err);
      res.status(500).json({ error: `Error retrieving data${err} `});
      return;
    }
    const final_events = results.map(eve=>{
      const filelink =`${api_ip}/dmc/${eve.file_path}`
      const outdate=new Date(eve.date)

      return{
        ...eve,
        file_link:filelink,
        day:outdate.getDate(),
        month: outdate.toLocaleString('en-US', { month: 'short' }),
        year: outdate.getFullYear(),
      }
    })

    // console.log('Data retrieved successfully');
    // res.json({path:`api.jntugv.edu.in`})
    // results.push('api.jntugv.edu.in/files/')
    res.json(final_events);
  });
};
exports.webadmin_request_accept = (req, res) => {
exports.webadmin_request_accept = (req, res) => {
  const imgid = req.params.id;
  const sql = 'SELECT * FROM dmc_upload WHERE id = ?';
  connection.query(sql, [imgid], (err, result) => {
    if (err) {
      console.error('Error retrieving data:', err);
      res.status(500).json({ error: `Error in accepting update: ${err}` });
      return;
    }
   // console.log(result)
    if (result.length > 0) {
      const updateSql = 'UPDATE dmc_upload SET admin_approval = ? WHERE id = ?';
      const updateValues = ['accepted', imgid];
      connection.query(updateSql, updateValues, (uperr, upres) => {
        if (uperr) {
          console.error('Error updating data:', uperr);
          res.status(500).json({ error: `Error in accepting update: ${uperr}` });
          return;
        }
        res.json({ message: 'Image Request Accepted Successfully' });
      });
    } else {
      console.log('No data found');
      res.status(404).json({ error: 'No data found' });
        res.json({ message: 'Image Request Accepted Successfully' });
      });
    } else {
      console.log('No data found');
      res.status(404).json({ error: 'No data found' });
    }
  });
  });
}
exports.webadmin_request_deny = (req, res) =>{
  const imgid = req.params.id;
  const sql = `select * from dmc_upload WHERE id =${imgid}`
  connection.query(sql ,(err,result)=>{
    if(err){
      res.status(500).json({error:`error in accepting update ${err}`})
    }
    else if(result.length > 0){
      connection.query(`UPDATE dmc_upload set admin_approval='denied' WHERE id=${imgid}`,(uperr,upres)=>{
        if(uperr){
          res.status(500).json({error:`error in accepting update ${err}`})
        }
        res.json({message:"Image request denied Sueccfully"})
      })

    }
  })
}
}









//Bulk Photos of any Event



const bulkstorage = multer.diskStorage({
  destination: (req, file, cb )=>{
    const event_name = req.body.event_name;
    //console.log(event_name)
    //Create_dir(event_name)
    return cb(null,`./storage/dmc/events/${event_name}`)
  },
  filename: (req, file, cb)=>{
    return cb(null,`${file.originalname}`)
  }
})
exports.bulkupload = multer({storage:bulkstorage}).array('files',60);
exports.bulkupload = multer({storage:bulkstorage}).array('files',60);

const Create_dir = (event_name) =>{

  if(!fs_existsSync(`./storage/`)){
    fs_mkdirSync('./storage')
    return("Storage/ folder is Created")
  }
  else{

    if(!fs_existsSync(`./storage/dmc/`)){
      fs_mkdirSync(`./storage/dmc`)
      return("Storage/dmc folder is Created")
    }
    else{

      if(!fs_existsSync(`./storage/dmc/events`)){
        fs_mkdirSync(`./storage/dmc/events`)
        return("Storage/dmc/events folder is Created")
      }
      else{
        if(!fs_existsSync(`./storage/dmc/events/${event_name}`)){
          if(fs_mkdirSync(`./storage/dmc/events/${event_name}`)){
            return(event_name, `folder is Created Successfully, continue to upload images`)
            return(event_name, `folder is Created Successfully, continue to upload images`)
            }
            else{
              return("Error in Creating in Folder Cretaion")
            }
        }
        else{
          return(event_name, `folder is there, continue to upload images`)
          
        }
        
      }
      
    }
    
  }
}


exports.add_event_photos = (req,res) =>{
 // console.log( "Bulk Image Center")
  const events_details = req.body
  const id=0;
  try {
    const sql = `INSERT INTO event_photos (id, uploaded_date, event_name,  folderpath, description, added_by, admin_approval, main_page) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    const values = [id,events_details.uploaded_date,events_details.event_name,"",events_details.description,events_details.added_by,events_details.admin_approval,events_details.main_page]
    con.query(sql,values,(err,result)=>{
      if(err){
        console.log(err)
      }
      res.json({message:`${req.body.event_name} Photos uploaded Successfully`})
    })
  } catch (error) {
    res.status(400).json({message:error})
    
  }

}



// Event Photos Request Handling



exports.webadmin_event_requests=(req, res) => {
  const sql = "SELECT * FROM event_photos WHERE admin_approval='pending' AND main_page='yes' ORDER BY id DESC";

  try {
    con.query(sql, async (err, result) => {
      if (err) {
        res.status(400).json({ message: err });
      } else {
        const events = [];
        for (const eve of result) {
          try {
            const photos = await event_photos_links(eve.event_name);
            events.push({ ...eve,thumbnail:photos[0], event_photos: photos });
          } catch (error) {
            console.error(`Error fetching photos for event ${eve.event_name}:`, error);
            events.push({ ...eve, event_photos: [] }); // Handle the error gracefully
          }
        }
        res.json( events );
      }
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};






exports.webadmin_event_request_accept = (req, res) =>{
  const imgid = req.params.id;
  console.log(imgid)
  const sql = `select * from event_photos WHERE id =${imgid}`
  connection.query(sql ,(err,result)=>{
    if(err){
      console.log(err)
      res.status(500).json({error:`error in accepting update ${err}`});
    }
    if(result.length > 0){
      connection.query(`UPDATE event_photos set admin_approval='accepted' WHERE id=${imgid}`,(uperr,upres)=>{
        if(uperr){
          res.status(500).json({error:`error in accepting update ${err}`})
        }
        res.json({message:"Event Main Page Request Accepted Sueccfully"})
      })

    }
    else{
      console.log("edho eroor")
    }
  })
}
exports.webadmin_event_request_deny = (req, res) =>{
  const imgid = req.params.id;
  const sql = `select * from event_photos WHERE id =${imgid}`
  connection.query(sql ,(err,result)=>{
    if(err){
      res.status(500).json({error:`error in accepting update ${err}`})
    }
    else if(result.length > 0){
      connection.query(`UPDATE event_photos set admin_approval='denied' WHERE id=${imgid}`,(uperr,upres)=>{
        if(uperr){
          res.status(500).json({error:`error in accepting update ${err}`})
        }
        res.json({message:"Event Main Page request denied Sueccfully"})
      })

    }
  })
} 





// const event_photos_links = (event_name) =>{
//   console.log(event_name)
//   const folderpath = path.join(`./storage/dmc/events/${event_name}`);
//         fs.readdir(folderpath,(err,files)=>{
//         if(err){
//             console.log(err)
//             res.status(500).json({
//                 error:err,
//                 message:" Result Files Not Fetched"
//             })
//         }
//         else{
//           const filesnames = files.filter((file)=>{
//             const filepath = path.join(folderpath,file);
//             const stats = fs.statSync(filepath)
//             return stats.isFile();
//           })
     
//           const filesOnly = filesnames.map((filename)=>{
//             const filelink = `${api_ip}/events/${event_name}/${filename}` 
//             return {filelink,filename}
//           })
//           console.log(filesOnly)    
//           return filesOnly
//         }
//       })
// }



// exports.get_events_photos = async (req,res) =>{
//   try {
//     const sql = "SELECT * FROM event_photos ORDER BY id DESC"
//     con.query(sql,(err,result)=>{
//       if(err){
//         res.status(400).json({message:err})
//       }
//       else{
//         const events = result.map((eve)=>{
//           const photos = event_photos_links(eve.event_name)
//           console.log(photos)
//           return {
//             ...eve,
//             event_photos: "photos"
//           }
//         }) 
        
//         res.json({message:"All Events Photos and their Links",events})
//     }
//     })
//   } catch (error) {
    
//   }
// }


const event_photos_links = async (event_name) => {
  const folderpath = path.join(`./storage/dmc/events/${event_name}`);
  try {
    const files = await fs.promises.readdir(folderpath);
    const filesnames = files.filter((file) => {
      const filepath = path.join(folderpath, file);
      const stats = fs.statSync(filepath);
      return stats.isFile();
    });

    const filesOnly = filesnames.map((filename) => {
      const filelink = `${api_ip}/events/${event_name}/${filename}`;
      return filelink;
    });

    // console.log(filesOnly);
    return filesOnly;
  } catch (err) {
    console.error(err);
    throw err; // Re-throw the error to handle it in the calling function
  }
};

exports.get_events_photos = async (req, res) => {
  try {
    const sql = "SELECT * FROM event_photos ORDER BY id DESC";
    con.query(sql, async (err, result) => {
      if (err) {
        res.status(400).json({ message: err });
      } else {
        const events = [];
        for (const eve of result) {
          try {
            const photos = await event_photos_links(eve.event_name);
            events.push({ ...eve,thumbnail:photos[0], event_photos: photos });
          } catch (error) {
            console.error(`Error fetching photos for event ${eve.event_name}:`, error);
            events.push({ ...eve, event_photos: [] }); // Handle the error gracefully
          }
        }
        res.json({ message: "All Events Photos and their Links", events });
      }
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.get_main_events_photos = async (req, res) => {
  try {
    const sql = "SELECT * FROM event_photos WHERE admin_approval='accepted' ORDER BY id DESC";
    con.query(sql, async (err, result) => {
      if (err) {
        res.status(400).json({ message: err });
      } else {
        const events = [];
        for (const eve of result) {
          try {
            const photos = await event_photos_links(eve.event_name);
            events.push({ ...eve,thumbnail:photos[0], event_photos: photos });
          } catch (error) {
            console.error(`Error fetching photos for event ${eve.event_name}:`, error);
            events.push({ ...eve, event_photos: [] }); // Handle the error gracefully
          }
        }
        res.json({ message: "All Events Photos and their Links", events });
      }
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


exports.delete_event_photos = (req, res) => {
  const eventId = req.params.id;
  const selectSql = `SELECT * FROM event_photos WHERE id = ?`;
  const deleteSql = `DELETE FROM event_photos WHERE id = ?`;

  connection.query(selectSql, [eventId], (selectErr, selectResult) => {
    if (selectErr) {
      console.error('Error selecting event:', selectErr);
      res.status(500).json({ error: 'Error selecting event' });
      return;
    }

    if (selectResult.length === 0) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    const eventName = selectResult[0].event_name;
    const folderPath = path.join('./storage/dmc/events', eventName);

    connection.query(deleteSql, [eventId], (deleteErr, deleteResult) => {
      if (deleteErr) {
        console.error('Error deleting event:', deleteErr);
        res.status(500).json({ error: 'Error deleting event' });
        return;
      }

      // Delete the folder and its contents
      fs.rm(folderPath, { recursive: true, force: true }, (rmErr) => {
        if (rmErr) {
          console.error('Error deleting event folder:', rmErr);
          res.status(500).json({ error: 'Error deleting event folder' });
          return;
        }

        console.log('Event deleted successfully');
        res.json({ message: 'Event deleted successfully', result: deleteResult });
      });
    });
  });
};

exports.delete_event_photos = (req, res) => {
  const eventId = req.params.id;
  const selectSql = `SELECT * FROM event_photos WHERE id = ?`;
  const deleteSql = `DELETE FROM event_photos WHERE id = ?`;

  connection.query(selectSql, [eventId], (selectErr, selectResult) => {
    if (selectErr) {
      console.error('Error selecting event:', selectErr);
      res.status(500).json({ error: 'Error selecting event' });
      return;
    }

    if (selectResult.length === 0) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    const eventName = selectResult[0].event_name;
    const folderPath = path.join('./storage/dmc/events', eventName);

    connection.query(deleteSql, [eventId], (deleteErr, deleteResult) => {
      if (deleteErr) {
        console.error('Error deleting event:', deleteErr);
        res.status(500).json({ error: 'Error deleting event' });
        return;
      }

      // Delete the folder and its contents
      fs.rm(folderPath, { recursive: true, force: true }, (rmErr) => {
        if (rmErr) {
          console.error('Error deleting event folder:', rmErr);
          res.status(500).json({ error: 'Error deleting event folder' });
          return;
        }

        console.log('Event deleted successfully');
        res.json({ message: 'Event deleted successfully', result: deleteResult });
      });
    });
  });
};
