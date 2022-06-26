//1 - se invoca a express
const express = require("express");
const app = express();

//2 - seteamos urlencoded para capturar datos de formulario
app.use(express.urlencoded({extended:false}));
app.use(express.json());

//3 - le mandamos mecha a dotenv
const dotenv = require('dotenv');
dotenv.config({path:'./env/.env'});

//4 - setear el directorio public
app.use('/resources', express.static("public"));
app.use('/resources', express.static(__dirname + "public"));

//5 - establecer el motor de plantillas
app.set("view engine", "ejs");

//6 - invocamos a bcryptjs (motor de hashing)
const bcryptjs = require("bcryptjs");

//7 - tema variables de session
const session = require("express-session");
app.use(session({
    secret:'secret',
    resave: true,
    saveuninitialized: true
}));

//8 - invocamos al modulo de conexion de la BD
const connection = require("./database/db");

//9 - Establecer rutas
app.get('/', (req, res)=>{
    res.render("index", {msg:"EL PEPE"});
})

app.get('/login', (req, res)=>{
    res.render("login");
})

app.get('/register', (req, res)=>{
    res.render("register");
})

app.listen(3000, (req, res)=> {
    console.log("Server en funcionamiento")
})
