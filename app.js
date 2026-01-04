const express=require("express");
const app=express();
const authenticateToken = require("./authentication.js");
const path=require("path");
const dbpath=path.join(__dirname,"gymmanagement.db");
const {open}=require("sqlite");
const sqlite3=require("sqlite3");

const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
let db=null;
const initialize= async ()=>{
    try{
        db = await open({
        filename:dbpath,
        driver:sqlite3.Database,
    }),
    app.listen(4500,()=>{
        console.log("server is runing at http://localhost:4500")
    })

    }catch(e){
        console.log(`DB ERROR ${e.message}`);
    }
    
}

initialize();

app.post("/users/", async (request, response) => {
  const { name,pass,age,gender,phone,location } = request.body;

  const userQuery = `SELECT * FROM users WHERE name = ?`;
  const dbUser = await db.get(userQuery, [name]);

  if (dbUser === undefined) {
    const hashedPassword = await bcrypt.hash(pass, 10);
    
    const insertQuery = `
      INSERT INTO users (name, password, age, gender, phone, location)
      VALUES (?, ?, ?, ?, ?, ?)`;

    const result = await db.run(insertQuery, [
      name,
      hashedPassword,
      age,
      gender,
      phone,
      location
    ]);

    response.send(`User created with ID: ${result.lastID}`);
  } else {
    response.status(400);
    response.send("User already exists");
  }
});

app.post("/login",async(request,response)=>{
  const { name, password}=request.body;

  const fisrt=`SELECT * FROM users WHERE name = ?`;
  const dbfirst= await db.get(fisrt, [name]);
  
  if(dbfirst === undefined){
    response.status(400);
    response.send("invalid user")
  }else{
    const verify= await bcrypt.compare(password, dbfirst.password);

    if(verify){
      const payload= { name};
      const jwtToken= jwt.sign(payload, "mani");
      response.send({jwtToken})
    }else{
      response.status(400);
      response.send("invalid password");
    }
  }
})

app.post("/memberdata/",async(request,response)=>{
  const { name,gender,age,location,phone }=request.body;

  const namequery=`SELECT * FROM members WHERE name = ?`;
  const getdbname= await db.get(namequery, [name]);

  if(getdbname === undefined){
    const setdata=`INSERT INTO members(name,gender,age,location,phone)
    VALUES(?, ?, ?, ?, ?)`;
    const getdata=await db.run(setdata, [name, gender, age, location, phone]);
    response.status(200);
    response.send("NOW YOU'RE MEMBER")
  }else{
    response.status(400);
    response.send("NAME ALREADY EXITS")
  }

});


app.get("/register",async(request,response)=>{
    response.sendFile(path.join(__dirname,"public","register.html"));
})

app.get("/login",async(request,response)=>{
    response.sendFile(path.join(__dirname,"public","login.html"));
})

app.get("/welcome",async(request,response)=>{
    response.sendFile(path.join(__dirname,"public","welcome.html"));
})

app.get("/",async(request,response)=>{
    response.sendFile(path.join(__dirname,"public","home.html"));
})



app.get("/member",async(request,response)=>{
  response.sendFile(path.join(__dirname,"public","member.html"))
})



app.get("/plan",async(request,response)=>{
  response.sendFile(path.join(__dirname,"public","plan.html"))
})

app.get("/protextedplan",authenticateToken,async(request,response)=>{
  response.status(200).send("valid");
})

app.get("/trainer",async(request,response)=>{
  response.sendFile(path.join(__dirname,"public","trainer.html"))
})

app.get("/quire",async(request,response)=>{
  response.sendFile(path.join(__dirname,"public","quire.html"))
})


app.get("/protextedtrainer",authenticateToken,async(request,response)=>{
   response.status(200).send("valid");
})

app.get("/protextedquire",authenticateToken,async(request,response)=>{
   response.status(200).send("valid");
})

app.post("/plan/",async(request,response)=>{
  const {planName,price,custName,phone }=request.body;

  const firstqueryp=`SELECT * FROM membership WHERE custName = ?`;
  const firstdbp= await db.get(firstqueryp, [custName]);

  if(firstdbp === undefined){
    const newinsert=`INSERT INTO membership(planName,price,custName,phone)
    VALUES(?, ?, ?, ?)`;
    const newdbget=await db.run(newinsert, [planName, price, custName, phone]);

    response.status(200);
    response.send("updated")
  }else{
    response.status(400);
    response.send("user already exits");
  }

})

app.post("/trainer/",async(request,response)=>{
  const {name,gender,age,phone,location }=request.body;

  const firstqueryp=`SELECT * FROM trainer WHERE name = ?`;
  const firstdbp= await db.get(firstqueryp, [name]);

  if(firstdbp === undefined){
    const newinsert=`INSERT INTO  trainer (name,gender,age,phone,location)
    VALUES(?, ?, ?, ?, ?)`;
    const newdbget=await db.run(newinsert, [name, gender, age, phone, location]);

    response.status(200);
    response.send("updated")
  }else{
    response.status(400);
    response.send("user already exits");
  }

})

app.post("/quire/",async(request,response)=>{
  const {name,phone,suggest,doubt}=request.body;

  const firstqueryp=`SELECT * FROM quire WHERE name = ?`;
  const firstdbp= await db.get(firstqueryp, [name]);

  if(firstdbp === undefined){
    const newinsert=`INSERT INTO  quire (name,phone,suggest,doubt)
    VALUES(?, ?, ?, ?)`;
    const newdbget=await db.run(newinsert, [name, phone, suggest, doubt]);

    response.status(200);
    response.send("updated")
  }else{
    response.status(400);
    response.send("user already exits");
  }

});



