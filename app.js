const express = require('express');
const mongoose = require('mongoose');
const url = 'mongodb://localhost/AviationDB';
const app = express();
const cors = require('cors');

app.use(cors());
app.get('/',(req,res)=>{
 res.send('Hello !!');
});

const PORT = process.env.PORT || 5001;


mongoose.connect(url, {useNewUrlParser:true});

const con = mongoose.connection

con.on('open', ()=>{
    console.log('connected');
});

app.use(express.json());

const airportRouter = require('./routes/airportRouter');
app.use('/airport',airportRouter);

app.listen(PORT,()=> console.log(`Server started on port ${PORT}`))