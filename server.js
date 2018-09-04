var express    = require("express");
var bodyParser = require('body-parser');
var path = require('path');
var mysql      = require('mysql');
var session = require('express-session');
var fileUpload = require('express-fileupload');
var login = require('./routes/loginroutes');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'HLC1024',
  database : 'highcountrylife'
});

var app = express();

app.use(session({secret: 'ssshhhhh'}));

app.set('view engine', 'ejs');

app.use('/static', express.static('static'))

app.use(fileUpload());

var sess;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
var router = express.Router();
var router1 = express.Router();

router.get('/dashboard', function(req, res){
	sess = req.session;

	if(sess.email)
	{
		res.render(path.join(__dirname + '/views/dashboard.ejs'));
	}
	else
	{
		res.redirect('/admin');
	}
});

router.get('/county', function(req, res){
	sess = req.session;

	if(sess.email)
	{
		connection.query('SELECT * FROM county', function (error, results, fields) {
	    if (error) {
	      console.log("error ocurred",error);
	      res.send({
	        "code":400,
	        "failed":"error ocurred"
	      })
	    }else{
	      console.log('The solution is: ', results);
	      res.render(path.join(__dirname + '/views/county.ejs'), {obj: results});
	    }
	    });
	}
	else
	{
		res.redirect('/admin');
	}
});


router.get('/city', function(req, res){
	sess = req.session;

	if(sess.email)
	{
		connection.query('SELECT * FROM cities', function (error, results, fields) {
	    if (error) {
	      console.log("error ocurred",error);
	      res.send({
	        "code":400,
	        "failed":"error ocurred"
	      })
	    }else{
	      console.log('The solution is: ', results);
	      res.render(path.join(__dirname + '/views/city.ejs'), {obj: results});
	    }
	    });
	}
	else
	{
		res.redirect('/admin');
	}
});


router.get('/business', function(req, res){
	sess = req.session;

	if(sess.email)
	{
		connection.query('SELECT * FROM business order by priority', function (error, results, fields) {
	    if (error) {
	      console.log("error ocurred",error);
	      res.send({
	        "code":400,
	        "failed":"error ocurred"
	      })
	    }else{
	      console.log('The solution is: ', results);
	      res.render(path.join(__dirname + '/views/business.ejs'), {obj: results});
	    }
	    });
	}
	else
	{
		res.redirect('/admin');
	}
});

router.get('/categories', function(req, res){
	sess = req.session;

	if(sess.email)
	{
		connection.query('SELECT * FROM categories', function (error, results, fields) {
	    if (error) {
	      console.log("error ocurred",error);
	      res.send({
	        "code":400,
	        "failed":"error ocurred"
	      })
	    }else{
	      console.log('The solution is: ', results);
	      res.render(path.join(__dirname + '/views/categories.ejs'), {obj: results});
	    }
	    });
	}
	else
	{
		res.redirect('/admin');
	}
});


router.get('/county/new', function(req, res){
	sess = req.session;

	if(sess.email)
	{
		res.render(path.join(__dirname + '/views/add_county.ejs'));
	}
	else
	{
		res.redirect('/admin');
	}
});


router.get('/city/new', function(req, res){
	sess = req.session;

	if(sess.email)
	{
		res.render(path.join(__dirname + '/views/add_city.ejs'));
	}
	else
	{
		res.redirect('/admin');
	}
});

router.get('/category/new', function(req, res){
	sess = req.session;

	if(sess.email)
	{
		res.render(path.join(__dirname + '/views/add_category.ejs'));
	}
	else
	{
		res.redirect('/admin');
	}
});



router.get('/business/new', function(req, res){
	sess = req.session;

	if(sess.email)
	{
		res.render(path.join(__dirname + '/views/add_business.ejs'));
	}
	else
	{
		res.redirect('/admin');
	}
});

router.get('/business/:id', function(req, res){
	var id = req.params.id;
	connection.query('SELECT * FROM business WHERE id = ?',[id], function (error, results, fields) {
	  if (error) {
	    // console.log("error ocurred",error);
	    res.send({
	      "code":400,
	      "failed":"error ocurred"
	    })
	  }else{
	  	res.send(results);
	  }

	});
});


router.get('/edit/:id', function(req, res){
	var id = req.params.id;
	connection.query('SELECT * FROM business WHERE id = ?',[id], function (error, results, fields) {
	  if (error) {
	    // console.log("error ocurred",error);
	    res.send({
	      "code":400,
	      "failed":"error ocurred"
	    })
	  }else{
	  	res.render(path.join(__dirname + '/views/edit_business.ejs'), 
	  		{
	  			id: results[0].id,
				title: results[0].title,
				video: results[0].video,
				details: results[0].details,
				category: results[0].category,
				city: results[0].city_id,
				priority: results[0].priority,
				website: results[0].website,
				phone: results[0].phone,
				address: results[0].address
			});
	  }

	});
});



