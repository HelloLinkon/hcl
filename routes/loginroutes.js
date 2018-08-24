var mysql      = require('mysql');
var path = require('path');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'HLC1024',
  database : 'highcountrylife'
});
connection.connect(function(err){
if(!err) {
    console.log("Database is connected ... nn");
} else {
    console.log("Error connecting database ... nn");
}
});

exports.register = function(req,res){
  // console.log("req",req.body);
  var today = new Date();
  var users={
    "first_name":req.body.first_name,
    "last_name":req.body.last_name,
    "email":req.body.email,
    "password":req.body.password,
    //  "first_name": "linkon",
    // "last_name": "islam",
    // "email": "hi",
    // "password": "hello",
    "created":today,
    "modified":today
  }
  connection.query('INSERT INTO users SET ?',users, function (error, results, fields) {
  if (error) {
    console.log("error ocurred",error);
    res.send({
      "code":400,
      "failed":"error ocurred"
    })
  }else{
    console.log('The solution is: ', results);
    res.send({
      "code":200,
      "success":"user registered sucessfully"
        });
  }
  });
}

exports.login = function(req,res){
  var email= req.body.email;
  var password = req.body.password;
  connection.query('SELECT * FROM users WHERE email = ?',[email], function (error, results, fields) {
  if (error) {
    // console.log("error ocurred",error);
    res.send({
      "code":400,
      "failed":"error ocurred"
    })
  }else{
    // console.log('The solution is: ', results);
    if(results.length >0){
      if(results[0].password == password){
        
        sess = req.session;
        sess.email=req.body.email;

        res.redirect('/admin/dashboard');
        // res.send({
        //   "code":200,
        //   "success":"login sucessfull"
        //     });
      }
      else{
        res.send({
          "code":204,
          "success":"Email and password does not match"
            });
      }
    }
    else{
      res.send({
        "code":204,
        "success":"Email does not exits"
          });
    }
  }
  });
}

exports.county = function(req,res){
  console.log("req",req.body);
  
  var county={
    "county":req.body.county,
    
  }
  connection.query('INSERT INTO county SET ?',county, function (error, results, fields) {
  if (error) {
    console.log("error ocurred",error);
    res.send({
      "code":400,
      "failed":"error ocurred"
    })
  }else{
    console.log('The solution is: ', results);
    res.redirect('/admin/county');
  }
  });
}


exports.getcounty = function(req,res){
  connection.query('SELECT * FROM county', function (error, results, fields) {
      if (error) {
        console.log("error ocurred",error);
        res.send({
          "code":400,
          "failed":"error ocurred"
        })
      }else{
        // console.log(results[0]);
        res.json(results);
      }
  });
}

exports.getcity = function(req,res){
  connection.query('SELECT * FROM cities', function (error, results, fields) {
      if (error) {
        console.log("error ocurred",error);
        res.send({
          "code":400,
          "failed":"error ocurred"
        })
      }else{
        // console.log(results[0]);
        res.json(results);
      }
  });
}


exports.city = function(req,res){
  console.log("req",req.body);
  
  var city={
    "city_name":req.body.city_name,
    "county_id":req.body.county_id
  }
  connection.query('INSERT INTO cities SET ?',city, function (error, results, fields) {
  if (error) {
    console.log("error ocurred",error);
    res.send({
      "code":400,
      "failed":"error ocurred"
    })
  }else{
    console.log('The solution is: ', results);
    res.redirect('/admin/city');
  }
  });
}

exports.category = function(req,res){
  console.log("req",req.body);
  
  var category={
    "category_name":req.body.category_name,
    
  }
  connection.query('INSERT INTO categories SET ?',category, function (error, results, fields) {
  if (error) {
    console.log("error ocurred",error);
    res.send({
      "code":400,
      "failed":"error ocurred"
    })
  }else{
    console.log('The solution is: ', results);
    res.redirect('/admin/categories');
  }
  });
}


exports.business = function(req,res){
  console.log("req",req.body);
  console.log(req.files);
  
  if (!req.files)
    return res.status(400).send('No files were uploaded.');

  var file = req.files.image;
  var img_name=file.name;


  var business={
    "title":req.body.title,
    "image": "/static/upload/"+img_name,
    "video":req.body.video,
    "details":req.body.details,
    "city_id":req.body.city_id
  }

  if(file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/gif" ){
                                 
              file.mv('static/upload/'+file.name, function(err) {
                             
               if (err)
                return res.status(500).send(err);

              connection.query('INSERT INTO business SET ?',business, function (error, results, fields) {
              if (error) {
                console.log("error ocurred",error);
                res.send({
                  "code":400,
                  "failed":"error ocurred"
                })
              }else{
                console.log('The solution is: ', results);
                res.redirect('/admin/business');
              }
              });
       

    });
  } 
  else {
            message = "This format is not allowed , please upload file with '.png','.gif','.jpg'";
            res.render('index.ejs',{message: message});
  }

  

}









