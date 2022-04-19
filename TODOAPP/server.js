const express = require('express');
const app = express();
app.use(express.urlencoded({extended: true})) 
const MongoClient = require('mongodb').MongoClient;

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
    응답.sendFile(__dirname+"/index.html");
});
app.get("/pet",function(요청,응답){
    응답.send("펫용품 쇼핑할 수 있는 페이지입니다.");
});
app.get("/beauty",function(요청,응답){
    응답.send("뷰티용품 쇼핑할 수 잇는 페이지입니다.");
});
app.get('/write', function(요청, 응답) { 
    응답.sendFile(__dirname +'/write.html')
  });


app.post('/add',(요청,응답)=>{
    응답.send('전송완료');
    console.log(요청.body.title);
    console.log(요청.body.date);
    db.collection('post').insertOne( { 제목 : 요청.body.title, 날짜 : 요청.body.date } , function(){
        console.log('저장완료')
    });
});

app.get('/list',(요청,응답)=>{
    //실제 db에 저장된 데이터들로 예쁘게 꾸며진 HTML 을 보여줌
    
})