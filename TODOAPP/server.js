require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.urlencoded({extended: true}))

const MongoClient = require('mongodb').MongoClient;
app.set('view engine','ejs');

app.use('/public',express.static('public'));

const methodOverride = require('method-override')
app.use(methodOverride('_method'))

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy
const session = require('express-session')
app.use(session({ secret : '비밀코드', resave: true, saveUninstallized:false}))
app.use(passport.initialize());
app.use(passport.session());

//어던 데이터 베이스에 저장할껀지
var db;
  MongoClient.connect(process.env.DB_URL, function(err, client){
  if (err) return console.log(err)
  db = client.db('todoapp');
  app.listen(process.env.PORT, function() {
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

app.get('/login',function(요청,응답){
    응답.render('login.ejs');
})
app.post('/login',passport.authenticate('local',{
    failureRedirect : '/fail'
}),function(요청,응답){
    응답.redirect('/')
})

app.get('/mypage',로그인했니,function(요청,응답){
    console.log(요청.user);
    응답.render('mypage.ejs',{ 사용자 : 요청.user});
})

function 로그인했니(요청, 응답, next){
    if(요청.user){  
        //next() 통과
        next()
    }else{
        응답.send("로그인안함");
    }
}

passport.use(new LocalStrategy({
    //name
    usernameField: 'id',  
    passwordField: 'pw',
    //세션으로 저장
    session: true,
    //아아디/비번말고 다른 정보 검사가 필요한지
    passReqToCallback: false,
  }, function (입력한아이디, 입력한비번, done) {
    //검증 부분
    //console.log(입력한아이디, 입력한비번); , 사용자가 입력한 값
    db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
      //done(에러,모든게 다맞아? -> 결과,{message: "에러메세지"})
      if (에러) return done(에러)
  
      if (!결과) return done(null, false, { message: '존재하지않는 아이디요' })
      if (입력한비번 == 결과.pw) {
        return done(null, 결과)
      } else {
        return done(null, false, { message: '비번틀렸어요' })
      }
    })
}));

//세션 등록, 유지
passport.serializeUser(function(user,done){
    done(null, user.id);
})

passport.deserializeUser(function(아이디,done){
    db.collection('login').findOne({id:아이디},function(에러,결과){
        done(null,결과)
    })
})

app.get("search",(요청,응답)=>{
    console.log(요청.query.value);
    //정규식 사용
    db.collection('post').find( {$text: {$search: 요청.query.value}}).toArray((에러,결과)=>{
        console.log(결과);
        응답.render('search.ejs', {posts : 결과})
    })
})