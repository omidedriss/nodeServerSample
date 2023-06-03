var colors = require('colors');
var format = require('date-format');


function generate_token(){
    var timestamp = new Date().getTime();
    var hexString = timestamp.toString(16);
    return hexString;
}

function makeid(length) {
    var result           = '';
    var characters       = '0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

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

function sms1(token,receptor) {
         var api_key = '4D6D69614E5533773759674742702B42537366565256745447366371387246454E496174316A6D396A56513D';
          //var token = '5W3s15';
          var template = '2118';
          //var receptor = '09132361588';
          var message = 'salam';
          console.log('sms Called!');
          global.axios.post('https://api.kavenegar.com/v1/'+ api_key +'/verify/lookup.json?receptor='+ receptor +'&token='+ token +'&template='+ template)
		                     
            .then((response) => {
				console.log('Send SMS Success !')
             // console.log(response);
            })
            .catch((error) => {
              console.log(error);
            });
}





// ثبت  نام اولیه کاربر با موبایل و ارسال پیام به تلفن همراه
exports.add_register_user = async function(req, res) {
    console.log("add_register_user Called :".yellow);
    var json_array = [];

    try {
        var body =req.body;
        var db = global.pgp(global.postgresql_connection);

        if ((typeof body.mobile !== "undefined") && (body.mobile !== "") ) {
            const db_data = await db.any("SELECT * FROM users where  mobile= ${mobile}",{
                mobile:body.mobile
            }, [true]);
            if(db_data.length>0)
            {
				// sms1(db_data[0].register_code,body.mobile);
                json_array.push({
                    res: 1,
					//code:db_data[0].register_code,
                    msg:'کاربر گرامی شما قبلا در سامانه ثبت نام انجام داده اید.'
                });
                res.json(json_array);
            }
            else {
                var code=makeid(5)
                const objc1 ={
                    mobile: body.mobile,
                    register_code: code,
                    app_action:0
                }

                var result1 = await db.query('INSERT INTO users(${this:name}) VALUES(${this:csv}) RETURNING id',objc1);

                const objc2 ={
                    user_id: result1[0].id,
                    role_id: 2
                }


                var result2 = await db.query('INSERT INTO public.user_role(${this:name}) VALUES(${this:csv}) RETURNING id',objc2);

               // var msg="کاربر گرامی: کد فعالسازی شما "+code+" می باشد. سامانه 118 مخابرات"
                 sms1(code,body.mobile);
               // sms('09365040469',msg);
                json_array.push({
                    res: 1,
                    code:code,
                    msg:'کاربر گرامی کد فعالسازی به تلفن همراه شما ارسال گردید'

                });
                console.log(json_array);
                res.json(json_array);
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

        // else if((body.email === ""))
        // {
        //     json_array.push({
        //         res: 0,
        //         msg: "لطفا ایمیل را وارد نمایید!"
        //     });
        //     res.send(json_array);
        // }



    } catch (err) {
        console.log(err);
        json_array.push({
            res: 0,
            message: err

        });
        res.send(json_array);
    }
};

// احراز هویت موبایل کاربر با دریافت کد تائیدیه
exports.register_login = async function(req, res) {
    console.log("register_login Called :".yellow);
    var json_array = [];

    try {
        var body =req.body;


        if ((typeof body.mobile !== "undefined") && (body.mobile !== "") && (typeof body.register_code !== "undefined") && (body.register_code !== "")  ) {

            var db = global.pgp(global.postgresql_connection); // database instance;
            const db_data = await db.any("SELECT * FROM users where app_action=0 and mobile= ${mobile} and register_code= ${register_code}",{
                mobile:body.mobile,
                register_code:body.register_code
            }, [true]);

            if (db_data.length > 0) {
                json_array.push({
                    res: 1,
                    id:db_data[0].id,
                    msg:"خوش آمدید!"

                });
                res.json(json_array);
            } else {
                json_array.push({
                    res: 0,
                    msg:"کاربری یافت نشد!"

                });
                res.json(json_array);

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
        else if((body.register_code === ""))
        {
            json_array.push({
                res: 0,
                msg: "لطفا کد فعالسازی را وارد نمایید!"
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

//ورود به سایت 
exports.login = async function(req, res) {
    console.log("Login Called :".yellow);
    

    var json_array = [];
    try {

        var body = req.body;
        console.log(body);

        if((typeof body.username !== "undefined" ) && ( body.username !== "" ) && (typeof body.password !== "undefined" ) && ( body.password !== "" ) && (typeof body.role_id !== "undefined" ))
        {
            fn_login(req,body.username,body.password,body.role_id,function (params) {
                //console.log(params);
                res.send(params);


            });

        }
        else if((typeof body.username === "undefined" ) || ( body.username === "" ))
        {
            json_array.push({
                res : 0,
                msg: "لطفا نام کاربری را وارد نمایید!"
            });
            res.send(json_array);
        }
        else if((typeof body.password === "undefined" ) || ( body.password === "" ))
        {
            json_array.push({
                res : 0,
                msg: "لطفا رمز عبور را وارد نمایید!"
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
async function fn_login(req,username,password,roleid,callback) {
    var json_array = [];
    var office_array = [];
    try {

        var db = global.pgp(global.postgresql_connection); // database instance;
		
		 console.log("roleid "+roleid);
		

        if(roleid==1)
        {
            const db_data = await db.any('SELECT u.name,u.family,u.id as userid,u.email,u.mobile,u.sex,u.reg_date,ul.id as userroleid,ul.role_id FROM users u join user_role ul on u.id=ul.user_id join employee_user on ul.id=employee_user.user_role_id WHERE  employee_user.username = ${username} and employee_user.pass = ${password} ', {
                username: username,
                password: password,

            }, [true]);
            console.log(db_data.length);

            if (db_data.length > 0) {
				
				var secret_key = 'awidpjo23494FB56430232NBFEWK435';
				var refresh_token_secret_key = '7c4clc50-3230-45bf-9eae-c9b2e40lc767';
				
				var token = global.jwt.sign({ user_id:  db_data[0].userid , user_role_id: db_data[0].userroleid }, secret_key, { expiresIn: '1h' });
				var refresh_token = global.jwt.sign({ user_id:  db_data[0].userid , user_role_id: db_data[0].userroleid }, refresh_token_secret_key, { expiresIn: '6h' });
			
                var result = global.session_user_array.filter(function (item) {
                    return item.user_id === db_data[0].userid;
                });

                const db_data1 = await db.any('SELECT *  from role where id=${id}  ', {
                    id:db_data[0].role_id

                }, [true]);

                if ((result.length === 0)) {

                    global.session_user_array.push({
                        token: token,
                        user_id: db_data[0].userid,
                        user_role_id:db_data[0].userroleid,
                    });
                }
                else {


                    console.log(result[0].token);
                    result[0].token=token;
                    console.log("--------change token---------");
                    console.log(result[0].token);
                }
				 await db.any("update users set refresh_token= ${refresh_token} where id=${id}", {
                    
                    id: db_data[0].userid,
                    refresh_token:refresh_token

                }, [true]);



                json_array.push({

                   res: 1,
                    token: token,
                    refresh_token: refresh_token,
                    name: db_data[0].name,
                    family: db_data[0].family,
                    email: db_data[0].email,
                    id_user: db_data[0].userid,
                    user_role_id: db_data[0].userroleid,
                    mobile: db_data[0].mobile,
                    sex:db_data[0].sex,
                   // role_title:db_data1[0].title,
                   // role_id:db_data[0].role_id,

                    msg:"خوش آمدید!"
                });
                console.log("LoginSuccess".green);
                return callback(json_array);

            } else {
                json_array.push({
                    res: 0,
                    msg: "نام کاربری یا رمز عبور وارد شده نامعتبر می باشد!"
                });
                return callback(json_array);

            }
        }
        else
        {
            //const db_data = await db.any('SELECT u.fname,u.lname,u.id as userid,u.nationalcode,u.email,u.mobile,u.reg_date,u.sex,ul.id as userroleid FROM users u join user_role ul on u.id=ul.userid  WHERE ul.roleid=${roleid} and u.username = ${username} and u.password = ${password} ', {

            const db_data = await db.any('SELECT u.name,u.family,u.id as userid,u.email,u.mobile,u.sex,u.reg_date,ul.id as userroleid FROM users u join user_role ul on u.id=ul.user_id  WHERE ul.role_id=2  and u.username = ${username} and u.pass = ${password} ', {
                username: username,
                password: password,

            }, [true]);
              console.log("length "+db_data.length);

            if (db_data.length > 0) {


               // var token = generate_token();
                //var token ='12345';
				
				
				var secret_key = 'awidpjo23494FB56430232NBFEWK435';
				var refresh_token_secret_key = '7c4clc50-3230-45bf-9eae-c9b2e40lc767';
				
				var token = global.jwt.sign({ user_id:  db_data[0].userid , user_role_id: db_data[0].userroleid }, secret_key, { expiresIn: '1h' });
				var refresh_token = global.jwt.sign({ user_id:  db_data[0].userid , user_role_id: db_data[0].userroleid }, refresh_token_secret_key, { expiresIn: '6h' });
			
			
                var result = global.session_customer_array.filter(function (item) {
                    return item.user_id === db_data[0].userid;
                });


                if ((result.length === 0)) {

                    global.session_customer_array.push({
                        token: token,
                        user_id: db_data[0].userid,
                        user_role_id: db_data[0].userroleid,

                    });
                }
                else {
                    console.log(result[0].token);
                    result[0].token=token;
                    console.log("--------change token---------");
                    console.log(result[0].token);
                }


                const db_data1 = await db.any('SELECT * FROM user_role  WHERE role_id=3 and app_action=1 and user_id = ${user_id}  ', {
                    user_id: db_data[0].userid,

                }, [true]);
                if (db_data1.length > 0) {
                    const db_data2 = await db.any('SELECT office.*,office_user.id as officeuserid FROM office_user join office on office_user.office_id=office.id  WHERE office_user.user_role_id=${user_role_id} and office_user.app_action=1 ', {
                        user_role_id: db_data1[0].id,

                    }, [true]);
					if(db_data2.length>0)
					{
                    var result1 = global.session_office_array.filter(function (item) {
                        return item.office_id === db_data2[0].id;
                    });
					 
					
                    //console.log(result1);

                    if ((result1.length === 0)) {
                        global.session_office_array.push({
                            token: token,
                            user_id: db_data[0].userid,
                            office_id: db_data2[0].id,
                            office_user_id: db_data2[0].officeuserid,
                            //  user_role_id: db_data1[0].id,
                        });}
                    else {

                       result1[0].token=token;
                        console.log(result1[0].token);
                        console.log("--------change token---------");
                        console.log(result1[0].token);
                    }
					}
					


                    for (var i = 0; i < db_data2.length ; i++) {

                        office_array.push({
                            office_id: db_data2[i].id,
                            office_title:db_data2[i].title,
                            office_user_id: db_data2[i].officeuserid,

                        });
                    }

                }

              console.log("token "+token);

                json_array.push({

                   // res: 1,
                    token:token,
                    refresh_token:refresh_token,
                    name: db_data[0].name,
                    family: db_data[0].family,
                    email: db_data[0].email,
                    id_user: db_data[0].userid,
                    user_role_id: db_data[0].userroleid,
                    mobile: db_data[0].mobile,
                  //  office_aray:office_array,
                    msg:"خوش آمدید!"
                });

                // console.log("-----------------------global.session_customer_array");
                // console.log(global.session_customer_array);
                //
                //
                // console.log("-----------------------global.session_office_array");
                // console.log(global.session_office_array);


                console.log("LoginSuccess".green);
                //console.log(json_array);
                return callback(json_array);

            } else {
                json_array.push({
                    res: 0,
                    msg: "نام کاربری یا رمز عبور وارد شده نامعتبر می باشد!"
                });
                return callback(json_array);

            }
        }




    } catch (e) {
        console.log(e);
        json_array.push({
            res: 0,
            message: e

        });
        return callback(json_array);
    }
}

// دریافت اطلاعات کاربر بعد از لاگین
exports.user = async function(req, res) {
    console.log(" user :".yellow);
   
    var json_array = [];
    var office_array = [];
    var _user = {};
    try {
		console.log(' req.headers : ' ,  req.headers )
let _token = req.headers["authorization"];

if(_token){
	console.log('TOKEN OK')
	const checkBearer = "Bearer ";
	if (_token.startsWith(checkBearer)) {
		_token = _token.slice(checkBearer.length, _token.length);
		
		console.log('Bearer token : ' , _token)
	}else{
		console.log('Bearer token : ERROR')
	}
}else{
	console.log('TOKEN error')
}




        var body = req.body;
       // console.log(req.Bearer);
        //console.log(req);
       // console.log(req.headers.authorization);
		//var token=req.headers.authorization;
		var token=_token;
          var db = global.pgp(global.postgresql_connection); // database instance;

           var result = global.session_customer_array.filter(function (item) {
                    return item.token === token;
                });
			 if ((result.length >0)) {
				 
				 var userid=result[0].user_id;
				 console.log("userid "+userid);
				 const db_data = await db.any('SELECT u.*,ul.id as userroleid FROM users u join user_role ul on u.id=ul.user_id  WHERE u.id=${id} and u.app_action=1 ', {
                id: userid,
                
            }, [true]);
			if(db_data.length>0)
			{
				 const db_data1 = await db.any('SELECT * FROM user_role  WHERE role_id=3 and app_action=1 and user_id = ${user_id}  ', {
                    user_id: userid,

                }, [true]);
                    const db_data2 = await db.any('SELECT office.*,office_user.id as officeuserid FROM office_user join office on office_user.office_id=office.id  WHERE office_user.user_role_id=${user_role_id} and office_user.app_action=1 and office.app_action<>2', {
                        user_role_id: db_data1[0].id,

                    }, [true]);
					
					if(db_data2.length>0)
					{
						 for (var i = 0; i < db_data2.length ; i++) {
					
						 const db_data1 = await db.any("SELECT * FROM office_group where id=${id}",{id:db_data2[i].group_id}, [true]);
                const db_data20 = await db.any("SELECT * FROM office_user where office_id=${id}",{id:db_data2[i].id}, [true]);
				
			 var phone_array=[];
                const db_data11 = await db.any("SELECT * from office_tel where office_user_id=${office_user_id} and app_action=1 ",{
                    office_user_id:db_data20[0].id
                }, [true]);
                if(db_data11.length>0)
				{
					for(var k=0;k<db_data11.length;k++)
					{
                    phone_array.push({
						tel:db_data11[k].tel,
						type:db_data11[k].ttype,
						id:db_data11[k].id,
                    
					});
					}
				}
				
				var galery_array=[];
                const db_data12 = await db.any("SELECT * from office_galery where office_user_id=${office_user_id} and app_action=1 ",{
                    office_user_id:db_data20[0].id
                }, [true]);
                if(db_data12.length>0)
				{
					for(var k=0;k<db_data12.length;k++)
					{
                    galery_array.push({
						
						img:server_upload_folder+db_data12[k].img,
						id:db_data12[k].id,
					});
					}
				}
				
				console.log("office_galery "+db_data12.length);
				
				var pic360_array=[];
                const db_data13 = await db.any("SELECT * from office_360 where office_user_id=${office_user_id} and app_action=1 ",{
                    office_user_id:db_data20[0].id
                }, [true]);
                if(db_data13.length>0)
				{
					for(var k=0;k<db_data13.length;k++)
					{
                    pic360_array.push({
						
						img:server_upload_folder+db_data13[k].img,
						id:db_data13[k].id,
					});
					}
				}
				
				var branch_array=[];
                const db_data14 = await db.any("SELECT * from office_branch where office_user_id=${office_user_id} and app_action=1 ",{
                    office_user_id:db_data20[0].id
                }, [true]);
                if(db_data14.length>0)
				{
					for(var k=0;k<db_data14.length;k++)
					{
                    branch_array.push({
						
						branch_name:db_data14[k].branch_name,
						address:db_data14[k].address,
						tel:db_data14[k].tel,
						manager:db_data14[k].manager,
						city_id:db_data14[k].city_id,
						postal_code:db_data14[k].postal_code,
						latetiud:db_data14[k].latetiud,
						longetiud:db_data14[k].longetiud,
						id:db_data14[k].id,
					});
					}
				}
				
				var link_array=[];
                const db_data15 = await db.any("SELECT * from office_link where office_user_id=${office_user_id} and app_action=1 ",{
                    office_user_id:db_data20[0].id
                }, [true]);
                if(db_data15.length>0)
				{
					for(var k=0;k<db_data15.length;k++)
					{
                    link_array.push({
						
						socialnetwork_id:db_data15[k].socialnetwork_id,
						//title:db_data15[k].title,
						link:db_data15[k].link,
						//website:db_data15[k].website,
						//email:db_data15[k].email,
						id:db_data15[k].id,
						
					});
					}
				}
				
				var worktime_array=[];
                const db_data16 = await db.any("SELECT * from office_worktime where office_user_id=${office_user_id} and app_action=1 ",{
                    office_user_id:db_data20[0].id
                }, [true]);
                if(db_data16.length>0)
				{
					for(var k=0;k<db_data16.length;k++)
					{
                    worktime_array.push({
						
						week:db_data16[k].week,
						time1:db_data16[k].time1,
						time2:db_data16[k].time2,
						priority:db_data16[k].priority,
						id:db_data16[k].id,
						
					});
					}
				}
				
               

                   	
						
                        office_array.push({
                            office_id: db_data2[i].id,
                            office_title:db_data2[i].title,
                            office_user_id: db_data2[i].officeuserid,
                            address: db_data2[i].address,
                             group_id: db_data2[i].group_id,
                             latetiud: db_data2[i].latetiud,
                             longetiud: db_data2[i].longetiud,
					         city_id:db_data2[i].city_id,
                             postal_code:db_data2[i].postal_code,
                             website: db_data2[i].website,
                             email: db_data2[i].email,
                             about: db_data2[i].about,
							 logo:global.server_upload_folder+db_data2[i].logo,
							 cover:global.server_upload_folder+db_data2[i].cover,
							 phone:phone_array,
							 worktime:worktime_array,
							 link:link_array,
							 branch:branch_array,
							 pic360:pic360_array,
							 galery:galery_array,

                        });
                    }
					}
	
                _user = {
					token: token,
					name: db_data[0].name,
                    family: db_data[0].family,
                    email: db_data[0].email,
                    mobile: db_data[0].mobile,
                    sex:db_data[0].sex,
					user_id:db_data[0].id,
					user_role_id:db_data[0].userroleid,
					office:office_array
				   };
				 
			 }	
			 }
			 
			// json_array.push({user:user1});
			 
			 // console.log(json_array);
                res.send({user: _user});
              

       

    } catch (err) {
        console.log(err);
        json_array.push({
            res: 0,
            message: err

        });
        res.send(json_array);
    }
};


exports.refresh_token_user = async function(req, res) {
    console.log("refresh_token_user :".yellow);
   
    var json_array = [];
    try {

        var body = req.body;
        
          var db = global.pgp(global.postgresql_connection); // database instance;
            
				
			  const db_data1 = await db.any('SELECT * FROM users  WHERE refresh_token = ${refresh_token}  ', {
                    refresh_token: body.refresh_token,

                }, [true]);
                    
					if(db_data1.length>0)
					{
						 const db_data = await db.any('SELECT  * FROM  user_role  WHERE role_id=2  and user_id = ${id} ', {
                              id: db_data1[0].id,
                             
                        }, [true]);
                       var secret_key = 'awidpjo23494FB56430232NBFEWK435';
				       var refresh_token_secret_key = '7c4clc50-3230-45bf-9eae-c9b2e40lc767';
				
				      var token = global.jwt.sign({ user_id:  db_data1[0].id , user_role_id: db_data[0].id }, secret_key, { expiresIn: '1h' });
				      var refresh_token = global.jwt.sign({ user_id:  db_data1[0].id , user_role_id: db_data[0].id }, refresh_token_secret_key, { expiresIn: '6h' });
					  
					  var result = global.session_customer_array.filter(function (item) {
                    return item.user_id === db_data1[0].id;
                });


                if ((result.length === 0)) {

                    global.session_customer_array.push({
                        token: token,
                        user_id: db_data1[0].id,
                        user_role_id: db_data[0].id,

                    });
                }
                else {
                    console.log(result[0].token);
                    result[0].token=token;
                    console.log("--------change token---------");
                    console.log(result[0].token);
                }


                const db_data10 = await db.any('SELECT * FROM user_role  WHERE role_id=3 and app_action=1 and user_id = ${user_id}  ', {
                    user_id: db_data1[0].id,

                }, [true]);
                if (db_data10.length > 0) {
                    const db_data2 = await db.any('SELECT office.*,office_user.id as officeuserid FROM office_user join office on office_user.office_id=office.id  WHERE office_user.user_role_id=${user_role_id} and office_user.app_action=1 ', {
                        user_role_id: db_data10[0].id,

                    }, [true]);
                    var result1 = global.session_office_array.filter(function (item) {
                        return item.office_id === db_data2[0].id;
                    });
                    //console.log(result1);

                    if ((result1.length === 0)) {
                        global.session_office_array.push({
                            token: token,
                            user_id: db_data1[0].id,
                            office_id: db_data2[0].id,
                            office_user_id: db_data2[0].officeuserid,
                            //  user_role_id: db_data1[0].id,
                        });}
                    else {

                        result1[0].token=token;
                        console.log(result1[0].token);
                        console.log("--------change token---------");
                        console.log(result1[0].token);
                    }


                   

                }
					  
					  
					   json_array.push({

                    token: token,
                    refresh_token: refresh_token,
                  
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

// خروج کاربر
exports.Logout = async function(req, res) {
    console.log("Logout :".yellow);
    var json_array = [];

    try {
        var session_data = AUTH_customer(req.body);
        if (typeof session_data !== "undefined" && session_data !== -1) {
            FunLogout(session_data.user_id,function (x) {

                if(x===1)
                {
                    json_array.push({
                        res: 1,
                        msg: "با موفقیت خارج شدید"
                    });
                    res.send(json_array);
                }
                else
                {
                    json_array.push({
                        res: 0,
                        msg: "خطایی در خروج شما رخ داده"
                    });
                    res.send(json_array);
                }
            })


        } else {
            json_array.push({
                res: 0,
                msg: "خطایی در خروج شما رخ داده"
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
async function FunLogout (user_id,callback) {

    try {

        for (var i = 0; i < global.session_customer_array.length; i++) {
            if (global.session_customer_array[i].user_id === user_id)
                global.session_customer_array.splice(i, 1);
        }

        for (var i = 0; i < global.session_office_array.length; i++) {
            if (global.session_office_array[i].user_id === user_id)
                global.session_office_array.splice(i, 1);
        }

        return callback(1);


    } catch (err) {
        console.log(err);
        return callback(0);
    }


};

