const express = require('express');
const mysql = require('mysql');
const axios = require('axios');
const app = express();
const port = 4000;

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'root123',
  database: 'movie_app_',
});

db.connect((err) => {
  if (err) {
    console.error('Database connection error: ' + err.message);
  } else {
    console.log('Connected to the database');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


app.get('/', (req, res) => {
    res.render('search');
});

app.post('/search', (req, res) => {
    const searchQuery = req.body.searchQuery;
    
    // Use Axios to fetch data from the OMDB API
    axios.get(`http://www.omdbapi.com/?s=${searchQuery}&apikey=1dac0de9`)
        .then((response) => {
          
            const movies = response.data.Search;
            res.render('search', { movies });
        })
        .catch((error) => {
            console.error('Error fetching data from OMDB API:', error);
            res.render('search', { error: 'Error fetching data from OMDB API' });
        });
});

app.post('/add-favorite', (req, res) => {
    const { title, year, type, poster } = req.body;
    const sql = 'INSERT INTO favorite (title, year, type, poster) VALUES (?, ?, ?, ?)';
    const values = [title, year, type, poster];
    
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error adding favorite to the database:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            console.log('Favorite added to the database');
            res.status(200).json({ message: 'Favorite added successfully' });
        }
    });
});


app.get('/favorites', (req, res) => {
  
    db.query('SELECT * FROM favorite', (err, rows) => {
        if (err) {
            console.error('Error fetching favorites from the database:', err);
            res.render('favorites', { error: 'Error fetching favorites from the database' });
        } else {
            res.render('favorites', { favorites: rows });
        }
    });
});

