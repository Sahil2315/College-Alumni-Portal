let express = require('express')
let app = express()
let path = require('path')
let {Pool, Client} = require('pg')
let cookieParser = require('cookie-parser')

let connectionString = "postgres://suldmagc:QwALU1V9XZ3NEmHHBUUfvikgKcl-ix9U@satao.db.elephantsql.com/suldmagc"

const db = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: true }
})
  
db.connect((err) => {
    if (err) throw err
    console.log("Connected")
})

app.use(express.static(path.join(__dirname, '/static')))
app.use(express.static(path.join(__dirname, '/static/images')))
app.use(express.json())
app.use(cookieParser())

app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname, '/static/index.html'))
})

app.get('/login', (req,res) => {
    res.sendFile(path.join(__dirname, '/static/login.html'))
})

app.get('/signup', (req,res) => {
    res.sendFile(path.join(__dirname, '/static/signup.html'))
})

app.get('/posts', (req, res) => {
    res.sendFile(path.join(__dirname, '/static/posts.html'))
})

app.get('/postget', (req,res) => {
    db.query(`select * from posts order by pid desc`, (err, result) => {
        if(result.rows.length == 0){
            res.send({'posts': 'none'})
        }
        else{
            res.send({'posts': result.rows})
        }
    })
})

app.get('/posted', (req, res) => {
    res.sendFile(path.join(__dirname, '/static/posted.html'))
})

app.post('/loginreq', (req,res) => {
    db.query(`select * from users where (uname = '${req.body.entry}' or email = '${req.body.entry}') and password = '${req.body.password}'`, (err, result) => {
        if(err) throw err
        if(result.rows.length == 0){
            res.send({'login': 'failed'})
        }
        else{
            res.cookie('Details', result.rows[0])
            res.send({'login': 'successful'})
        }
    })
})

app.post('/signupreq', (req,res) => {
    db.query(`insert into users values('${req.body.rolln}', '${req.body.fullname}', '${req.body.username}', '${req.body.email}', '${req.body.password}')`, (err, result) => {
        if(err) throw err
        res.send({'signup': 'successful'})
    })
})

app.post('/insertpost', (req, res) => {
    let ntags = JSON.stringify(req.body.tags)
    db.query(`
    insert into posts(headline, subject, tags, content, rollno, fname)
    values('${req.body.headline}', '${req.body.subject}', '${ntags}', '${req.body.content}', '${req.cookies.Details.rollno}', '${req.cookies.Details.fname}')`
    ,(err, result) => {
        if(err){
            res.send({'post': 'unsuccessful'})
            throw err
        }
        res.send({'post': 'successful'})
    })
})

app.listen(5000, ()=> {
    console.log("Server Started on Port 5000")
})