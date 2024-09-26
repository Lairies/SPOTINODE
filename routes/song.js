const express = require('express');
const router = express.Router();
const db = require('../db');
const fs = require('fs');
const path = require('path');

// Route to list all songs
router.get('/', (req, res) => {
    db.query("SELECT * FROM tbl_songs", (err, results) => {
        if (err) throw err;
        res.render('song', { songs: results });
    });
});

// Route to scan for new songs
router.get('/scan', (req, res) => {
    const musicFolder = path.join(__dirname, '../public/playlist');

    fs.readdir(musicFolder, (err, files) => {
        if (err) throw err;

        let promises = files.map(file => {
            const title = path.parse(file).name;
            const artist = "Unknown Artist";
            const album = "Unknown Album";
            const filePath = `/playlist/${file}`;

            return new Promise((resolve, reject) => {
                const checkQuery = "SELECT * FROM tbl_songs WHERE file_path = ?";
                db.query(checkQuery, [filePath], (err, results) => {
                    if (err) return reject(err);

                    if (results.length === 0) {
                        const insertQuery = "INSERT INTO tbl_songs (title, artist, album, file_path) VALUES (?, ?, ?, ?)";
                        db.query(insertQuery, [title, artist, album, filePath], (err, result) => {
                            if (err) return reject(err);
                            console.log(`${title} added to the database`);
                            resolve();
                        });
                    } else {
                        console.log(`${title} is already in the database`);
                        resolve();
                    }
                });
            });
        });

        Promise.all(promises)
            .then(() => {
                res.send("Songs have been scanned and inserted into the database.");
            })
            .catch(err => {
                console.error(err);
                res.status(500).send("An error occurred while scanning songs.");
            });
    });
});

// Route to list user's favorite songs
router.get('/favorites', (req, res) => {
    const userId = 1; // Example user ID
    db.query("SELECT * FROM tbl_songs JOIN favorites ON tbl_songs.id = favorites.song_id WHERE favorites.user_id = ?", [userId], (err, results) => {
        if (err) throw err;
        res.render('favorites', { songs: results });
    });
});

// Route to add a song to favorites
router.post('/favorites/add', (req, res) => {
    const { user_id, song_id } = req.body;
    db.query("INSERT INTO favorites (user_id, song_id) VALUES (?, ?)", [user_id, song_id], (err, result) => {
        if (err) throw err;
        res.redirect('/song/favorites');
    });
});

module.exports = router;
