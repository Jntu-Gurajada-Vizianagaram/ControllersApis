const multer = require('multer');
<<<<<<< HEAD
const fs = require('fs')
const connection = require('../config')
require('dotenv').config()
    // const api_ip = process.env.domainip
const api_ip = 'http://localhost:8888'
    //const api_ip = 'https://api.jntugv.edu.in'

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        return cb(null, './storage/notifications/')
    },
    filename: (req, file, cb) => {
        return cb(null, `${file.originalname}`)
    }
})

exports.Upload = multer({ storage }).single('file')

exports.insert_event = (req, res) => {

    const update = req.body;
    const file = req.file;
    console.log(update)
    console.log("File" + file.originalname)
    const int = 0;
    const sql = 'INSERT INTO notification_updates (id, date, title,  file_path, external_text, external_link, main_page, scrolling, update_type, update_status, submitted_by, admin_approval) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?)';
    const values = [int, update.date, update.title, file.originalname, update.external_txt, update.external_lnk, update.main_page, update.scrolling, update.update_type, update.update_status, update.submitted_by, update.admin_approval];
    console.log({ values })
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

exports.delete_event = (req, res) => {
    // const filepath = './storage/notifications/'
    const id = req.params.id;
    const sel = `SELECT * FROM notification_updates WHERE id = ${id}`;
    const del = `DELETE FROM notification_updates WHERE id = ${id}`;

    connection.query(sel, (err, result) => {
        if (err) {
            console.error('Error deleting data:', err);
            res.status(500).json({ error: 'Error deleting data' });
            return;
        }

        const filepath = `./storage/notifications/${result[0].file_path}`

        connection.query(del, (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).json({ error: 'No Records Found!' });
                return;
            } else {
                fs.access(filepath, fs.constants.F_OK, (err) => {
                    if (err) {
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
        res.json({ message: 'Data deleted successfully' });
    });


};

// Update event function
exports.update_event = (req, res) => {
    const id = req.params.id;

    if (!id) {
        console.error('ID not found');
        res.status(400).json({ error: 'ID is required' });
        return;
    }
=======
const fs = require('fs');
const connection = require('../config');
require('dotenv').config();
const api_ip = 'https://api.jntugv.edu.in';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    return cb(null, './storage/notifications/');
  },
  filename: (req, file, cb) => {
    return cb(null, `${file.originalname}`);
  }
});


exports.Upload = multer({ storage }).single('file');

exports.insert_event = (req, res) => {
  const update = req.body;
  const file = req.file;
  const int = 0;

  const sql = 'INSERT INTO notification_updates (date, title, file_path, external_text, external_link, main_page, scrolling, update_type, update_status, submitted_by, admin_approval) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const values = [update.date, update.title, file.originalname, update.external_txt, update.external_lnk, update.main_page, update.scrolling, update.update_type, update.update_status, update.submitted_by, update.admin_approval];

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).json({ error: 'Error inserting data' });
      return;
    }
    res.json({ message: 'Data inserted successfully' });
  });
};

