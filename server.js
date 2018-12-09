var express = require("express");
var bodyParser = require('body-parser');
var path = require('path');
var mysql = require('mysql');
var session = require('express-session');
var fileUpload = require('express-fileupload');
var login = require('./routes/loginroutes');
var config = require('./routes/config.js');
var imageCache = require('image-cache');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

var db = config.database;

var connection = mysql.createConnection({
  host: db.host,
  user: db.user,
  password: db.password,
  database: db.database,
  multipleStatements: true
});


// Passport session setup.
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});
// Use the FacebookStrategy within Passport.
passport.use(new FacebookStrategy({
    clientID: db.facebook_api_key,
    clientSecret: db.facebook_api_secret,
    callbackURL: db.callback_url
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
      //Check whether the User exists or not using profile.id
      //Further DB code.
      // return done(null, profile);
      console.log("Auth done");
      done(null, profile);
    });
  }
));




var app = express();

app.use(session({
  secret: 'ssshhhhh'
}));
app.use(passport.initialize());
app.use(passport.session());


app.set('view engine', 'ejs');

app.use('/static', express.static('static'));

imageCache.setOptions({
  compressed: false

  // write your custom options here
});


app.use(fileUpload());

var sess;

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
var router = express.Router();
var router1 = express.Router();



// admin dashboar
router.get('/dashboard', function(req, res) {
  sess = req.session;

  if (sess.email) {
    res.render(path.join(__dirname + '/views/dashboard.ejs'));
  } else {
    res.redirect('/admin');
  }
});


// admin county
router.get('/county', function(req, res) {
  sess = req.session;

  if (sess.email) {
    connection.query('SELECT * FROM county', function(error, results, fields) {
      if (error) {
        console.log("error ocurred", error);
        res.send({
          "code": 400,
          "failed": "error ocurred"
        })
      } else {
        console.log('The solution is: ', results);
        res.render(path.join(__dirname + '/views/county.ejs'), {
          obj: results
        });
      }
    });
  } else {
    res.redirect('/admin');
  }
});

// admin city
router.get('/city', function(req, res) {
  sess = req.session;

  if (sess.email) {
    connection.query('SELECT * FROM cities', function(error, results, fields) {
      if (error) {
        console.log("error ocurred", error);
        res.send({
          "code": 400,
          "failed": "error ocurred"
        })
      } else {
        console.log('The solution is: ', results);
        res.render(path.join(__dirname + '/views/city.ejs'), {
          obj: results
        });
      }
    });
  } else {
    res.redirect('/admin');
  }
});


// admin business
router.get('/business', function(req, res) {
  sess = req.session;

  if (sess.email) {
    connection.query('SELECT * FROM business order by priority', function(error, results, fields) {
      if (error) {
        console.log("error ocurred", error);
        res.send({
          "code": 400,
          "failed": "error ocurred"
        })
      } else {
        console.log('The solution is: ', results);
        res.render(path.join(__dirname + '/views/business.ejs'), {
          obj: results
        });
      }
    });
  } else {
    res.redirect('/admin');
  }
});


// admin categories
router.get('/categories', function(req, res) {
  sess = req.session;

  if (sess.email) {
    connection.query('SELECT * FROM categories', function(error, results, fields) {
      if (error) {
        console.log("error ocurred", error);
        res.send({
          "code": 400,
          "failed": "error ocurred"
        })
      } else {
        console.log('The solution is: ', results);
        res.render(path.join(__dirname + '/views/categories.ejs'), {
          obj: results
        });
      }
    });
  } else {
    res.redirect('/admin');
  }
});


router.get('/county/new', function(req, res) {
  sess = req.session;

  if (sess.email) {
    res.render(path.join(__dirname + '/views/add_county.ejs'));
  } else {
    res.redirect('/admin');
  }
});


router.get('/city/new', function(req, res) {
  sess = req.session;

  if (sess.email) {
    res.render(path.join(__dirname + '/views/add_city.ejs'));
  } else {
    res.redirect('/admin');
  }
});

router.get('/category/new', function(req, res) {
  sess = req.session;

  if (sess.email) {
    res.render(path.join(__dirname + '/views/add_category.ejs'));
  } else {
    res.redirect('/admin');
  }
});



router.get('/business/new', function(req, res) {
  sess = req.session;

  if (sess.email) {
    res.render(path.join(__dirname + '/views/add_business.ejs'));
  } else {
    res.redirect('/admin');
  }
});

