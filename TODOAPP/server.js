const express = require('express');
const app = express();
app.use(express.urlencoded({extended: true})) 
//8080이란 포트로 서버를 열어주세요.
app.listen(8080, function(){
    console.log("listening on 8080");
});

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
});