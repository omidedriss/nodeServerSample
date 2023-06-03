var colors = require('colors');
var format = require('date-format');

function sms(mobile,sms) {
    console.log("sms "+ mobile)
    global.request.post({
        url: 'http://ippanel.com/api/select',
        body: {
            "op" : "send",
            "uname" : "2118",
            "pass":  "qazZAQ123456",
            "message" : sms,
            "from": "5000125475",
            "to" : [mobile],

        },
        json: true,
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            //YOU‌ CAN‌ CHECK‌ THE‌ RESPONSE‌ AND SEE‌ ERROR‌ OR‌ SUCCESS‌ MESSAGE
            console.log(response.body);
        } else {
            console.log("whatever you want");

        }
    });
}



exports.identity_customer= async function(req, res) {
    var js_array = [];
    console.log("identity_customer :".yellow);
    // console.log(req.body.token);
    //
    // console.log("-----------------------global.session_customer_array");
    // console.log(global.session_customer_array);
    //
    // console.log("-----------------------global.session_office_array");
    // console.log(global.session_office_array);


    if (typeof req.body.token !== "undefined") {
        var result = global.session_customer_array.filter(function (item) {
            return item.token === req.body.token;
        });
        //console.log(result);

        if ((result.length > 0)) {

            js_array.push({
                res: 1,
            });
            res.send(js_array);

        } else {
            js_array.push({
                res: -1,
            });
            res.send(js_array);
        }
    } else {
        js_array.push({
            res: -1,
        });
        res.send(js_array);
    }

}