router.get('/catedit/:id', function(req, res){
	var id = req.params.id;
	connection.query('SELECT * FROM categories WHERE id = ?',[id], function (error, results, fields) {
	  if (error) {
	    // console.log("error ocurred",error);
	    res.send({
	      "code":400,
	      "failed":"error ocurred"
	    })
	  }else{
	  	res.render(path.join(__dirname + '/views/edit_category.ejs'), 
	  		{
	  			id: results[0].id,
				category_name: results[0].category_name,
				cat_img: results[0].cat_img
			});
	  }

	});
});

router.use( function( req, res, next ) {
    // this middleware will call for each requested
    // and we checked for the requested query properties
    // if _method was existed
    // then we know, clients need to call DELETE request instead
    if ( req.query._method == 'DELETE' ) {
        // change the original METHOD
        // into DELETE method
        req.method = 'DELETE';
        // and set requested url to /user/12
        req.url = req.path;
    }       
    next(); 
});

router.delete('/delete/:id', function(req, res){
	var id = req.params.id;
	connection.query('DELETE FROM business WHERE id = ?',[id], function (error, results, fields) {
	  if (error) {
	    // console.log("error ocurred",error);
	    res.send({
	      "code":400,
	      "failed":"error ocurred"
	    })
	  }else{
	  	res.redirect('/admin/business');
	  }

	});
});


router.delete('/catdelete/:id', function(req, res){
	var id = req.params.id;
	connection.query('DELETE FROM categories WHERE id = ?',[id], function (error, results, fields) {
	  if (error) {
	    // console.log("error ocurred",error);
	    res.send({
	      "code":400,
	      "failed":"error ocurred"
	    })
	  }else{
	  	res.redirect('/admin/categories');
	  }

	});
});



router.get("/logout", function(req, res){
	req.session.destroy(function(err) {
	  if(err) {
	    console.log(err);
	  } else {
	    res.redirect('/admin');
	  }
	});
});



router1.get('/category/:name', function(req, res){

	var id = req.params.name;
	connection.query('select * from categories, business where categories.category_name = ? and categories.id = business.category;',[id], function (error, results, fields) {
	  if (error) {
	    // console.log("error ocurred",error);
	    res.send({
	      "code":400,
	      "failed":"error ocurred"
	    })
	  }else{
	  	console.log(results[0].cat_img);
	  	res.render(path.join(__dirname + '/views/category.ejs'), 
	  		{
	  			title : id,
	  			info : results,
	  			background : results[0].cat_img
			});

		 
	  }

	});

});

router1.get('/county/:name/:category', function(req, res){

	var id = req.params.category;
	var name = req.params.name;
	console.log(id, name);

	// res.send(id, name);


	connection.query('select * from categories, business where categories.category_name = ? and categories.id = business.category;',[id], function (error, results, fields) {
	  if (error) {
	    // console.log("error ocurred",error);
	    res.send({
	      "code":400,
	      "failed":"error ocurred"
	    })
	  }else{
	  	var image = results[0].cat_img;
	  	if(image === "" || image == null)
	  	{
	  		image = '/static/upload/back1.jpg';
	  	}
	  	res.render(path.join(__dirname + '/views/category.ejs'), 
	  		{
	  			title : id,
	  			info : results,
	  			background : image
			});

		 
	  }

	});

});



router1.get('/county/:name', function(req, res){

	res.render(path.join(__dirname + '/views/countypage.ejs'), {
		title : req.params.name
	});

});

// app.get('*', function(req, res){
//   res.send('what???', 404);
// });

// test route
router.get('/', function(req, res) {
    // res.sendFile(path.join(__dirname + '/templates/login.html'));
    res.render(path.join(__dirname + '/views/login.ejs'));
    // res.send("hello");
});

router1.get('/', function(req, res) {
    res.render(path.join(__dirname + '/views/landing.ejs'));
    // res.render(path.join(__dirname + '/views/login.ejs'));
    // res.send("hello");
});
//route to handle user registration
router.post('/register',login.register);
router.post('/login',login.login);
router.post('/county',login.county);
router.post('/city',login.city);
router.post('/business',login.business);
router.post('/category',login.category);
router.post('/edit/:id', login.edit_business);
router.post('/catedit/:id', login.edit_category);



router.get('/getcounty', login.getcounty);
router.get('/getcity', login.getcity);
router.get('/getcategory', login.getcategory);

app.use('/admin', router);
app.use('/', router1);
app.listen(5000);



// ALTER TABLE business
// ADD website varchar(100); 

// ALTER TABLE business
// ADD phone varchar(100);

// ALTER TABLE business
// ADD address varchar(200);

 // ALTER TABLE categories
 // ADD cat_img varchar(200);

 // ALTER TABLE county AUTO_INCREMENT=0;











