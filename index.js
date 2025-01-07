const express = require('express');
const fs = require('fs');
require('dotenv').config({path:"./process.env"});
const app = express();
const session = require('express-session');


// Middleware
app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(express.static('public'));
app.use(session({
    secret:process.env.SESSION_KEY,
    resave:false,
    saveUninitialized:false,
    cookie:{maxAge:3600000},
}));

const authentication = (req,res,next)=>{
    if(req.session.user){
        console.log(user);
        next();
    }
    else{

        res.send('<script>alert("user is not logged in ");window.location.replace("/login")</script>')
    }
}

//set template engine 
app.set("view engine", "ejs");


// additional functions
const userFile = process.env.DATA_FILE;
const blogFile = process.env.BLOG_FILE;

const readUserData = ()=>{
    try{
         return JSON.parse(fs.readFileSync(userFile,'utf-8'))
    }catch(err)
    {
        console.log(`Error in Reading user Data ${err}`);
        return []
    }
}

const writeUserData = (data)=>{
    
    try{
        fs.writeFileSync(userFile,JSON.stringify(data,null,2),"utf-8",)
        return true;
    }catch(err)
    {
        console.log(`Error in Writing user Data ${err}`);
        return false;
    }
}

const readBlogData = ()=>{
    try{
        return JSON.parse(fs.readFileSync(blogFile,'utf-8'))
   }catch(err)
   {
       console.log(`Error in Reading Blog Data ${err}`);
       return []
   }
}

const writeBlogData = (data)=>{
    
    try{
        fs.writeFileSync(blogFile,JSON.stringify(data,null,2),"utf-8",)
        return true;
    }catch(err)
    {
        console.log(`Error in Writing Blog Data ${err}`);
        return false;
    }
}   

const isExist = ({email,phoneNo},users)=>{
    const result = users.filter((element)=>(element.email===email || element.phoneNo === phoneNo))
    if(result.length===0)
        return true;
    else 
        return false;
}


//routes 

app.get("/",(req,res)=>{
   
    res.render("login");
})

app.get('/registration',(req,res)=>{
    res.render("registration.ejs");
})

app.post('/registration',(req,res)=>{
    const users = readUserData();
    const {name,email,phoneNo,password} = req.body
    const auth = isExist({email,password},users)
    if(auth)
    {
        const id = Date.now();
        users.push({id,name,email,phoneNo,password});
        const success = writeUserData(users);
        if(success)
        {
            res.render('register.ejs',{name})
        }
        else{
            res.send('<script>alert("Registration not succefull /nregister again"); window.location.replace("/registration")</script>');
        }
    }
    else{
        res.send('<script>alert("user already Exist"); window.location.replace("/login")</script>');
    }
})

app.get('/login',(req,res)=>{
    res.render("login.ejs");
})

app.post('/login',(req,res)=>{
    const {email,password}=req.body;
    const users = readUserData();
    const user = users.filter((element)=>(element.email===email));
    console.log(user);
    if(user.length)
    {
        if(user[0].password===password)
        {   
            req.session.user={...user[0]}
            res.redirect('/user');
        }
        else{
            res.send('<script>alert("wrong password");window.location.replace("/login")</script>')
        }

    }
    else{
        res.send('<script>alert("user not exist");window.location.replace("/registration")</script>')
    }
});

app.get('/user',(req,res)=>{
    const user = req.session.user;
    const users = readUserData();
    const blogs = readBlogData();
    if(user){
        console.log(user);
        res.render('index.ejs',{user,blogs,users})
    }
    else{

        res.send('<script>alert("user is not logged in ");window.location.replace("/login")</script>')
    }
})

app.get('/create-blog',(req,res)=>{

    const user = req.session.user;
    if(user){
        console.log(user);
        res.render('newBlog',{user});
    }
    else{

        res.send('<script>alert("user is not logged in ");window.location.replace("/login")</script>')
    }
});



const port = process.env.PORT;
app.listen(port,()=>{
    console.log(`http://localhost:${port}`);
})