exports.delete_event = (req, res) => {
  const id = req.params.id;
  const sel = `SELECT * FROM notification_updates WHERE id = ?`;
  const del = `DELETE FROM notification_updates WHERE id = ?`;

  connection.query(sel, [id], (err, result) => {
    if (err) {
      console.error('Error selecting data:', err);
      res.status(500).json({ error: 'Error selecting data' });
      return;
    }

    const filepath = `./storage/notifications/${result[0].file_path}`;

    connection.query(del, [id], (err, result) => {
      if (err) {
        console.error('Error deleting data:', err);
        res.status(500).json({ error: 'Error deleting data' });
        return;
      }

      fs.access(filepath, fs.constants.F_OK, (err) => {
        if (err) {
          res.json(err);
          console.error('File does not exist');
          return;
        }

        fs.unlink(filepath, (err) => {
          if (err) {
            console.error('Error removing file:', err);
            return;
          }
        });
      });

      res.json({ message: 'Data deleted successfully' });
    });
  });
};
exports.update_event = (req, res) => {
  const updateId = req.params.id;
  const { date, title, external_text, external_link, main_page, scrolling, update_type, update_status } = req.body;

  // Check if the updateId and other required fields are provided
  if (!updateId || !date || !title || !external_text || !external_link || !main_page || !scrolling || !update_type || !update_status) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const sql = `UPDATE notification_updates SET date = ?, title = ?, external_text = ?, external_link = ?, main_page = ?, scrolling = ?, update_type = ?, update_status = ? WHERE id = ?`;

  const values = [date, title, external_text, external_link, main_page, scrolling, update_type, update_status, updateId];

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error updating data:', err);
      res.status(500).json({ error: 'Error updating data' });
      return;
    }


    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'No record found with the provided id' });
      return;
    }

    res.json({ message: 'Data updated successfully' });
  });
};
>>>>>>> 844c21651a44664e03cde295b9300e78fb79eff7

    const { title, description, date, time, location, image } = req.body;

<<<<<<< HEAD
    // Fetch existing data
    const fetchQuery = 'SELECT * FROM notification_updates WHERE id = ?';
    connection.query(fetchQuery, [id], (fetchErr, fetchResult) => {
        if (fetchErr) {
            console.error('Error fetching data:', fetchErr);
            res.status(500).json({ error: 'Error fetching data' });
            return;
        }

        if (fetchResult.length === 0) {
            console.error('No data found for the provided ID.');
            res.status(404).json({ error: 'No data found for the provided ID.' });
            return;
        }

        // Perform update
        const updateQuery = `
      UPDATE notification_updates 
      SET title = ?, description = ?, date = ?, time = ?, location = ?, image = ? 
      WHERE id = ?
    `;

        const queryParams = [title, description, date, time, location, image, id];

        connection.query(updateQuery, queryParams, (updateErr, updateResult) => {
            if (updateErr) {
                console.error('Error updating data:', updateErr);
                res.status(500).json({ error: 'Error updating data' });
                return;
            }

            console.log('Data updated successfully');
            res.json({ message: 'Data updated successfully' });
        });
    });
};


exports.update_request_accept = (req, res) => {
    const update = req.params.id;
    console.log(update)
    const sql = `select * from notification_updates WHERE id =${update}`
    connection.query(sql, (err, result) => {
        if (err) {
            console.log(err)
            res.status(500).json({ error: `error in accepting update ${err}` });
        }
        if (result.length > 0) {
            console.log(result)
            connection.query(`UPDATE notification_updates set admin_approval='accepted' WHERE id=${update}`, (uperr, upres) => {
                if (uperr) {
                    res.status(500).json({ error: `error in accepting update ${err}` })
                }
                res.json({ message: "Update Accepted Sueccfully" })
            })

        } else {
            console.log("edho eroor")
        }
    })
}
exports.update_request_deny = (req, res) => {
    const update = req.params.id;
    const sql = `select * from notification_updates WHERE id =${update}`
    connection.query(sql, (err, result) => {
        if (err) {
            res.status(500).json({ error: `error in accepting update ${err}` })
        } else if (result.length > 0) {
            connection.query(`UPDATE notification_updates set admin_approval='denied' WHERE id=${update}`, (uperr, upres) => {
                if (uperr) {
                    res.status(500).json({ error: `error in accepting update ${err}` })
                }
                res.json({ message: "Update denied Sueccfully" })
            })

        }
    })
}