router.get('/business/:id', function(req, res) {
  var id = req.params.id;
  connection.query('SELECT * FROM business WHERE id = ?', [id], function(error, results, fields) {
    if (error) {
      // console.log("error ocurred",error);
      res.send({
        "code": 400,
        "failed": "error ocurred"
      })
    } else {
      res.send(results);
    }

  });
});


router.get('/edit/:id', function(req, res) {
  var id = req.params.id;
  connection.query('SELECT * FROM business WHERE id = ?', [id], function(error, results, fields) {
    if (error) {
      // console.log("error ocurred",error);
      res.send({
        "code": 400,
        "failed": "error ocurred"
      })
    } else {
      res.render(path.join(__dirname + '/views/edit_business.ejs'), {
        id: results[0].id,
        title: results[0].title,
        video: results[0].video,
        details: results[0].details,
        category: results[0].category,
        city: results[0].city_id,
        county: results[0].county_id,
        priority: results[0].priority,
        website: results[0].website,
        phone: results[0].phone,
        address: results[0].address,
        state: results[0].state
      });
    }

  });
});



router.get('/catedit/:id', function(req, res) {
  var id = req.params.id;
  connection.query('SELECT * FROM categories WHERE id = ?', [id], function(error, results, fields) {
    if (error) {
      // console.log("error ocurred",error);
      res.send({
        "code": 400,
        "failed": "error ocurred"
      })
    } else {
      res.render(path.join(__dirname + '/views/edit_category.ejs'), {
        id: results[0].id,
        category_name: results[0].category_name,
        cat_img: results[0].cat_img
      });
    }

  });
});

router.get('/countyedit/:id', function(req, res) {
  var id = req.params.id;
  connection.query('SELECT * FROM county WHERE id = ?', [id], function(error, results, fields) {
    if (error) {
      // console.log("error ocurred",error);
      res.send({
        "code": 400,
        "failed": "error ocurred"
      })
    } else {
      res.render(path.join(__dirname + '/views/edit_county.ejs'), {
        id: results[0].id,
        county: results[0].county,
        cat_img: results[0].cat_img
      });
    }

  });
});



router.use(function(req, res, next) {
  // this middleware will call for each requested
  // and we checked for the requested query properties
  // if _method was existed
  // then we know, clients need to call DELETE request instead
  if (req.query._method == 'DELETE') {
    // change the original METHOD
    // into DELETE method
    req.method = 'DELETE';
    // and set requested url to /user/12
    req.url = req.path;
  }
  next();
});

router.delete('/delete/:id', function(req, res) {
  var id = req.params.id;
  connection.query('DELETE FROM business WHERE id = ?', [id], function(error, results, fields) {
    if (error) {
      // console.log("error ocurred",error);
      res.send({
        "code": 400,
        "failed": "error ocurred"
      })
    } else {
      res.redirect('/admin/business');
    }

  });
});


router.delete('/catdelete/:id', function(req, res) {
  var id = req.params.id;
  connection.query('DELETE FROM categories WHERE id = ?', [id], function(error, results, fields) {
    if (error) {
      // console.log("error ocurred",error);
      res.send({
        "code": 400,
        "failed": "error ocurred"
      })
    } else {
      res.redirect('/admin/categories');
    }

  });
});





router.get("/logout", function(req, res) {
  req.session.destroy(function(err) {
    if (err) {
      console.log(err);
    } else {
      res.redirect('/admin');
    }
  });
});



router1.get('/category/:name', function(req, res) {

  console.log("logged user" + req.user);

  var id = req.params.name;
  var page = (req.query.page - 1) * 20;

  console.log("page: " + req.query.page);

  var sql = 'select * from cities, categories, business where categories.category_name = ? and categories.id = business.category and cities.id = business.city_id LIMIT 20 OFFSET ' + page + ';SELECT COUNT(business.id) as total FROM business, categories WHERE categories.category_name = ? and categories.id = business.category';

  connection.query(sql, [id, id], function(error, results, fields) {
    if (error) {
      // console.log("error ocurred",error);
      res.send({
        "code": 400,
        "failed": "error ocurred"
      })
    } else {
      console.log("results: ", results[1][0].total);
      console.log(results[0]);
      var image;

      if (results[0] === undefined || results[0].length == 0) {
        image = '/static/images/back2.jpg';
      } else {
        image = results[0][0].cat_img;
      }






      res.render(path.join(__dirname + '/views/category.ejs'), {
        title: id,
        info: results[0],
        background: image,
        totalPage: results[1][0].total,
        user: req.user
      });


    }

  });

});

