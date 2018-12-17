



const express = require('express')
let app =new express();/**实例化一下 */
const md5 = require('md5-node');/*md5 加密*/
const multiparty = require('multiparty');/**图片上传的的板块 也可以获取到form表单数据  也可以上传图片*/
var fs = require('fs');

//获取post
let bodyParser = require('body-parser')
//设置 bodyParser中间件
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// //数据库操作
// let MongoClient=require('mongodb').MongoClient; 移到组件中

// let DbUrl='mongodb://114.215.86.207:27017/productmanage';  /*连接数据库 移到组件中 */  

//引用组件
let DB = require('./modules/db');

//保存用户信息
let session = require('express-session');
//配置中间件 固定格式
app.use(session({
    secret:'cat',
    resave:false,
    saveUninitialized:true,
    cookie:{
        maxAge:1000*60*30
    },
    rolling:true
}))

//使用ejs模板引擎 默认views这个目录
app.set('view engine','ejs');
//设置虚拟目录
app.use('/upload',express.static('upload'));

//配置public目录为我们的静态目录
app.use(express.static('public'));


//自定义中间件 判断登录状态
app.use((req,res,next)=>{
   
    if(req.url=='/login' || req.url=='/doLogin'){
        next();
    }else{
        if(req.session.userinfo && req.session.userinfo.username!=''){/**判断有没有登录 */
          app.locals['userinfo']=req.session.userinfo;/**配置全局变量  可以在任何板块里面使用*/
          next();
        }else{
            res.redirect('/login')
        }
    }
})

//获取登录提交数据
app.post('/doLogin',(req,res)=>{
    console.log(req.body);

    let username = req.body.username;
    let password = md5(req.body.password)
    DB.find('user',{username:username,password:password},(err,data)=>{
            if(data.length>0){
                console.log('登录成功');

                //保存用户信息 
                req.session.userinfo=data[0];
                res.redirect('/product') /**登录成功后跳转商品列表页 */
            }else{

                res.send("<script>alert('登录失败');location.href='/login'</script>");
            }
    })
    //隐藏更换组件似
    // MongoClient.connect(DbUrl,(err,db)=>{
    //     if(err){
    //         console.log(err);
    //         return;
    //     }
    //      //console.log(db)
    //     //查询数据  {"username":req.body.username,"password":req.body.password}

    //     // let result = db.collection('user').find(req.body);//没有用MD5查询时候的查找 2018 12 17前

    //     let result = db.collection('user').find({
    //         username:username,
    //         password:password
    //     });

    //     //另一种遍历数据的方法
    //     result.toArray((err,data)=>{
    //         console.log(data);

    //         if(data.length>0){
    //             console.log('登录成功');

    //             //保存用户信息 
    //             req.session.userinfo=data[0];
    //             res.redirect('/product') /**登录成功后跳转商品列表页 */
    //         }else{

    //             res.send("<script>alert('登录失败');location.href='/login'</script>");
    //         }
    //         db.close();
    //     })
    // })
})
 
app.get('/', (req, res)=> {
  res.send('Hello World')
})
 
//登录
app.get('/login',(req,res)=>{
    //res.send('login');
    // res.render('login');
    res.render('login');
})

//商品列表
app.get('/product',(req,res)=>{
    DB.find('product',{},(err,data)=>{
        //console.log('data',data)
        res.render('product',{
           list:data 
        })
    })
   
})
//添加商品
app.get('/productadd',(req,res)=>{
    res.render('productadd')
})

//处理增加商品的表单提交的数据
app.post('/ProductAdd',(req,res)=>{
    //获取表单的数据 以及post过来的图片
    let form = new multiparty.Form();
    form.uploadDir='upload' //上传图片的目录 目录必须要存在

    form.parse(req,(err,fields,files)=>{

        //console.log(fields);  /*获取表单的数据*/     
        //console.log(files);  /*图片上传成功返回的信息*/

        let title = fields.title[0];
        let price = fields.price[0];
        let fee = fields.fee[0];
        let description = fields.description[0];
        let pic = files.pic[0].path;

        //插入数据
        DB.add('product',{
            title,
            price,
            fee,
            description,
            pic
        },(err,data)=>{
            if(!err){
                res.redirect('/product')
            }else{
                console.log("上传失败！")
            }
        })
    })
    
    
})
//处理end

//修改商品
app.get('/productedit',(req,res)=>{
    let id = req.query.id;
    console.log(id);
    DB.find('product',{"_id":new DB.ObjectID(id)},(err,data)=>{
        res.render('productedit',{
            list:data[0]
        })
    })
   
})
//修改商品重新保存路由
app.post('/Doproductedit',(req,res)=>{
    let form = new multiparty.Form();
    form.uploadDir='upload' //上传图片保存的地址

    form.parse(req,(err,fields,files)=>{
        //console.log(fields);
        //console.log(files);

        let _id=fields._id[0];
        let title=fields.title[0];
        let price=fields.price[0];
        let fee=fields.fee[0];
        let description=fields.description[0];

        let originalFilename=files.pic[0].originalFilename;
        let pic=files.pic[0].path;

        if(originalFilename){/**修改图片 */
            var setData={
                title,
                price,
                fee,
                description,
                pic

            }
        }else{/**没修改图片 */
            var setData={
                title,
                price,
                fee,
                description
               

            }
            //删除临时生成图片
             fs.unlink(pic,err=>console.log(err));
        }

        DB.upDate('product',{"_id":new DB.ObjectID(_id)},setData,function(err,data){

            if(!err){
                res.redirect('/product');
            }

    })

    })
})
//商品修改结束

//删除商品
app.get('/productdelete',(req,res)=>{
    // res.send('productdelete')
    let id=req.query.id;
    //console.log('id',id)

    DB.deleteThis('product',{"_id":new DB.ObjectID(id)},err=>{
        if(!err){
            res.redirect('/product');
        }
    })
})
//退出
app.get('/loginOut',function(req,res){


    //销毁session

    req.session.destroy(function(err){

        if(err){
            console.log(err);
        }else{
            res.redirect('/login');
        }
    })
})

//404
app.get('*', function(req, res) {  

    res.send(`<h1>404</h1><br><br><h3>您访问的页面不存在！</h3>`)
})



app.listen(3000,'127.0.0.1')