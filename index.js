var express = require("express"),
    mongoose = require("mongoose"),
    app = express(),
    bodyParser = require("body-parser"),
    Task = require("./models/task"),
    response = require("./models/response"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    user = require("./models/user");

    mongoose.connect("mongodb://localhost/siamtaskv4",{ useNewUrlParser: true, useUnifiedTopology: true });
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + '/public'));
//======================
//passport configuration
//======================
app.use(require("express-session")({
    secret:"Burn in Hell",
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use(function(req,res,next){
    res.locals.currUser = req.user;
    next();
});

app.get("/",function(req,res){
    res.render("home");
});
//=========
//All tasks
//=========
app.get("/tasks",isLoggedIn,function(req,res){
    Task.find({},function(err,task){
        if (err){
            console.log(err);
        }else{
            res.render("tasks",{task:task});
        }
    });
});
//=========
//New tasks
//=========
app.post("/tasks",isLoggedIn,function(req,res){
    if(req.body.post=="Board Member")
    {
        var t= req.body.title,
            a= {
                id:req.user._id,
                username:req.user.username
            },
            p= req.body.post,
            i= req.body.image,
            c= req.body.content;
        var newt = {title:t,author:a,post:p,image:i,content:c}
        Task.create(newt,function(err,newtask){
            if(err){
                console.log(err);
            }else{
                res.redirect("/tasks")
            }
        })
    }
    else{
        res.send("Only Board Members allowed to give new task");
    }
});
app.get("/tasks/new",isLoggedIn,function(req,res){
    res.render("new");
});
//====
//SHOW
//====
app.get("/tasks/:id",isLoggedIn,function(req,res){
    Task.findById(req.params.id).populate("responses").exec(function(err,ftask){
        if(err){
            console.log(err);
        }else{
            res.render("show",{showt:ftask});
        }
    });
});
//===============
//response routes
//===============
app.post("/tasks/:id/response",function(req,res){
    Task.findById(req.params.id,function(err,task){
        if(err){
            console.log(err);
        }else{
            response.create(req.body.response,function(err,resp){
                if(err){
                    console.log(err);
                }else{
                    resp.author.id=req.user._id;
                    resp.author.username=req.user.username;
                    resp.save();
                    task.responses.push(resp);
                    task.save();
                    res.redirect("/tasks/"+task._id);
                }
            })
        }
    })
})
//=============
//Search routes
//=============
app.post("/search",isLoggedIn,function(req,res){
    Task.find({title:req.body.search},function(err,item){
        if(err){
            console.log(err);
        }else{
            res.render("search",{foundtask:item});
        }
    })
})
//===========
//Auth routes
//===========
//SignUp
app.get("/signup",function(req,res){
    res.render("pass/signup");
});
app.post("/signup",function(req,res){
    var newuser= new user({username:req.body.username});
    user.register(newuser,req.body.password,function(err,u){
        if(err){
            console.log(err);
        }
        passport.authenticate("local")(req,res,function(){
            res.redirect("/tasks");
        });
    });
});
//Login
app.get("/login",function(req,res){
    res.render("pass/login");
});
app.post("/login",passport.authenticate("local",
    {
        successRedirect:"/tasks",
        failureRedirect:"/login",
    }),function(req,res){
});
//Logout
app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/");
});
//middleware
function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

app.listen("2000",function(){
    console.log("Assignment has started");
})