router1.get('/city/:name', function(req, res) {

  var id = req.params.name;
  connection.query('select Distinct categories.category_name, categories.cat_img from cities, categories, business where cities.city_name = ? and categories.id = business.category and cities.id = business.city_id;', [id], function(error, results, fields) {
    if (error) {
      // console.log("error ocurred",error);
      res.send({
        "code": 400,
        "failed": "error ocurred"
      })
    } else {

      console.log(results);
      var catList = [];
      if (results === undefined || results.length == 0) {

      } else {
        results.forEach(item => {

          catList.push(item.category_name + "-" + item.cat_img);
        });
      }

      res.render(path.join(__dirname + '/views/citypage.ejs'), {
        title: req.params.name,
        results: catList,
        user: req.user
      });

    }

  });

});

router1.get('/county/:name/:category', function(req, res) {

  var id = req.params.category;
  var name = req.params.name;
  // console.log(id, name);

  var page = (req.query.page - 1) * 20;

  console.log("page: " + req.query.page);

  // res.send(id, name);

  var sql = 'select * from cities, county, categories, business where cities.id = business.city_id and categories.category_name = ? and categories.id = business.category and county.county = ? and county.id = business.county_id LIMIT 20 OFFSET ' + page + '; select COUNT(business.id) as total from county, categories, business where categories.category_name = ? and categories.id = business.category and county.county = ? and county.id = business.county_id';


  connection.query(sql, [id, name, id, name], function(error, results, fields) {
    if (error) {
      // console.log("error ocurred",error);
      res.send({
        "code": 400,
        "failed": "error ocurred"
      })
    } else {
      var image;

      console.log("final: " + results[0] + " count: " + results[1][0]);

      if (results[0] === undefined || results[0].length == 0) {
        image = '/static/images/back2.jpg';
      } else {
        image = results[0][0].cat_img;
      }

      res.render(path.join(__dirname + '/views/category.ejs'), {
        title: id,
        info: results[0],
        background: image,
        totalPage: results[1][0].total,
        user: req.user
      });


    }

  });

});


router1.get('/city/:name/:category', function(req, res) {

  var id = req.params.category;
  var name = req.params.name;
  // console.log(id, name);

  var page = (req.query.page - 1) * 20;

  console.log("page: " + req.query.page);

  // res.send(id, name);

  var sql = 'select * from cities, categories, business where cities.id = business.city_id and categories.category_name = ? and categories.id = business.category and cities.city_name = ? LIMIT 20 OFFSET ' + page + '; select COUNT(business.id) as total from cities, categories, business where categories.category_name = ? and categories.id = business.category and cities.city_name = ? and cities.id = business.city_id';


  connection.query(sql, [id, name, id, name], function(error, results, fields) {
    if (error) {
      // console.log("error ocurred",error);
      res.send({
        "code": 400,
        "failed": "error ocurred"
      })
    } else {
      var image;

      console.log("final: " + results[0] + " count: " + results[1][0]);

      if (results[0] === undefined || results[0].length == 0) {
        image = '/static/images/back2.jpg';
      } else {
        image = results[0][0].cat_img;
      }

      res.render(path.join(__dirname + '/views/category.ejs'), {
        title: id,
        info: results[0],
        background: image,
        totalPage: results[1][0].total,
        user: req.user
      });


    }

  });

});



router1.get('/county/:name', function(req, res) {

  var id = req.params.name;
  connection.query('select Distinct categories.category_name, categories.cat_img from county, categories, business where county.county = ? and categories.id = business.category and county.id = business.county_id;', [id], function(error, results, fields) {
    if (error) {
      // console.log("error ocurred",error);
      res.send({
        "code": 400,
        "failed": "error ocurred"
      })
    } else {

      // console.log(typeof(results));
      var catList = [];
      if (results === undefined || results.length == 0) {

      } else {
        results.forEach(item => {

          catList.push(item.category_name + "-" + item.cat_img);
        });
      }

      res.render(path.join(__dirname + '/views/countypage.ejs'), {
        title: req.params.name,
        results: catList,
        user: req.user
      });

    }

  });



});

// csv uploader

router.get('/countyUpload', function(req, res) {

  sess = req.session;

  if (sess.email) {
    res.render(path.join(__dirname + '/views/upload_county_csv.ejs'));
  } else {
    res.redirect('/admin');
  }

});

