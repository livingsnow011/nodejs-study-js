const express = require('express');
const app = express();
app.use(express.urlencoded({extended: true})) 
const MongoClient = require('mongodb').MongoClient;
app.set('view engine','ejs');

app.use('/public',express.static('public'));

const methodOverride = require('method-override')
app.use(methodOverride('_method'))

//어던 데이터 베이스에 저장할껀지
var db;
MongoClient.connect('mongodb+srv://admin:qwer@cluster0.zofe4.mongodb.net/todoapp?retryWrites=true&w=majority', function(에러, client){
    if (에러) return console.log(에러)

    db = client.db('todoapp');
    // db.collection('post').insertOne({이름 : 'john', 나이: 20},function(에러,결과){
    //     console.log('저장 완료');
    // });

    app.listen(8080, function() {
      console.log('listening on 8080')
    })
  })


//누군가가 /hello 로 방문하면 문장을 띄어주자.
app.get("/",function(요청,응답){
    응답.render('index.ejs');
});
app.get("/pet",function(요청,응답){
    응답.send("펫용품 쇼핑할 수 있는 페이지입니다.");
});
app.get("/beauty",function(요청,응답){
    응답.send("뷰티용품 쇼핑할 수 잇는 페이지입니다.");
});
app.get('/write', function(요청, 응답) { 
    응답.render('write.ejs')
  });


app.post('/add',(요청,응답)=>{
    응답.send('전송완료');

    db.collection('counter').findOne({name: '게시물갯수'},function(에러, 결과){
        console.log(결과.totalPost);
        var 총게시물갯수 = 결과.totalPost;
       
        db.collection('post').insertOne( { _id : 총게시물갯수 + 1,제목 : 요청.body.title, 날짜 : 요청.body.date } , function(){
            console.log('저장완료')
            db.collection('counter').updateOne({name:'게시물갯수'},{ $inc : {totalPost : 1}},function(에러,결과){
                if(에러){return console.log(에러)}
            })
        });

        

    });
});

//글번호 달기 

app.get('/list',(요청,응답)=>{
    
    //디비에 저장된 post라는 컬렉션 안의 데이터를 꺼내주세요
    db.collection('post').find().toArray(function(에러,결과){
        console.log(결과);
        //실제 db에 저장된 데이터들로 예쁘게 꾸며진 HTML 을 보여줌
        응답.render('list.ejs',{posts:결과});
    });
})

app.delete('/delete',function(요청,응답){
    console.log(요청.body);
    요청.body._id = parseInt(요청.body._id);
    db.collection('post').deleteOne(요청.body,function(에러,결과){
        console.log('삭제완료');
        응답.status(200).send({message : '성공했습니다.'});
    })
})

app.get('/detail/:id',function(요청,응답){
    db.collection('post').findOne({_id: parseInt(요청.params.id)},function(에러,결과){
        console.log(결과)
        응답.render('detail.ejs',{ data : 결과 })
    })
})

app.get('/edit/:id',function(요청,응답){
    db.collection('post').findOne({_id : parseInt(요청.params.id)},function(에러,결과){
        console.log(결과)
        응답.render('edit.ejs',{post : 결과});
    })
})

app.put('/edit',function(요청,응답){
    db.collection('post').updateOne({_id : parseInt(요청.body.id)},{$set : {제목 : 요청.body.title , 날짜 : 요청.body.date }},function(에러,결과){
        console.log("수정완료");
        응답.redirect('/list');
    })
});