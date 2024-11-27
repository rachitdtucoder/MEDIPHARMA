const express=require('express');
const mysql=require('mysql2');
const ejsMate=require('ejs-mate');
const pagesRoute=require("./routes/pages.js");
const path=require('path');
require('dotenv').config();
const app=express();

const port=process.env.PORT || 3000;

// Middleware to serve static files
app.use(express.static(path.join(__dirname, "/public")));
// Set up EJS as the templating engine and use ejsMate for layouts
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));
app.engine('ejs', ejsMate); 
app.use(express.urlencoded({ extended: true })); 





app.use("/", pagesRoute);

app.get("/",(req,res)=>{
    res.send("hello");
});


app.listen(port,()=>{
    console.log(`server started on port ${port}`);
});