router.get('/cityUpload', function(req, res) {

  sess = req.session;

  if (sess.email) {
    res.render(path.join(__dirname + '/views/upload_city_csv.ejs'));
  } else {
    res.redirect('/admin');
  }

});

router.get('/categoryUpload', function(req, res) {

  sess = req.session;

  if (sess.email) {
    res.render(path.join(__dirname + '/views/upload_category_csv.ejs'));
  } else {
    res.redirect('/admin');
  }

});

router.get('/businessUpload', function(req, res) {

  sess = req.session;

  if (sess.email) {
    res.render(path.join(__dirname + '/views/upload_business_csv.ejs'));
  } else {
    res.redirect('/admin');
  }

});



router.get('/documentation', function(req, res) {

  sess = req.session;

  if (sess.email) {
    res.render(path.join(__dirname + '/views/documentation.ejs'));
  } else {
    res.redirect('/admin');
  }
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

router1.get('/privacy', function(req, res) {
  // res.sendFile(path.join(__dirname + '/templates/login.html'));
  res.render(path.join(__dirname + '/views/privacy.ejs'), {
    user: req.user
  });
  // res.send("hello");
});

router1.get('/', function(req, res) {
  res.render(path.join(__dirname + '/views/landing.ejs'), {
    user: req.user
  });
  // res.render(path.join(__dirname + '/views/login.ejs'));
  // res.send("hello");
});


// fb login

router1.get('/fb', function(req, res) {
  console.log("req: " + typeof(req.user));
  console.log(JSON.stringify(req.user));
  res.render('index', {
    user: req.user
  });
});

router1.get('/account', ensureAuthenticated, function(req, res) {
  res.render('account', {
    user: req.user
  });
});

//Passport Router
router1.get('/auth/facebook', passport.authenticate('facebook'));
router1.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/',
    failureRedirect: '/fblogin'
  }),
  function(req, res) {
    res.redirect('/');
  });

router1.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/')
}

// end of fb login

router.get('/category/:name', function(req, res) {

  // console.log("logged user" + req.user);

  var id = req.params.name;
  var page = (req.query.page - 1) * 20;

  console.log("page: " + req.query.page);

  var sql = 'select * from cities, categories, business where categories.category_name = ? and categories.id = business.category and cities.id = business.city_id;SELECT COUNT(business.id) as total FROM business, categories WHERE categories.category_name = ? and categories.id = business.category';

  connection.query(sql, [id, id], function(error, results, fields) {
    if (error) {
      // console.log("error ocurred",error);
      res.send({
        "code": 400,
        "failed": "error ocurred"
      })
    } else {
      console.log("results: ", results[1][0].total);
      console.log(results[0]);
      var image;

      if (results[0] === undefined || results[0].length == 0) {
        image = '/static/images/back2.jpg';
      } else {
        image = results[0][0].cat_img;
      }


      res.json(results[0]);



      // 	res.render(path.join(__dirname + '/views/category.ejs'),
      // 		{
      // 			title : id,
      // 			info : results[0],
      // 			background : image,
      // 			totalPage: results[1][0].total,
      // 			user : req.user
      // });


    }

  });

});

router.get('/county/:name/:category', function(req, res) {

  var id = req.params.category;
  var name = req.params.name;
  // console.log(id, name);

  var page = (req.query.page - 1) * 20;

  console.log("page: " + req.query.page);

  // res.send(id, name);

  var sql = 'select * from cities, county, categories, business where cities.id = business.city_id and categories.category_name = ? and categories.id = business.category and county.county = ? and county.id = business.county_id; select COUNT(business.id) as total from county, categories, business where categories.category_name = ? and categories.id = business.category and county.county = ? and county.id = business.county_id';


  connection.query(sql, [id, name, id, name], function(error, results, fields) {
    if (error) {
      // console.log("error ocurred",error);
      res.send({
        "code": 400,
        "failed": "error ocurred"
      })
    } else {
      var image;

      console.log("final: " + results[0] + " count: " + results[1][0]);

      if (results[0] === undefined || results[0].length == 0) {
        image = '/static/images/back2.jpg';
      } else {
        image = results[0][0].cat_img;
      }

      res.json(results[0]);
      // res.render(path.join(__dirname + '/views/category.ejs'),
      // 	{
      // 		title : id,
      // 		info : results[0],
      // 		background : image,
      // 		totalPage: results[1][0].total,
      // 		user : req.user
      // });


    }

  });

});

