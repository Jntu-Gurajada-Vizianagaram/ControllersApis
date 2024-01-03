const connection = require('../config')

exports.insert_college = (req, res) => {
  const {data} = req.body;
  const int = 0;
  const sql = 'INSERT INTO affiliated_colleges (id,logo, college_name, college_address,college_link) VALUES (?,?, ?, ?, ?)';

  connection.query(sql, [int,data.logo, data.college_name, data.college_address, data.college_link], (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).json({ error: 'Error inserting data' });
      return;
    }
    console.log('Data inserted successfully');
    res.json({ message: 'Data inserted successfully' });
  });
};

exports.update_college= (req, res) => {
  const updateId = req.params.id;
  const { update } = req.body;

  const sql = 'UPDATE affiliated_colleges SET logo=?, college_name=?,  college_address=?, college_link=? WHERE id=?';
  const values = [update.logo, update.college_name,  update.college_address, update.college_link];

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


exports.delete_college = (req, res) => {
const collegeName = req.params.college_name;
const sql = 'DELETE FROM affiliated_colleges WHERE college_name = ?';

connection.query(sql, collegeName, (err, result) => {
  if (err) {
    console.error('Error deleting data:', err);
    res.status(500).json({ error: 'Error deleting data' });
    return;
  }
  console.log('Data deleted successfully');
  res.json({ message: 'Data deleted successfully' });
});
};

exports.get_colleges = (req, res) => {
  const sql = 'SELECT * FROM affiliated_colleges';

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error retrieving data:', err);
      res.status(500).json({ error: 'Error retrieving data' });
      return;
    }
    console.log('Data retrieved successfully');
    res.json(results);
  });
};




/*------new code----
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const port = 3001;

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '4363',
  database: 'jntugv',
});

app.use(express.json());
app.use(cors());

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

app.post('/insert', (req, res) => {
  const data = req.body;
  const int = 0;
  const sql = 'INSERT INTO affiliated_colleges (id,logo, college_name, college_address,college_link) VALUES (?, ?, ?, ?,?)';

  connection.query(sql, [int,data.logo, data.college_name, data.college_address, data.college_link], (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).json({ error: 'Error inserting data' });
      return;
    }
    console.log('Data inserted successfully');
    res.json({ message: 'Data inserted successfully' });
  });
});

app.post('/update/:id', (req, res) => {
  const updateId = req.params.id;
  const { logo, college_name, college_address, college_link } = req.body; // Destructure directly

  const sql = 'UPDATE affiliated_colleges SET logo = ?, college_name = ?, college_address = ?, college_link = ? WHERE id = ?';


  if (!req.body || !req.body.logo) {
    return res.status(400).json({ error: 'Invalid or missing logo property in the request body' });
  }

  connection.query(
    sql,
    [logo, college_name, college_address, college_link, updateId], // Use the extracted variables
    (err, result) => {
      if (err) {
        console.error('Error updating data:', err);
        res.status(500).json({ error: 'Error updating data' });
        return;
      }
      console.log('Data updated successfully');
      res.json({ message: 'Data updated successfully' });
    }
  );
});



app.delete('/delete/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM affiliated_colleges WHERE id = ?';

  connection.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error deleting data:', err);
      res.status(500).json({ error: 'Error deleting data' });
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Record not found' });
      return;
    }
    console.log('Data deleted successfully');
    res.json({ message: 'Data deleted successfully' });
  });
});

app.get('/api/colleges', (req, res) => {
  const sql = 'SELECT * FROM affiliated_colleges';

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error retrieving data:', err);
      res.status(500).json({ error: 'Error retrieving data' });
      return;
    }
    console.log('Data retrieved successfully');
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(Server is running on port ${port});
});*/