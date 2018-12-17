



const express = require('express')
let app =new express();/**实例化一下 */

//获取post
let bodyParser = require('body-parser')
//设置 bodyParser中间件
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//数据库操作
let MongoClient=require('mongodb').MongoClient;

let DbUrl='mongodb://114.215.86.207:27017/productmanage';  /*连接数据库*/

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

    MongoClient.connect(DbUrl,(err,db)=>{
        if(err){
            console.log(err);
            return;
        }
         //console.log(db)
        //查询数据  {"username":req.body.username,"password":req.body.password}
        let result = db.collection('user').find(req.body);

        //另一种遍历数据的方法
        result.toArray((err,data)=>{
            console.log(data);

            if(data.length>0){
                console.log('登录成功');

                //保存用户信息 
                req.session.userinfo=data[0];
                res.redirect('/product') /**登录成功后跳转商品列表页 */
            }else{

                res.send("<script>alert('登录失败');location.href='/login'</script>");
            }
            db.close();
        })
    })
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

    res.render('product')
})
//添加商品
app.get('/productadd',(req,res)=>{
    res.render('productadd')
})
//修改商品
app.get('/productedit',(req,res)=>{
    res.render('productedit')
})
//删除商品
app.get('/productdelete',(req,res)=>{
    res.send('productdelete')
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