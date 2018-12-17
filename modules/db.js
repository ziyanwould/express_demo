let MongoClient=require('mongodb').MongoClient;
let DbUrl='mongodb://114.215.86.207:27017/productmanage'; /*连接数据库*/
let ObjectID = require('mongodb').ObjectID;/**获取到里面的顺序ID */

function _connetDb(callback){
    MongoClient.connect(DbUrl,(err,db)=>{
        if(err){
            console.log('nosql连接失败',err);
            return;
        }else{
            callback(db)
        }
         //console.log(db)
        //查询数据  {"username":req.body.username,"password":req.body.password}
    
        // let result = db.collection('user').find(req.body);//没有用MD5查询时候的查找 2018 12 17前
    
    
    })
}

exports.ObjectID = ObjectID;

exports.find=(collectionname,json,callback)=>{
    _connetDb(db=>{
        let result = db.collection(collectionname).find(json);
        //另一种遍历数据的方法
            result.toArray((err,data)=>{
                //console.log(data);
    
                // if(data.length>0){
                //     console.log('登录成功');
    
                //     //保存用户信息 
                //     req.session.userinfo=data[0];
                //     res.redirect('/product') /**登录成功后跳转商品列表页 */
                // }else{
    
                //     res.send("<script>alert('登录失败');location.href='/login'</script>");
                // }
                callback(err,data)
                db.close();
            })
    })


}

exports.add = (collectionname,json,callback)=>{
    _connetDb(db=>{
       db.collection(collectionname).insertOne(json,(error,data)=>{
           callback(error,data);
       })
    })
}

exports.deleteThis=(collectionname,json,callback)=>{

    _connetDb(db=>{
        db.collection(collectionname).deleteOne(json,(error,data)=>{
            callback(error,data);
        })
    })
}

exports.upDate=(collectionname,json1,json2,callback)=>{

    _connetDb(db=>{
       db.collection(collectionname).updateOne(json1,{$set:json2},(error,data)=>{
           callback(error,data)
       }) 
    })
}



