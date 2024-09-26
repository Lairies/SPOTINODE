const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./db');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Routes
const musicRoutes = require('./routes/song');
app.use('/song', musicRoutes);

app.get('/', (req, res) => {
    const search = req.query.search || '';
    let query = "SELECT * FROM tbl_songs";
    let queryParams = [];

    if (search) {
        query += " WHERE title LIKE ? OR artist LIKE ?";
        queryParams.push(`%${search}%`, `%${search}%`);
    }

    db.query(query, queryParams, (err, results) => {
        if (err) throw err;
        res.render('index', { songs: results });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
