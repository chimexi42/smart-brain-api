const express = require('express')
const bodyparser = require('body-parser')
const bcrypt = require('bcrypt')
const cors = require('cors')
const { password } = require('pg/lib/defaults')
const app = express() 
app.use(bodyparser.json())
app.use(cors())


const db = require('knex')({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      port : 5432,
      user : 'postgres',
      password : 'postgres',
      database : 'smartbrain'
    }
  });


db.select('*').from('users').then(data=> {
     console.log(data)
 })



const database = {
    users: [
      {
          id:'123', 
          name:"john",
          email: "john@gmail.com",
          password: "cookies",
          joined: new Date()
      },
      {
        id:'124', 
        name:"sally",
        email: "sally@gmail.com",
        password: "bananas",
        joined: new Date()
    }

    ]
} 
// from resgister endpoint

 // database.users.push({
    //     id:id, 
    //     name:name,
    //     email: email,
    //     password: password,
    //     joined: new Date()
    // })

app.get('/', (req, res)=>{
   
  res.json(database.users)
})

app.post('/signin', (req, res)=>{
    db.select('email', 'hash').from('login')
    .where('email', '=', req.body.email)
    .then(data=>{
        res.json(data)
        const isValid = req.body.password
        if(isValid){
            return db.select('*').from('users')
            .where('email', '=', req.body.email)
            .then(user=>{
                res.json(user)
            })
            .catch(err=> res.status(400).json('unable to get user'))
        }else{
            res.status(400).json('Wrong Credentials')
        }
    })
    .catch(err=> res.status(400).json('Wrong credentials'))
})

app.post('/register', (req, res)=>{
    const{email, name, password} = req.body;
    // const hash = bcrypt.hashSync(password)
    db.transaction(trx =>{
        trx.insert({
            hash: password,
            email:email,
        })
        .into('login')
        .returning('email')
        .then( loginEmail=>{
            db('users')
            .returning('*')
            .insert({
             email: loginEmail,
            name:name,
            joined: new Date()
    }).then(user=> {
        res.json(user)
        })
    })
    .then(trx.commit)
    .catch(trx.rollback)
     
    }).catch(err=>res.status(400).json('Unable to join') )
   
})

app.get('/profile/:id', (req, res)=>{
    const {id} = req.params
   
    // database.users.forEach(user=> {
    //     console.log(user.id)
    //     if(user.id === id){
    //         found = true
    //        return res.json(user)
    //     }
    // })
    db.select('*').from('users').where({'id':id }).then(user=>{
        // console.log(user)
        if(user.length > 0){
            res.json(user)
        }else{
            res.status(400).json('Not found')
        }
        
    }).catch(err => res.status(400).json('error getting user'))
})



// bcrypt.compare('bacon', hash, function(err, res){

// })

// bcrypt.compare('veggies', hash, function(err, res){

// })






app.listen(3000, ()=> {
    console.log('App is running on port 3000')
})