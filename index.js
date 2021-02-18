var express        = require("express"),
    mongoose       = require("mongoose"),
    app            = express(),
    bodyParser     = require("body-parser"),
    Task           = require("./models/task"),
    passport       = require("passport"),
    LocalStrategy  = require("passport-local"),
    details        = require("./models/details"),
    methodOverride = require("method-override"),
    Event          = require("./models/events"),
    user           = require("./models/user");

//     mongoose.connect("mongodb://localhost/siamtaskv4new",{ useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify:false });
mongoose.connect("mongodb+srv://Harshit:Q12h89qSgmY7Uyoz@task.h45ca.mongodb.net/Task?retryWrites=true&w=majority",{ useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify:false });
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + '/public'));
app.use(methodOverride("_method"));
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
app.post("/tasks",isLoggedIn,async(req,res)=>{
    var J= await details.findById(req.user._id);
    if(J.board==true)
    {
        var t= req.body.title,
            a= {
                id:req.user._id,
                username:req.user.username
            },
            p= J.post,
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
        var em="Only Board Members allowed to give New task"
        res.render("error",{em});
    }
});
app.get("/tasks/new",isLoggedIn,function(req,res){
    res.render("new");
});

app.get("/edit/task/:id",isLoggedIn,async(req,res)=>{
    var t = await Task.findById(req.params.id);
    var u = await details.findById(req.user._id);
    if(u.board==true){
        res.render("edittasks",{t});
    }else{
        var em="Only Board Members allowed to Edit task"
        res.render("error",{em});
    }
});
app.patch("/edit/task/:id",isLoggedIn,async(req,res)=>{
    var J= await details.findById(req.user._id);
    if(J.board==true)
    {
        var t= req.body.title,
            a= {
                id:req.user._id,
                username:req.user.username
            },
            p= J.post,
            i= req.body.image,
            c= req.body.content;
        var newt = {title:t,author:a,post:p,image:i,content:c}
        Task.findOneAndUpdate({_id:req.params.id},newt,function(err,newtask){
            if(err){
                console.log(err);
            }else{
                res.redirect("/tasks/"+req.params.id);
            }
        })
    }
    else{
        var em="Only Board Members allowed to Edit task"
        res.render("error",{em});
    }
})
//====
//SHOW
//====
app.get("/tasks/:id",isLoggedIn,function(req,res){
    Task.findById(req.params.id).populate("compT").exec(function(err,ftask){
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
// app.post("/tasks/:id/response",function(req,res){
//     Task.findById(req.params.id,function(err,task){
//         if(err){
//             console.log(err);
//         }else{
//             response.create(req.body.response,function(err,resp){
//                 if(err){
//                     console.log(err);
//                 }else{
//                     resp.author.id=req.user._id;
//                     resp.author.username=req.user.username;
//                     resp.save();
//                     task.responses.push(resp);
//                     task.save();
//                     res.redirect("/tasks/"+task._id);
//                 }
//             })
//         }
//     })
// })
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
            res.redirect("/details");
        });
    });
});
app.get("/details",isLoggedIn,(req,res)=>{
    res.render("details");
});
app.post("/details",isLoggedIn,(req,res)=>{
    var RegNo = req.body.RegNo,
        DOB = req.body.DOB,
        board= req.body.board,
        post = req.body.post,
        email = req.body.email,
        c = req.body.contact,
        i =req.body.insta,
        l = req.body.linkedIn,
        g = req.body.github,
        owner={
            id:req.user._id,
            username:req.user.username
        };
    if(board == "1")
    {
        board=true;
    }else{
        board=false;
    }
    var d={_id:req.user._id,RegNo:RegNo,DOB:DOB,board:board,post:post,email:email,contact:c,insta:i,github:g,linkedIn:l,owner:owner};
    details.create(d,function(err,details){
        if (err){
            console.log(err);
        }
        else{
            res.redirect("/tasks");
        }
    });
})
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
//===========
//Profile
//===========
app.get("/profile/all",isLoggedIn,async(req,res)=>{
    const Profs1 = await user.find({});
    const Profs2 = await details.find({});
    var arr = [];
    Profs1.forEach(function(p1){
        Profs2.forEach(function(p2){
            if(p1._id.equals(p2._id)){
                var obj={};
                obj["_id"]=p1._id;
                obj["username"]=p1.username;
                obj["board"]=p2.board;
                arr.push(obj);
            }
        })
    })
    res.render("allprofiles",{arr});
})
app.get("/profile/:id",isLoggedIn,async (req,res)=>{
    const use = await user.findById(req.params.id);
    const Det = await details.findById(req.params.id);
    res.render("profile",{Det,use});
});
app.get("/profile/edit/:id",isLoggedIn,async (req,res)=>{
    if (req.user._id == req.params.id){
        const Det = await details.findById(req.params.id);
        res.render("editprofile",{Det});
    }else{
        const u = await user.findById(req.params.id);
        var em="You are not logged in as:"+u.username;
        res.render("error",{em});
    }
});
app.patch("/profile/edit/:id",isLoggedIn,(req,res)=>{
    var RegNo = req.body.RegNo,
        DOB = req.body.DOB,
        board= req.body.board,
        post = req.body.post,
        email = req.body.email,
        c = req.body.contact,
        i =req.body.insta,
        l = req.body.linkedIn,
        g = req.body.github,
        owner={
            id:req.user._id,
            username:req.user.username
        };
    if(board == "1")
    {
        board=true;
    }else{
        board=false;
    }
    var d={_id:req.user._id,RegNo:RegNo,DOB:DOB,board:board,post:post,email:email,contact:c,insta:i,github:g,linkedIn:l,owner:owner};
    details.findOneAndUpdate({_id:req.params.id},d,function(err,details){
        if (err){
            console.log(err);
        }
        else{
            res.redirect("/profile/"+req.params.id);
        }
    });
})
//==============
// Task Holders
//==============
app.post("/completed/:id",isLoggedIn,async(req,res)=>{
    var tf = await Task.findById(req.params.id);
    var cid = req.user._id,
        cun = req.user.username,
        comt = {_id:cid,username:cun};
    
        tf.compT.push(comt);
        tf.save();
        res.redirect("/tasks/"+req.params.id);
})
app.get("/edit/list/:id",isLoggedIn,(req,res)=>{
    Task.findById(req.params.id).populate("compT").exec(function(err,t){
        if(err){
            console.log(err);
        }else{
            res.render("list",{t})
        }
    })
})
app.post("/edit/list/:tid/:uid",isLoggedIn,async(req,res)=>{
    var J = await details.findById(req.user._id);
    var u = await user.findById(req.params.uid);
    var tf = await (await Task.findById(req.params.tid)).execPopulate("compT");
    if (J.board==true){
        var comt = {_id:u._id,username:u.username};
        for( var i=0;i<tf.compT.length;i++){
            if(tf.compT[i]._id.equals(comt._id))
            {
                var ctr = i;
            }
        }
        tf.compT.splice(ctr,1);
        tf.save();
        res.redirect("/tasks/"+req.params.tid)
    }else{
        var em="Only Board Members can edit this list"
        res.render("error",{em});
    }
})
//========
//Events
//========
app.get("/events",async(req,res)=>{
    const e = await Event.find({});
    res.render("events",{e});
});
app.get("/new/event",isLoggedIn,function(req,res){
    res.render("newevent");
})
app.post("/new/event",isLoggedIn,(req,res)=>{
    Event.create(req.body,function(err,e){
        if(err){
            console.log(err);
        }else{
            res.redirect("/events");
        }
    })
})
app.get("/show/event/:id",async(req,res)=>{
    const e = await Event.findById(req.params.id);
    res.render("showevent",{e});
})
app.get("/edit/event/:id",isLoggedIn,async(req,res)=>{
    const e = await Event.findById(req.params.id);
    res.render("editevent",{e});
})
app.patch("/edit/event/:id",isLoggedIn,(req,res)=>{
    Event.findOneAndUpdate({_id:req.params.id},req.body,(err,ev)=>{
        if(err){
            console.log(err);
        }else{
            res.redirect("/events");
        }
    })
})
//middleware
function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}
app.listen (process.env.PORT,process.env.IP,()=>{});
// app.listen("2000",function(){
//     console.log("Assignment has started");
// })