router.get('/city/:name/:category', function(req, res) {

  var id = req.params.category;
  var name = req.params.name;
  // console.log(id, name);

  var page = (req.query.page - 1) * 20;

  console.log("page: " + req.query.page);

  // res.send(id, name);

  var sql = 'select * from cities, categories, business where cities.id = business.city_id and categories.category_name = ? and categories.id = business.category and cities.city_name = ?; select COUNT(business.id) as total from cities, categories, business where categories.category_name = ? and categories.id = business.category and cities.city_name = ? and cities.id = business.city_id';


  connection.query(sql, [id, name, id, name], function(error, results, fields) {
    if (error) {
      // console.log("error ocurred",error);
      res.send({
        "code": 400,
        "failed": "error ocurred"
      })
    } else {
      var image;

      console.log("final: " + results[0] + " count: " + results[1][0]);

      if (results[0] === undefined || results[0].length == 0) {
        image = '/static/images/back2.jpg';
      } else {
        image = results[0][0].cat_img;
      }

      res.json(results[0]);
      // res.render(path.join(__dirname + '/views/category.ejs'),
      // 	{
      // 		title : id,
      // 		info : results[0],
      // 		background : image,
      // 		totalPage: results[1][0].total,
      // 		user : req.user
      // });


    }

  });

});

router.get('/catUndercounty/:name', function(req, res) {

  var id = req.params.name;
  connection.query('select Distinct categories.id, categories.category_name, categories.cat_img from county, categories, business where county.county = ? and categories.id = business.category and county.id = business.county_id order by categories.category_name;', [id], function(error, results, fields) {
    if (error) {
      // console.log("error ocurred",error);
      res.send({
        "code": 400,
        "failed": "error ocurred"
      })
    } else {

      // console.log(typeof(results));
      var catList = [];
      if (results === undefined || results.length == 0) {

      } else {
        results.forEach(item => {
          catList.push({
            id: item.id,
            category_name: item.category_name,
            cat_img: item.cat_img
          });
        });
      }

      res.json(catList);

      // res.render(path.join(__dirname + '/views/countypage.ejs'), {
      // 	title : req.params.name,
      // 	results: catList,
      // 	user : req.user
      // });

    }

  });



});

router.get('/catUndercity/:name', function(req, res) {

  var id = req.params.name;
  connection.query('select Distinct categories.id, categories.category_name, categories.cat_img from cities, categories, business where cities.city_name = ? and categories.id = business.category and cities.id = business.city_id order by categories.category_name;', [id], function(error, results, fields) {
    if (error) {
      // console.log("error ocurred",error);
      res.send({
        "code": 400,
        "failed": "error ocurred"
      })
    } else {

      console.log(results);
      var catList = [];
      if (results === undefined || results.length == 0) {

      } else {
        results.forEach(item => {

          catList.push({
            id: item.id,
            category_name: item.category_name,
            cat_img: item.cat_img
          });
        });
      }
      res.json(catList);
      // res.render(path.join(__dirname + '/views/citypage.ejs'), {
      // 	title : req.params.name,
      // 	results: catList,
      // 	user : req.user
      // });

    }

  });

});



//route to handle user registration
router.post('/register', login.register);
router.post('/login', login.login);
router.post('/county', login.county);
router.post('/city', login.city);
router.post('/business', login.business);
router.post('/category', login.category);
router.post('/edit/:id', login.edit_business);
router.post('/catedit/:id', login.edit_category);
router.post('/countyedit/:id', login.edit_county);
router.post('/saveCountyupload', login.countyUpload);
router.post('/saveCityupload', login.cityUpload);
router.post('/saveCategoryupload', login.categoryUpload);
router.post('/saveBuisnessupload', login.buisnessUpload);



router.get('/getcounty', login.getcounty);
router.get('/getcity', login.getcity);
router.get('/getcategory', login.getcategory);
router.post('/addFavorite', login.addFavorite);
router.get('/citiesofcounty/:county', login.citiesofcounty);
router.get('/getFavorite/:user', login.getFavorite);

app.use('/admin', router);
app.use('/', router1);
app.listen(8010);



// ALTER TABLE business
// ADD users text;

// ALTER TABLE business
// ADD phone varchar(100);

// ALTER TABLE business
// ADD address varchar(200);

//  ALTER TABLE categories
//  ADD cat_img varchar(200);

//  ALTER TABLE business AUTO_INCREMENT=0;

// CREATE TABLE favorite (
// id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
// business_id INT(11) NOT NULL,
// user_id varchar(100) NOT NULL
// );
