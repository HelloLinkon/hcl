var mysql      = require('mysql');
var path = require('path');

var fs = require('fs');
var csv = require('fast-csv');


var config = require('./config.js');
var db = config.database;

var connection = mysql.createConnection({
  host     : db.host,
  user     : db.user,
  password : db.password,
  database : db.database,
  multipleStatements: true
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
  // console.log("req",req.body);

  // var county={
  //   "county":req.body.county,

  // }

  // console.log("county :" + county);
  // connection.query('INSERT INTO county SET ?',county, function (error, results, fields) {
  // if (error) {
  //   console.log("error ocurred",error);
  //   res.send({
  //     "code":400,
  //     "failed":"error ocurred"
  //   })
  // }else{
  //   console.log('The solution is: ', results);
  //   res.redirect('/admin/county');
  // }
  // });


  console.log("req",req.body);
  console.log(req.files);

  if (!req.files)
    return res.status(400).send('No files were uploaded.');

  var file = req.files.cat_img;
  var img_name=file.name;



  var county={
    "county":req.body.county,
    "cat_img": "/static/upload/"+img_name

  }


  if(file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/gif" ){

              file.mv('static/upload/'+file.name, function(err) {

               if (err)
               {
                 console.log("failed to move file");
                 return res.status(500).send(err);
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



    });
  }
  else {
            message = "This format is not allowed , please upload file with '.png','.gif','.jpg'";
            res.render('index.ejs',{message: message});
  }
}


exports.getcounty = function(req,res){
  connection.query('SELECT * FROM county order by county', function (error, results, fields) {
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




exports.getFavorite = function(req,res){

  var id = req.params.user;
  connection.query('select * from cities, business where cities.id = business.city_id and business.users LIKE "%'+ id +'%"', id, function (error, results, fields) {
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

exports.addFavorite = function(req,res){

    var fav={
    "business_id":req.body.id,
    "user_id":req.body.user
    }

    connection.query("select users from business where id = ? ",req.body.id, function(error, results, fields){

        if(error)
        {
          console.log("error ocurred",error);
        }
        else{

          console.log('The users are: ', results[0].users);
          var a;
          if(results[0].users == null)
          {

             a = req.body.user;
          }
          else{
            a = results[0].users;
            a = a + "," + req.body.user;
          }






          connection.query('UPDATE business SET users = ? WHERE id = ' + req.body.id ,a, function (error, results, fields) {
            if (error) {
              console.log("error ocurred",error);
              res.send({
                "code":400,
                "failed":"error ocurred"
              })
            }else{
              console.log('The solution is: ', results);

            }
          });


        }

    });


    // connection.query('INSERT INTO favorite SET ?',fav, function (error, results, fields) {
    // if (error) {
    //   console.log("error ocurred",error);
    //   res.send({
    //     "code":400,
    //     "failed":"error ocurred"
    //   })
    // }else{
    //   console.log('The solution is: ', results);
    //   // res.json("yes");
    // }
    // });

}

exports.citiesofcounty = function(req,res){
  var id = req.params.county;
  connection.query('SELECT * FROM cities, county WHERE county.county = ? and cities.county_id = county.id', id, function (error, results, fields) {
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

exports.getcategory = function(req,res){
  connection.query('SELECT * FROM categories ORDER BY category_name', function (error, results, fields) {
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
  console.log(req.files);

  if (!req.files)
    return res.status(400).send('No files were uploaded.');

  var file = req.files.cat_img;
  var img_name=file.name;



  var category={
    "category_name":req.body.category_name,
    "cat_img": "/static/upload/"+img_name

  }


  if(file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/gif" ){

              file.mv('static/upload/'+file.name, function(err) {

               if (err)
               {
                 console.log("failed to move file");
                 return res.status(500).send(err);
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



    });
  }
  else {
            message = "This format is not allowed , please upload file with '.png','.gif','.jpg'";
            res.render('index.ejs',{message: message});
  }



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
    "city_id":req.body.city_id,
    "county_id":req.body.county_id,
    "category":req.body.category,
    "state":req.body.state,
    "priority":req.body.priority,
    "website":req.body.website,
    "phone":req.body.phone,
    "address":req.body.address

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


exports.edit_business = function(req,res){
  console.log("req",req.body);
  console.log("param id " + req.params.id);
  console.log(req.files);

  if (Object.keys(req.files).length === 0)
  {


    var business={
      "title":req.body.title,
      "video":req.body.video,
      "details":req.body.details,
      "city_id":req.body.city_id,
      "county_id":req.body.county_id,
      "category":req.body.category,
      "state":req.body.state,
      "priority":req.body.priority,
      "website":req.body.website,
      "phone":req.body.phone,
      "address":req.body.address
    }





                connection.query('UPDATE business SET ? WHERE id = ' + req.params.id, business, function (error, results, fields) {
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





  }
  else{

    var file = req.files.image;
    var img_name=file.name;


    var business={
      "title":req.body.title,
      "image": "/static/upload/"+img_name,
      "video":req.body.video,
      "details":req.body.details,
      "city_id":req.body.city_id,
      "county_id":req.body.county_id,
      "category":req.body.category,
      "state":req.body.state,
      "priority":req.body.priority,
      "website":req.body.website,
      "phone":req.body.phone,
      "address":req.body.address
    }

    if(file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/gif" ){

                file.mv('static/upload/'+file.name, function(err) {

                 if (err)
                  return res.status(500).send(err);

                connection.query('UPDATE business SET ? WHERE id = ' + req.params.id, business, function (error, results, fields) {
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





}


exports.edit_category = function(req,res){
  console.log("req",req.body);
  console.log(req.files);

  if (!req.files)
    return res.status(400).send('No files were uploaded.');

  var file = req.files.cat_img;
  var img_name=file.name;



  var category={
    "category_name":req.body.category_name,
    "cat_img": "/static/upload/"+img_name

  }


  if(file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/gif" ){

              file.mv('static/upload/'+file.name, function(err) {

               if (err)
                return res.status(500).send(err);

              connection.query('UPDATE categories SET ? WHERE id = '+ req.params.id ,category, function (error, results, fields) {
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



    });
  }
  else {
            message = "This format is not allowed , please upload file with '.png','.gif','.jpg'";
            res.render('index.ejs',{message: message});
  }



}

exports.edit_county = function(req,res){
  console.log("req",req.body);
  console.log(req.files);

  if (!req.files)
    return res.status(400).send('No files were uploaded.');

  var file = req.files.cat_img;
  var img_name=file.name;



  var county={
    "county":req.body.county,
    "cat_img": "/static/upload/"+img_name

  }


  if(file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/gif" ){

              file.mv('static/upload/'+file.name, function(err) {

               if (err)
                return res.status(500).send(err);

              connection.query('UPDATE county SET ? WHERE id = '+ req.params.id ,county, function (error, results, fields) {
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



    });
  }
  else {
            message = "This format is not allowed , please upload file with '.png','.gif','.jpg'";
            res.render('index.ejs',{message: message});
  }



}


exports.countyUpload = function(req, res){

  if (!req.files)
    return res.status(400).send('No files were uploaded.');

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let sampleFile = req.files.sampleFile;

  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv('static/upload/'+ sampleFile.name, function(err) {
    if (err)
      return res.status(500).send(err);

      var stream = fs.createReadStream("static/upload/" + sampleFile.name);
      var csvStream = csv()
        .on("data", function(data){
             console.log(data[0]);
             var county={
                "county": data[0],

              }

              console.log("county :" + county);
              connection.query('INSERT INTO county SET ?',county, function (error, results, fields) {
              if (error) {
                console.log("error ocurred",error);
                res.send({
                  "code":400,
                  "failed":"error ocurred"
                })
              }else{
                console.log('The solution is: ', results);
              }
              });
        })
        .on("end", function(){
             console.log("done");
        });

      stream.pipe(csvStream);

      res.redirect('/admin/county');
      // res.send('File uploaded!');
  });

}


exports.cityUpload = function(req, res){

  if (!req.files)
    return res.status(400).send('No files were uploaded.');

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let sampleFile = req.files.sampleFile;

  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv('static/upload/'+ sampleFile.name, function(err) {
    if (err)
      return res.status(500).send(err);

      var stream = fs.createReadStream("static/upload/" + sampleFile.name);
      var csvStream = csv()
        .on("data", function(data){
             console.log(data[0]);
             var city={
                "city_name": data[0],
                "county_id": data[1]
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
              }
              });
        })
        .on("end", function(){
             console.log("done");
        });

      stream.pipe(csvStream);

      res.redirect('/admin/city');
      // res.send('File uploaded!');
  });

}


exports.categoryUpload = function(req, res){

  if (!req.files)
    return res.status(400).send('No files were uploaded.');

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let sampleFile = req.files.sampleFile;

  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv('static/upload/'+ sampleFile.name, function(err) {
    if (err)
      return res.status(500).send(err);

      var stream = fs.createReadStream("static/upload/" + sampleFile.name);
      var csvStream = csv()
        .on("data", function(data){
             console.log(data[0]);
             var category={
                "category_name": data[0],
                "cat_img": "/static/upload/"+ data[1]

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
              }
              });
        })
        .on("end", function(){
             console.log("done");
        });

      stream.pipe(csvStream);

      res.redirect('/admin/categories');
      // res.send('File uploaded!');
  });

}

exports.buisnessUpload = function(req, res){

  if (!req.files)
    return res.status(400).send('No files were uploaded.');

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let sampleFile = req.files.sampleFile;

  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv('static/upload/'+ sampleFile.name, function(err) {
    if (err)
      return res.status(500).send(err);

      var stream = fs.createReadStream("static/upload/" + sampleFile.name);
      var csvStream = csv()
        .on("data", function(data){
             console.log(data[0]);
             var business={
                "title": data[0],
                "image": "/static/upload/"+ data[9],
                "video":data[10],
                "details": data[8],
                "city_id":data[4],
                "county_id" : data[5],
                "category":data[7],
                "priority":data[6],
                "website":data[1],
                "phone": data[2],
                "address": data[3],
                "state": data[11]

              }

              connection.query('INSERT INTO business SET ?',business, function (error, results, fields) {
              if (error) {
                console.log("error ocurred",error);
                res.send({
                  "code":400,
                  "failed":"error ocurred"
                })
              }else{
                console.log('The solution is: ', results);
              }
              });
        })
        .on("end", function(){
             console.log("done");
        });

      stream.pipe(csvStream);

      res.redirect('/admin/business');
      // res.send('File uploaded!');
  });

}



