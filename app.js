const express = require('express');
const mysql = require('mysql2');
const app = express();
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage});

var exist = 0;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({
    extended: false
}));


// const connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'ca_cap'
// });
const connection = mysql.createConnection({
    host: 'mysql-yuheng.alwaysdata.net',
    user: 'yuheng',
    password: 'Yuheng9885*',
    database: 'yuheng_c237_mini_prj'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

connection.query('SELECT * FROM users', (error, user1) => {

    


    if (error) {
        console.error('Database query error:', error.message);
        return res.status(500).send('Error Retrieving  students');
    }

    var user = {
        name: null,
        loggedIn: false,
        profile: null,
        id: null
    };

    

    var msg = {
        stat: ''
    };
    app.get('/', (req, res) => {
        connection.query('SELECT * FROM users', (error, user1) => {});
        msg = {
            stat: ''
        };
        res.render('index', {user: user, msg: msg} );
    });

    app.get('/login', (req,res)=>{
        connection.query('SELECT * FROM users', (error, user1) => {
        });
        res.render('login', {user: user, msg: msg});
    });
    var uId;

    app.post('/login', (req,res)=>{
        const { usernameI, passwordI } = req.body;
        connection.query('SELECT * FROM users', (error, user1) => {
            var count = 0;
        
        for (let i = 0; i < user1.length; i++) {
            if (usernameI === user1[i].username && passwordI === user1[i].password) {
                console.log('User found');
                count = count+1;
                uId = user1[i];
            }
        }
        if(count == 0){
            console.log('Incorrect username or password');
            msg = {
                stat: 'ns'
            };
            res.redirect('/login');
        }else{
            if (uId.profile_pic === null) {
                var pic = 'profile1.png'
            } else {
                var pic = uId.profile_pic
            };
            user = {
                name: uId.username,
                loggedIn: true,
                profile: pic,
                id: uId.id
            };
            res.redirect('/');
            
        }
        });
        
        
        
        
        
    });


    app.get('/communities', (req, res) => {
        connection.query('SELECT * FROM users', (error, user1) => {});
        msg = {
            stat: ''
        };
        const sql = 'SELECT * FROM communities';
        connection.query(sql, (error, results) => {
            if (error) {
                console.error('Database query error:', error.message);
                return res.status(500).send('Error Retrieving  students');
            }
            res.render('communities', {  communities: results, user: user, msg: msg });
        });
    });

    app.get('/activities', (req, res) => {
        connection.query('SELECT * FROM users', (error, user1) => {});
        msg = {
            stat: ''
        };
        const sql = 'SELECT * FROM activities';
        connection.query(sql, (error, results) => {
            if (error) {
                console.error('Database query error:', error.message);
                return res.status(500).send('Error Retrieving  students');
            }
            
            res.render('activities', {  activities: results, user: user, msg: msg });
            console.log(user.id);
        });
    });

    app.get('/cActi', (req,res)=>{
        connection.query('SELECT * FROM users', (error, user1) => {});
        exist = 0;
        const sql = 'SELECT * FROM activities';
        connection.query(sql, (error, actiResult) => {
            if (error) {
                console.error('Database query error:', error.message);
                return res.status(500).send('Error Retrieving  communities');
            }
            res.render('cActi', {  cActi: actiResult, user: user, msg: msg });
        });
        
    });

    app.post('/cActi', upload.single('cPic'), (req,res) => {
        const { title, description, location, date_time, capacity} = req.body;
            
        const sql = 'INSERT INTO  activities (user_id, title, description, location, date_time, capacity) VALUES (?, ?, ?, ?, ?, ?)';
        connection.query(sql, [user.id, title, description, location, date_time, capacity], (error, results) => {
            if (error) {
                console.error('Error creating activity: ', error);
                res.status(500).send('Error creating activity');
                console.log(id)
            }else{
                res.redirect('/activities'); 
            }
               
            
        });
    });

    app.get('/activity/:id', (req,res)=>{
        connection.query('SELECT * FROM users', (error, user1) => {});
        msg = {
            stat: ''
        };
        const id = req.params.id;
        const sql = 'SELECT * FROM  activities WHERE  id = ?';

        connection.query( sql, [id], (error, results) => {
            console.log(results[0]);
            connection.query('SELECT username FROM users WHERE id = ?', results[0].user_id, (error, userN) => {
                if (error) {
                    console.error('Database query error:', error.message);
                    return res.status(500).send('Error Retrieving activity');
                }
                if (results.length === 0) {
                    return res.status(404).send('activity not found');
                }else{
                    res.render('activity', { activity: results[0], user: user, msg: msg, userN: userN });
                }
            });
            
        });
    });

    cUser = [];
    cEmail = [];
    app.get('/signup', (req,res)=>{
        connection.query('SELECT * FROM users', (error, user1) => {});
        exist = 0;
        const sql = 'SELECT * FROM users';
        connection.query(sql, (error, userR) => {
            if (error) {
                console.error('Database query error:', error.message);
                return res.status(500).send('Error Retrieving  communities');
            }
            for (let i = 0; i < userR.length; i++) {
                cUser.push(userR[i].username);
                cEmail.push(userR[i].email);
            }
            
            res.render('signup', {  signup: userR, user: user, msg: msg, cUser: cUser, cEmail: cEmail });
        });
        
    });
    var eExist = 0;
    app.post('/signup', (req,res) => {
        const { username, email, password, repassword} = req.body;
        if (password != repassword){
            msg = {
                stat: 'wp'
            };
            res.redirect('/signup');
        }else if (password.length < 8){
            msg = {
                stat: 'sp'
            };
            res.redirect('/signup');
        } else if (password === repassword && password.length >= 8){
            const sql = 'INSERT INTO  users (username, email, password, profile_pic) VALUES (?, ?, ?, ?)';
            connection.query(sql, [username, email, password, "profile1.png"], (error, results) => {
                for (let i = 0; i < cUser.length; i++) {
                    if (cUser[i] === username){
                        exist = exist + 1;
                    }else if(cEmail[i] === email){
                        eExist = eExist + 1;
                    }
                    
                };
                if (exist == 0 && eExist == 0){
                    if (error) {
                        console.error('Error creating user: ', error);
                        return res.status(500).send('Error creating user');
                    }else{
                        res.redirect('/login');    
                    }      
                }else if (eExist != 0){
                    msg = {
                        stat: 'ee'
                    };
                    res.redirect('/signup');
                }else{
                    msg = {
                        stat: 'eu'
                    };
                    res.redirect('/signup');
                }
            });
        }
        
    });
    

    app.get('/community/:id', (req,res)=>{
        connection.query('SELECT * FROM users', (error, user1) => {});
        msg = {
            stat: ''
        };
        const id = req.params.id;
        const sql = 'SELECT * FROM  communities WHERE  id = ?';

        connection.query( sql, [id], (error, results) => {
            console.log(results[0]);
            if (error) {
                console.error('Database query error:', error.message);
                return res.status(500).send('Error Retrieving  communities');
            }
            if (results.length === 0) {
                return res.status(404).send('community not found');
            }else{
                res.render('community', { community: results[0], user: user, msg: msg });
            }
            
        });
    });
    var com = [];
    app.get('/cComm', (req,res)=>{
        connection.query('SELECT * FROM users', (error, user1) => {});
        exist = 0;
        const sql = 'SELECT * FROM communities';
        connection.query(sql, (error, comResult) => {
            if (error) {
                console.error('Database query error:', error.message);
                return res.status(500).send('Error Retrieving  communities');
            }
            for (let i = 0; i < comResult.length; i++) {
                com.push(comResult[i].cName);
            }
            
            res.render('cComm', {  cComm: comResult, user: user, msg: msg, com: com });
        });
        
    });

    

    app.post('/cComm', upload.single('cPic'), (req,res) => {
        connection.query('SELECT * FROM users', (error, user1) => {});
        const { cName, cDesc, cPic} = req.body;
        let image;
        if (req.file){
            console.log('uploaded');
            image = req.file.filename;
        }else{
            console.log('no image');
            image = req.file.filename;
        }
        console.log(exist);
            
        const sql = 'INSERT INTO  communities (cName, cDesc, cPic) VALUES (?, ?, ?)';
        connection.query(sql, [cName, cDesc, image], (error, results) => {
            for (let i = 0; i < com.length; i++) {
                if (com[i] === cName){
                    exist = exist + 1;
                }
                
            };
            if (exist == 0){
                if (error) {
                    console.error('Error creating community: ', error);
                    return res.status(500).send('Error creating community');
                }else{
                    console.log(cName, cDesc, image, cPic);
                    res.redirect('/communities');
                }      
            }else{
                msg = {
                    stat: 'ec'
                };
                res.redirect('/cComm');
            }
            
        });
    });

    app.get('/editActi/:id', (req,res)=>{
        if (user.loggedIn === false) {
            res.redirect('/login');
        }
        connection.query('SELECT * FROM users', (error, user1) => {});
        const activityId = req.params.id;
        const sql = 'SELECT * FROM activities WHERE id = ?';
        connection.query( sql, [activityId], (error, results) => {
            if (error) {
                console.error('Database query error:', error.message);
                return res.status(500).send('Error Retrieving activity');
            }
            if (results.length === 0) {
                return res.status(404).send('activity not found');
            }else{
                res.render('editActi', { editActi: results[0], user: user, msg: msg });
            }
            
        });
    });


    app.post('/editActi/:id', (req,res)=>{
        
        const activityId = req.params.id;
        const { title, description, location, date_time, capacity} = req.body;
        const sql = 'UPDATE activities SET title = ?, description = ?, location = ?, date_time = ?, capacity = ? WHERE id = ?';
        
        connection.query( sql , [ title, description, location, date_time, capacity, activityId], (error, results) => {
            if (error) {
                console.error('Error updating activity: ', error);
                res.status(500).send('Error updating activity');
                console.log(title, description, location, date_time, capacity);
            }else{
                console.log(title, description, location, date_time, capacity);
                res.redirect('/activity/' + activityId);
            }
        });
    });
    
    app.get('/deleteActi/:id', (req,res)=>{
        connection.query('SELECT * FROM users', (error, user1) => {});
        const activityId = req.params.id;
        const sql = 'DELETE FROM activities WHERE id = ?';
        connection.query( sql , [activityId], (error, results) => {
            if (error) {
                console.error('Error deleting activity: ', error);
                res.status(500).send('Error deleting activity');
            }else{
                res.redirect('/activities');
            }
        });
    });

    app.get('/profile', (req, res) => {
        if (user.loggedIn === false) {
            res.redirect('/login');
            return;
        };
        msg = {
            stat: ''
        };
        const sql = 'SELECT * FROM users WHERE id = ?';
        connection.query(sql, user.id, (error, results) => {
            if (error) {
                console.error('Database query error:', error.message);
                return res.status(500).send('Error Retrieving  user');
            }else if (results.length === 0) {
                return res.status(404).send('user not found');
            }
            console.log(results);
            res.render('profile', {  profile: results[0], user: user, msg: msg });
        });
    });

    app.post('/profile', (req,res)=>{
        user = {
            name: null,
            loggedIn: false,
            profile: null,
            id: null
        };
        res.redirect('/');
    });

    app.get('/updProfile', (req,res)=>{
        if (user.loggedIn == false) {
            res.redirect('/');
            return;
        };
        
        const sql = 'SELECT * FROM users WHERE id = ?';
        connection.query( sql, [user.id], (error, results) => {
            
            if (error) {
                console.error('Database query error:', error.message);
                return res.status(500).send('Error Retrieving user');
            }
            if (results.length === 0) {
                return res.status(404).send('user not found');
            }else{
                for (let i = 0; i < user1.length; i++) {
                    cUser.push(user1[i].username);
                    cEmail.push(user1[i].email);
                }
                res.render('updProfile', { updProfile: results[0], user: user, msg: msg });
                
            }
            
        });
    });

    app.post('/updProfile', upload.single('image'), (req,res)=>{
        const { username, email, phone, password, repassword} = req.body;
        let image = req.body.currentImage;
        if (req.file){
            image = req.file.filename;
        }else{
            image = req.body.currentImage;
        };
        if (phone === '') {
            newPhone = null;
        }else{
            newPhone = phone;
        }
        if (password != repassword){
            msg = {
                stat: 'wp'
            };
            res.redirect('/updProfile');
        
        } else if (password === repassword && password.length >= 8){
            const sql = 'UPDATE users SET username = ?, email = ?, phone = ?, password = ?, profile_pic = ? WHERE id = ?';
            connection.query( sql , [ username, email, newPhone, password, image, user.id], (error, results) => {
                for (let i = 0; i < cUser.length; i++) {
                    if (cUser[i] === username){
                        exist = exist + 1;
                    }else if(cEmail[i] === email){
                        eExist = eExist + 1;
                    }
                    
                };
                if (exist == 0 && eExist == 0 || username === user.name && email === user.email || username === user.name && eExist == 0 || exist == 0 && email === user.email){
                    if (error) {
                        console.error('Error updating user: ', error);
                        return res.status(500).send('Error updating user');
                    }else{
                        res.redirect('/profile');
                        user = {
                            name: username,
                            loggedIn: true,
                            profile: image,
                            id: user.id
                        };

                    }      
                }else if (eExist != 0){
                    msg = {
                        stat: 'ee'
                    };
                    res.redirect('/updProfile');
                }else{
                    msg = {
                        stat: 'eu'
                    };
                    res.redirect('/updProfile');
                }
            });
        }
    });
    
    


});





const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));