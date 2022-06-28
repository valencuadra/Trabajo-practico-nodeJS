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
app.get('/login', (req, res)=>{
    res.render("login");
})

app.get('/register', (req, res)=>{
    res.render("register");
})

/*10 - El registro
(esta cosa toma de "register" las variables de usuario, nombre,
rol y contraseña, a la contraseña la encripta y mete todo en el
mySQL, si se hace todo bien, flasheas terrible animación de sweetalert2
y te redirije a la página de inicio)
*/

app.post("/register", async (req, res)=>{
    const usuario = req.body.usuario;
    const nombre = req.body.nombre;
    const rol = req.body.rol;
    const pass = req.body.contraseña;
    let passwordHaash = await bcryptjs.hash(pass, 8);
    connection.query("INSERT INTO users SET ?", {usuario:usuario, nombre:nombre, rol:rol, contraseña:passwordHaash}, async(error,results)=>{
        if(error){
            console.log(error);
        }else{
            res.render("register",{
                alert:true,
                alertTitle: "¡Perfecto!",
                alertMessage:"¡Tu registro ah sido exitoso!",
                alertIcon: "success",
                showConfirmButton:false,
                timer:1500,
                ruta:""
            })
        }
    })
})

//11 - Autenticación
app.post('/auth', async (req, res)=>{
    const user = req.body.user;
    const pass = req.body.pass;
    let passwordHaash = await bcryptjs.hash(pass, 8);
    if(user && pass){
        connection.query("SELECT * FROM users WHERE usuario = ?", [user], async (error, results)=>{
            if(results.lenght == 0 || !(await bcryptjs.compare(pass, results[0].contraseña))){
                res.render("login",{
                    alert:true,
                    alertTitle: "ERROR",
                    alertMessage:"Usuario y/o contraseña incorrectos",
                    alertIcon: "error",
                    showConfirmButton:true,
                    timer:false,
                    ruta:"login"
                });
            }else{
                req.session.loggedin = true;
                req.session.name = results[0].nombre
                res.render("login",{
                    alert:true,
                    alertTitle: "INICIO EXITOSO",
                    alertMessage:"¡Sea usted bienvenido/a!",
                    alertIcon: "success",
                    showConfirmButton:false,
                    timer:3500,
                    ruta:""
                });
            }

        })
    }else{
        res.render("login",{
            alert:true,
            alertTitle: "ATENCIÓN",
            alertMessage:"Tiene que ingresar un usuario y una contraseña para ingresar",
            alertIcon: "warning",
            showConfirmButton:true,
            timer:false,
            ruta:"login"
        });
    }
})

//12 - Autenticación de páginas

app.get("/", (req, res)=>{
    if(req.session.loggedin){
        res.render("index",{
            login:true,
            name: req.session.name
        });
    }else{
        res.render("index", {
            login:false,
            name: "Tenes que iniciar sesión"
        })
    }
})

//13 . El logout
app.get("/logout", (req, res)=>{
    req.session.destroy(()=>{
        res.redirect("/")
    })
})


app.listen(3000, (req, res)=> {
    console.log("Server en funcionamiento")
})