//ثبت کاربر
exports.add_user = async function(req, res) {
    console.log("add_user Called :".yellow);
    var json_array = [];
    var flag=0;
    try {
        var body =req.body;
        console.log(body);
        if(body.role_id===1){
            var session_data = AUTH(req.body);

            if (typeof session_data !== "undefined" && session_data !== -1) {
                flag=1;
            } else {
                json_array.push({
                    res: -1,
                    msg: "لطفا مجددا وارد شوید!"
                });
                res.send(json_array);
            }

            //console.log(session_data);
        }
        else {
            flag=1;
        }

        if(flag===1)
        {
            if(body.role_id===1)
            {
                if((typeof body.mobile === "undefined") || (body.mobile === "")) {
                    flag=0;
                    json_array.push({
                        res: 0,
                        msg: "لطفا تلفن همراه را وارد نمایید!"
                    });
                    res.send(json_array);
                }
                if((typeof body.user === "undefined") || (body.user === "")) {
                    flag=0;
                    json_array.push({
                        res: 0,
                        msg: "لطفا نام کاربری را وارد نمایید!"
                    });
                    res.send(json_array);
                }
                // if((typeof body.pass === "undefined") || (body.pass === "")) {
                //      flag=0;
                //      json_array.push({
                //          res: 0,
                //          msg: "لطفا رمز عبور را وارد نمایید!"
                //      });
                //      res.send(json_array);
                //  }
                //


            }
            if(flag===1) {

                if ((typeof body.name !== "undefined") && (body.name !== "") && (typeof body.family !== "undefined") && (body.family !== "")  && (typeof body.password !== "undefined") && (body.password !== "")) {

                    Func_add_user(body.name, body.family, body.mobile, body.user, body.password, body.email,body.sex, body.role_id, body.part_aray, function (param) {
                        console.log(param);
                        res.send(param);

                    });
                } else if ((body.name === "")) {
                    json_array.push({
                        res: 0,
                        msg: "لطفا نام را وارد نمایید!"
                    });
                    res.send(json_array);
                } else if ((body.family === "")) {
                    json_array.push({
                        res: 0,
                        msg: "لطفا نام خانوادگی را وارد نمایید!"
                    });
                    res.send(json_array);
                }
                // else if ((body.mobile === "")) {
                //     json_array.push({
                //         res: 0,
                //         msg: "لطفا تلفن همراه را وارد نمایید!"
                //     });
                //     res.send(json_array);
                // }
                // else if ((body.user === "")) {
                //     json_array.push({
                //         res: 0,
                //         msg: "لطفا نام کاربری را وارد نمایید!"
                //     });
                //     res.send(json_array);
                // }
                else if ((body.password === "")) {
                    json_array.push({
                        res: 0,
                        msg: "لطفا رمز عبور را وارد نمایید!"
                    });
                    res.send(json_array);
                }
                // else if ((body.email === "")) {
                //     json_array.push({
                //         res: 0,
                //         msg: "لطفا ایمیل را وارد نمایید!"
                //     });
                //     res.send(json_array);
                // }
                else  if( body.sex === "") {
                    flag=0;
                    json_array.push({
                        res: 0,
                        msg: "لطفا جنسیت را وارد نمایید!"
                    });
                    res.send(json_array);
                }

            }
        }
    } catch (err) {
        console.log(err);
        json_array.push({
            res: 0,
            message: err

        });
        res.send(json_array);
    }
};
async function Func_add_user (name,family,mobile,user,pass,email,sex,role_id,part_aray,callback) {

    var json_array = [];

    try {
        var db = global.pgp(global.postgresql_connection); // database instance;

        var db_data4 =await db.any("SELECT * FROM users where app_action=1 and mobile= ${mobile}", {
            mobile: mobile
        }, [true]);
              console.log(db_data4.length);
        if (db_data4.length > 0) {
			

            var db_data5 = await db.any("SELECT * FROM user_role where app_action = 1 and user_id= ${user_id} and role_id=${role_id}", {
                user_id: db_data4[0].id,
                role_id: role_id,

            }, [true]);
            if (db_data5.length > 0) {

                await db.any("update users set name= ${name}, family= ${family}, username= ${user}, pass= ${pass}, email= ${email},sex= ${sex} where id=${id}", {
                    name: name,
                    family: family,
                    user: mobile,
                    pass: pass,
                    email: email,
                    sex:sex,
                    id: db_data4[0].id,
                    app_action:1

                }, [true]);

                json_array.push({
                    res: 1,
                    msg: 'اطلاعات با موفقیت ثبت شد!',

                });
                // json_array.push({
                //     res: 0,
                //     msg: 'برای این شخص قبلا این نقش ثبت شده است!',
                //
                // });
                return callback(json_array);
            } else {

                const objc2 ={
                    user_id: db_data4[0].id,
                    role_id: role_id
                }


                var result2 = await db.query('INSERT INTO public.user_role(${this:name}) VALUES(${this:csv}) RETURNING id',objc2);

                if (role_id === 1) {
                    const db_data = await db.none('INSERT INTO employee_user(user_role_id,username,pass) VALUES(${user_role_id},${user},${pass})', {
                        user_role_id: result2[0].id,
                        user: user,
                        pass: pass,

                    })
                    if((typeof part_aray !== "undefined") && part_aray.length>0)
                    {
                        for(var i=0;i<part_aray;i++)
                        {
                            const db_data1= await db.none('INSERT INTO part_user(user_role_id,part_id) VALUES(${user_role_id},${part_id})', {
                                user_role_id: result2[0].id,
                                part_id: part_aray[i],

                            })
                        }
                    }




                    json_array.push({
                        res: 1,
                        msg: 'اطلاعات با موفقیت ثبت شد!',

                    });

                    return callback(json_array);


                }  else {
                    json_array.push({
                        res: 1,
                        msg: 'اطلاعات با موفقیت ثبت شد!',

                    });
                    return callback(json_array);
                }



            }} else {

            var db_data3 = await  db.any("SELECT * FROM users  where app_action=1 and username= ${username}", {
                username: user
            }, [true]);

            if (db_data3.length > 0 )  {
                json_array.push({
                    res: 0,
                    msg: 'این نام کاربری توسط شخص دیگری انتخاب شده است!',

                });
                return callback(json_array);
            }
            else {

                if (role_id !== 1) {
                    const objc1 = {
                        name: name,
                        family: family,
                        username: mobile,
                        pass: pass,
                        mobile: mobile,
                        email: email,
                        sex:sex

                    }
                    var result1 = await db.query('INSERT INTO public.users(${this:name}) VALUES (${this:csv}) RETURNING id', objc1);

                    const objc2 = {
                        user_id: result1[0].id,
                        role_id: role_id
                    }
                    var result2 = await db.query('INSERT INTO public.user_role(${this:name}) VALUES(${this:csv}) RETURNING id', objc2);

                    json_array.push({
                        res: 1,
                        msg: 'اطلاعات با موفقیت ثبت شد!',

                    });
                    return callback(json_array);

                } else {
                    const objc1 = {
                        name: name,
                        family: family,
                        mobile: mobile,
                        email: email,
                        sex: sex,

                    }
                    var result1 = await db.query('INSERT INTO public.users(${this:name}) VALUES (${this:csv}) RETURNING id', objc1);

                    const objc2 = {
                        user_id: result1[0].id,
                        role_id: role_id
                    }
                    console.log(result1[0].id);
                    var result2 = await db.query('INSERT INTO public.user_role(${this:name}) VALUES(${this:csv}) RETURNING id', objc2);
                    console.log(result2[0].id);
                    const db_data = await db.none('INSERT INTO employee_user(user_role_id,username,pass) VALUES(${user_role_id},${user},${pass})', {
                        user_role_id: result2[0].id,
                        user: user,
                        pass: pass,

                    })
                    if((typeof part_aray !== "undefined") && part_aray.length>0)
                    {
                        for(var i=0;i<part_aray;i++)
                        {
                            const db_data1= await db.none('INSERT INTO part_user(user_role_id,part_id) VALUES(${user_role_id},${part_id})', {
                                user_role_id: result2[0].id,
                                part_id: part_aray[i],

                            })
                        }
                    }
                    json_array.push({
                        res: 1,
                        msg: 'اطلاعات با موفقیت ثبت شد!',

                    });
                    return callback(json_array);
                }
            }
        }


    } catch (err) {
        console.log(err);
        json_array.push({
            res: 0,
            message: err

        });

        return callback(json_array);
    }


};
//ویرایش اطلاعات کاربر
exports.edit_user = async function(req, res) {
    console.log("edit_user Called :".yellow);
    var json_array = [];
 
  
    try {
        var body =req.body;
        console.log(body);
       
           var result = global.session_customer_array.filter(function (item) {
                    return item.token === body.token;
                });
			 if ((result.length >0)) {
				 
				 var userid=result[0].user_id;

                if ((typeof body.name !== "undefined") && (body.name !== "") && (typeof body.family !== "undefined") && (body.family !== "")  ) {
					
					 var db = global.pgp(global.postgresql_connection); // database instance;
                   const db_data = await db.none("update users set name= ${name}, family= ${family}, email= ${email},pass= ${pass} where id=${id}", {
                    name: body.name,
                    family: body.family,
                    //user: body.user,
                    pass: body.password,
                    email: body.email,
                    //sex:body.sex,
					id:userid
                   
                }, [true]);

                json_array.push({
                    res: 1,
                    msg: 'اطلاعات با موفقیت ویرایش شد !',

                });
				res.send(json_array);
				
                } else if ((body.name === "")) {
                    json_array.push({
                        res: 0,
                        msg: "لطفا نام را وارد نمایید!"
                    });
                    res.send(json_array);
                } else if ((body.family === "")) {
                    json_array.push({
                        res: 0,
                        msg: "لطفا نام خانوادگی را وارد نمایید!"
                    });
                    res.send(json_array);
                }
                // else if ((body.mobile === "")) {
                //     json_array.push({
                //         res: 0,
                //         msg: "لطفا تلفن همراه را وارد نمایید!"
                //     });
                //     res.send(json_array);
                // }
                 
                // else if ((body.email === "")) {
                //     json_array.push({
                //         res: 0,
                //         msg: "لطفا ایمیل را وارد نمایید!"
                //     });
                //     res.send(json_array);
                // }
               
			 }
			 else 
				 {
                    json_array.push({
                        res: 0,
                        msg:'اطلاعاتی یافت نشد',
                    });
                    res.send(json_array);
                }
        
    } catch (err) {
        console.log(err);
        json_array.push({
            res: 0,
            message: err

        });
        res.send(json_array);
    }
};
//فراموشی رمز عبور
exports.forget_password= async function(req, res) {
    console.log("forget_password Called :".yellow);
    var json_array = [];
    try {

      //  var session_data = AUTH_customer(req.body);

     
            var body =req.body;

            if ((typeof body.mobile !== "undefined") && (body.mobile !== "") ) {
              var db = global.pgp(global.postgresql_connection); // database instance;
              const db_data = await db.any("SELECT * from users where mobile=${mobile} and app_action=1",{
                  mobile:req.body.mobile
              }, [true]);

              if (db_data.length > 0) {
                  var pass=makeid(6);
                  var msg="کاربر گرامی کلمه عبور شما "+pass+" می باشد."
                  sms(body.mobile,msg);
                              var db_data1 = await db.any("update users set pass= ${pass} where id= ${id}", {
                                  pass:pass,
                                  id: db_data[0].id,
                              }, [true]);

                              json_array.push({
                                  res: 1,
                                  msg: "کاربر گرامی کلمه عبور جدید به تلفن همراه شما ارسال گردید"
                              });
                              res.send(json_array);

              }
              else
              {
                  json_array.push({
                      res: 0,
                      msg: "تلفن همراه وارد شده معتبر نمی باشد!"
                  });
                  res.send(json_array);
              }



            }
            else if((body.mobile === ""))
            {
                json_array.push({
                    res: 0,
                    msg: "لطفا تلفن همراه را وارد نمایید!"
                });
                res.send(json_array);
            }

      
    } catch (err) {
        console.log(err);
        json_array.push({
            res: 0,
            message: err

        });
        res.send(json_array);
    }
};