// Api for Admins
//
exports.every_events = (req, res) => {
    const sql = "SELECT * FROM notification_updates ORDER BY id DESC";

    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error retrieving data:', err);
            res.status(500).json({ error: `Error retrieving data${err} ` });
            return;
        }
        const final_events = results.map(eve => {
            const filelink = `${api_ip}/media/${eve.file_path}`
            const outdate = new Date(eve.date)

            return {
                ...eve,
                file_link: filelink,
                day: outdate.getDate(),
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

exports.all_admin_events = (req, res) => {
    const sql = "SELECT * FROM notification_updates WHERE submitted_by='admin' ORDER BY id DESC";

    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error retrieving data:', err);
            res.status(500).json({ error: `Error retrieving data${err} ` });
            return;
        }
        const final_events = results.map(eve => {
            const filelink = `${api_ip}/media/${eve.file_path}`
            const outdate = new Date(eve.date)

            return {
                ...eve,
                file_link: filelink,
                day: outdate.getDate(),
                month: outdate.toLocaleString('en-US', { month: 'short' }),
                year: outdate.getFullYear(),
            }
        })

        // console.log('Data retrieved successfully');
        // res.json({path:`api.jntugv.edu.in`})
        // results.push('api.jntugv.edu.in/media/')
        res.json(final_events);
    });
};

exports.all_updater_events = (req, res) => {
    adminid = req.params.adminid
    const sql = `SELECT * FROM notification_updates WHERE submitted_by='${adminid}' ORDER BY id DESC`;

    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error retrieving data:', err);
            res.status(500).json({ error: `Error retrieving data${err} ` });
            return;
        }
        const final_events = results.map(eve => {
            const filelink = `${api_ip}/media/${eve.file_path}`
            const outdate = new Date(eve.date)

            return {
                ...eve,
                file_link: filelink,
                day: outdate.getDate(),
                month: outdate.toLocaleString('en-US', { month: 'short' }),
                year: outdate.getFullYear(),
            }
        })

        // console.log('Data retrieved successfully');
        // res.json({path:`api.jntugv.edu.in`})
        // results.push('api.jntugv.edu.in/media/')
        res.json(final_events);
    });
};

exports.update_requests = (req, res) => {
    const sql = "SELECT * FROM notification_updates WHERE admin_approval='pending' ORDER BY id DESC";

    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error retrieving data:', err);
            res.status(500).json({ error: `Error retrieving data${err} ` });
            return;
        }
        const final_events = results.map(eve => {
            const filelink = `${api_ip}/media/${eve.file_path}`
            const outdate = new Date(eve.date)

            return {
                ...eve,
                file_link: filelink,
                day: outdate.getDate(),
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



// Api Methods For Frontend
exports.get_notifiactions = (req, res) => {
    const sql = "SELECT * FROM notification_updates WHERE update_status = 'update' AND  admin_approval='accepted' AND main_page = 'yes'  ORDER BY id DESC";

    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error retrieving data:', err);
            res.status(500).json({ error: `Error retrieving data${err} ` });
            return;
        }
        const final_events = results.map(eve => {
                const filelink = `${api_ip}/media/${eve.file_path}`
                const outdate = new Date(eve.date)

                return {
                    ...eve,
                    file_link: filelink,
                    day: outdate.getDate(),
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


exports.get_scrolling_notifiactions = (req, res) => {
    const sql = "SELECT * FROM notification_updates WHERE update_status = 'update' && scrolling = 'yes' ORDER BY id DESC";

    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error retrieving data:', err);
            res.status(500).json({ error: `Error retrieving data${err} ` });
            return;
        }
        // console.log('Scrolling Notifications Data retrieved successfully');
        res.json(results);
    });
};
=======
exports.update_request_accept = (req, res) => {
  const update = req.params.id;

  connection.query(`UPDATE notification_updates set admin_approval = 'accepted' WHERE id = ?`, [update], (err, result) => {
    if (err) {
      res.status(500).json({ error: `Error in accepting update ${err}` });
      return;
    }
    res.json({ message: 'Update Accepted Successfully' });
  });
};

exports.update_request_deny = (req, res) => {
  const update = req.params.id;

  connection.query(`UPDATE notification_updates set admin_approval = 'denied' WHERE id = ?`, [update], (err, result) => {
    if (err) {
      res.status(500).json({ error: `Error in denying update ${err}` });
      return;
    }
    res.json({ message: 'Update Denied Successfully' });
  });
};

exports.every_events = (req, res) => {
  const sql = "SELECT * FROM notification_updates ORDER BY id DESC";

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error retrieving data:', err);
      res.status(500).json({ error: `Error retrieving data${err}` });
      return;
    }
    const final_events = results.map(eve => {
      const filelink = `${api_ip}/media/${eve.file_path}`;
      const outdate = new Date(eve.date);

      return {
        ...eve,
        file_link: filelink,
        day: outdate.getDate(),
        month: outdate.toLocaleString('en-US', { month: 'short' }),
        year: outdate.getFullYear(),
      };
    });

    res.json(final_events);
  });
};

