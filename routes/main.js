const db = require('../config/mysql')();
const bcryptjs = require('bcryptjs');

module.exports = function (app) {
	app.get('/', (req, res, next) => { 
        db.query(`SELECT * FROM home;`, (err,results) => {
            if (err) return next(err);
            res.render('page', { title: 'Hello, World!', 'results': results});
        
        });
    });


app.get('/book', (req, res, next) => { 
    db.query(`SELECT * FROM bookings;`, (err,results) => {
        if (err) return next(err);
        res.render('booking', { title: 'Hello, World!', 'results': results});
    
    });
});


app.get('/article', (req, res, next) => { 
    db.query(`SELECT * FROM articles;`, (err,results) => {
        if (err) return next(err);
        res.render('article', { title: 'Hello, World!', 'results': results});
    
    });
});



// =========================LOGIN START===========================//

app.get('/login', (req, res, next) => {
    res.render('login');        
});

app.post('/login', (req, res, next) => {
    db.query(`SELECT * FROM users WHERE username = ? ;`, [req.fields.username], function(err, result) {
        if(err)return next(err);
        if(result.length === 1){
            if(bcryptjs.compareSync(req.fields.password, result[0].passphrase)){
                req.session.user = result[0].id;
                req.session.rolesId = result[0].roles_id;
                
                app.locals.login = true;

                res.redirect('/admin');
            } else {
                res.redirect('/login');
            }
        }
    })
})


app.get('/logout', (req, res) => {
    app.locals.login = false;
    req.session.destroy();
    res.redirect('/login');
});



app.post('/signup', (req, res, next) => {
    bcryptjs.genSalt(10, (err, salt) => {
        bcryptjs.hash(req.fields.Password, salt, function(err, hash){
            db.query('INSERT INTO users SET username = ?, passphrase = ?, roles_id = 1', [req.fields.brugernavn, hash], function(err, result){
                if(err)return next(err);
				res.redirect('/login');
			
            })
        })
    });

});



// ==============Admin=============== //


 app.use('/admin', (req, res, next) => {
    if (!req.session.user || req.session.rolesId !== 1 ) {
        
        if (!req.session.user) {
            res.redirect('/login');
            return;

        } else {
            res.redirect('/events')
            return;
        }
        
    } else {
        next();
    }
});

//=========Admin===========//

app.get('/admin', (req,res) => {
    res.render('admin', { 'title': 'Admin', 'content': 'Super secret page!!' });
});


app.get('/admin/home', (req, res, next) => {
	db.query(`SELECT * FROM home;`, function(err, results){
		if (err)return next (err);
		res.render('sider', {'title': 'Home', 'results' : results} );
	});
});

//=========Admin opret===========//
app.get('/admin/home/opret', (req, res, next) => {
    res.render('create_home', {'title' : 'Opret produkt'});
});

app.post('/admin/home/opret', (req, res) => {
    console.log(req.fields);
    
    db.query('INSERT INTO home SET title = ?, images = ?, text = ?',
     [ req.fields.title, req.fields.images, req.fields.text], function(err, result){
        if (err) throw (err);
        res.redirect('/admin/home');
    });
});

//==============Admin rediger===================//
app.get('/admin/home/rediger/:id', function (req, res) {
    let id = req.params.id;
    db.query(`SELECT id, title,images,text FROM home WHERE id = ?`, [id], function (err, results){
       if(err){
           throw err;
       }
       res.render("edit_home", {'result': results[0]})
   });
      
   });
   
   app.post('/admin/home/rediger/:id', (req, res) => {
    db.query('UPDATE home SET title = ?,images = ?, text = ? WHERE home.id = ?', 
    [ req.fields.title, req.fields.images, req.fields. text, req.params.id ], function(err, result){
        if (err) throw (err);
        res.redirect('/admin/home');
    });
});

// =============delete button================ //

app.get('/admin/home/slet/:id', (req, res) => {
	let sql = `DELETE FROM cms_test.home WHERE id = ?;`;

	db.query(sql, [req.params.id], function(err, results){
		res.redirect('/admin/home/')
	});
});

// =============admin booking================ //
app.get('/admin/book', (req, res, next) => {
	db.query(`SELECT * FROM bookings;`, function(err, results){
		if (err)return next (err);
		res.render('produkter', {'title': 'Home', 'results' : results} );
	});
});

// =============admin booking/opret================ //
app.get('/admin/book/opret', (req, res, next) => {
    res.render('create_book', {'title' : 'Opret produkt'});
});

app.post('/admin/book/opret', (req, res) => {
    console.log(req.fields);
    
    db.query('INSERT INTO bookings SET booking = ?',
     [ req.fields.booking ], function(err, result){
        if (err) throw (err);
        res.redirect('/admin/book');
    });
});

// =============admin booking/rediger================ //
app.get('/admin/book/rediger/:id', function (req, res) {
    let id = req.params.id;
    db.query(`SELECT id, booking FROM bookings WHERE id = ?`, [id], function (err, results){
       if(err){
           throw err;
       }
       res.render("edit_book", {'result': results[0]})
   });
      
   });
   
   app.post('/admin/book/rediger/:id', (req, res) => {
    db.query('UPDATE bookings SET booking = ? WHERE bookings.id = ?', 
    [ req.fields.booking, req.params.id ], function(err, result){
        if (err) throw (err);
        res.redirect('/admin/book');
    });
});

// =============admin booking/delete================ //
app.get('/admin/book/slet/:id', (req, res) => {
	let sql = `DELETE FROM cms_test.bookings WHERE id = ?;`;

	db.query(sql, [req.params.id], function(err, results){
		res.redirect('/admin/book/')
	});
});

// =============admin article================ //
app.get('/admin/article', (req, res, next) => {
	db.query(`SELECT * FROM articles;`, function(err, results){
		if (err)return next (err);
		res.render('users', {'title': 'Home', 'results' : results} );
	});
});

// =============admin article/opret================ //
app.get('/admin/article/opret', (req, res, next) => {
    res.render('create_article', {'title' : 'Opret produkt'});
});

app.post('/admin/article/opret', (req, res) => {
    console.log(req.fields);
    
    db.query('INSERT INTO articles SET article = ?',
     [ req.fields.article], function(err, result){
        if (err) throw (err);
        res.redirect('/admin/article');
    });
});

// =============admin booking/rediger================ //
app.get('/admin/article/rediger/:id', function (req, res) {
    let id = req.params.id;
    db.query(`SELECT id, article FROM articles WHERE id = ?`, [id], function (err, results){
       if(err){
           throw err;
       }
       res.render("edit_article", {'result': results[0]})
   });
      
   });
   
   app.post('/admin/article/rediger/:id', (req, res) => {
    db.query('UPDATE articles SET article = ? WHERE articles.id = ?', 
    [ req.fields.article, req.params.id ], function(err, result){
        if (err) throw (err);
        res.redirect('/admin/article');
    });
});

// =============admin booking/delete================ //
app.get('/admin/article/slet/:id', (req, res) => {
	let sql = `DELETE FROM cms_test.articles WHERE id = ?;`;

	db.query(sql, [req.params.id], function(err, results){
		res.redirect('/admin/article/')
	});
});





app.get('/admin/book', (req, res) => {
	res.render('produkter');
});

app.get('/admin/article', (req, res) => {
	res.render('users');
});


}

