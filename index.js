const express = require('express');
const fs = require('fs');
require('dotenv').config({path:"./process.env"});
const bcrypt = require('bcrypt')
const session = require('express-session');
const mongoose = require('mongoose');
const connectDB = require('./db')
const User = require('./models/User')


const app = express();
connectDB();


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

// const readUserData = ()=>{
//     try{
//          return JSON.parse(fs.readFileSync(userFile,'utf-8'))
//     }catch(err)
//     {
//         console.log(`Error in Reading user Data ${err}`);
//         return []
//     }
// }

// const writeUserData = (data)=>{
    
//     try{
//         fs.writeFileSync(userFile,JSON.stringify(data,null,2),"utf-8",)
//         return true;
//     }catch(err)
//     {
//         console.log(`Error in Writing user Data ${err}`);
//         return false;
//     }
// }

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

const getUser = ({email,phoneNo})=>{
    const user = User.findOne({$or:[{email,phoneNo}]})

    if(user)  
        return user;
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

app.post('/registration', async (req,res)=>{
    // const users = readUserData();
    const {name,email,phoneNo,password} = req.body
    const isUser = getUser({email,password});
    if(isUser)
    {
        const hashedPassword = await bcrypt.hash(password,10);
        const user = new User({name,email,phoneNo,password:hashedPassword});
         
        try{
            await user.save();
            res.render('register.ejs',{name}) 
        }
        catch(err){
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

app.post('/login',async (req,res)=>{
    const {email,password}=req.body;
    const user = await User.findOne({email});

    if(user)
    {
        const isPassword = await bcrypt.compare(password,user.password);
        if(isPassword)
        {   
            req.session.user={...user}
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

app.get('/user',authentication,(req,res)=>{
    const user = req.session.user;
    const users = User.find();
    console.log(users)
    const blogs = readBlogData();
    res.render('index.ejs',{user,blogs,users});

});

app.get('/create-blog',authentication,(req,res)=>{

    const user = req.session.user;
    res.render('newBlog',{user});
    
});



const port = process.env.PORT;
app.listen(port,()=>{
    console.log(`http://localhost:${port}`);
})