exports.all_admin_events = (req, res) => {
  const sql = "SELECT * FROM notification_updates WHERE submitted_by = 'admin' ORDER BY id DESC";

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error retrieving data:', err);
      res.status(500).json({ error: `Error retrieving data${err}` });
      return;
    }
    const final_events = results.map(eve => {
      const filelink = `${api_ip}/media/${eve.file_path}`;
      const outdate = new Date(eve.date);

      return {
        ...eve,
        file_link: filelink,
        day: outdate.getDate(),
        month: outdate.toLocaleString('en-US', { month: 'short' }),
        year: outdate.getFullYear(),
      };
    });

    res.json(final_events);
  });
};

exports.all_updater_events = (req, res) => {
  const adminid = req.params.adminid;
  const sql = `SELECT * FROM notification_updates WHERE submitted_by = ? ORDER BY id DESC`;

  connection.query(sql, [adminid], (err, results) => {
    if (err) {
      console.error('Error retrieving data:', err);
      res.status(500).json({ error: `Error retrieving data${err}` });
      return;
    }
    const final_events = results.map(eve => {
      const filelink = `${api_ip}/media/${eve.file_path}`;
      const outdate = new Date(eve.date);

      return {
        ...eve,
        file_link: filelink,
        day: outdate.getDate(),
        month: outdate.toLocaleString('en-US', { month: 'short' }),
        year: outdate.getFullYear(),
      };
    });

    res.json(final_events);
  });
};

exports.update_requests = (req, res) => {
  const sql = "SELECT * FROM notification_updates WHERE admin_approval = 'pending' ORDER BY id DESC";

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error retrieving data:', err);
      res.status(500).json({ error: `Error retrieving data${err}` });
      return;
    }
    const final_events = results.map(eve => {
      const filelink = `${api_ip}/media/${eve.file_path}`;
      const outdate = new Date(eve.date);

      return {
        ...eve,
        file_link: filelink,
        day: outdate.getDate(),
        month: outdate.toLocaleString('en-US', { month: 'short' }),
        year: outdate.getFullYear(),
      };
    });

    res.json(final_events);
  });
};

exports.get_notifiactions = (req, res) => {
  const sql = "SELECT * FROM notification_updates WHERE update_status = 'update' AND admin_approval = 'accepted' AND main_page = 'yes' ORDER BY id DESC";

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error retrieving data:', err);
      res.status(500).json({ error: `Error retrieving data${err}` });
      return;
    }
    const final_events = results.map(eve => {
      const filelink = `${api_ip}/media/${eve.file_path}`;
      const outdate = new Date(eve.date);

      return {
        ...eve,
        file_link: filelink,
        day: outdate.getDate(),
        month: outdate.toLocaleString('en-US', { month: 'short' }),
        year: outdate.getFullYear(),
      };
    });

    res.json(final_events);
  });
};

exports.get_scrolling_notifiactions = (req, res) => {
  const sql = "SELECT * FROM notification_updates WHERE update_status = 'update' AND scrolling = 'yes' ORDER BY id DESC";

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error retrieving data:', err);
      res.status(500).json({ error: `Error retrieving data${err}` });
      return;
    }

    res.json(results);
  });
};
>>>>>>> 844c21651a44664e03cde295b9300e78fb79eff7
