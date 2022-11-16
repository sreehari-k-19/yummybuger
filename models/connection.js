require("dotenv").config();
const mongoClient = require('mongodb').MongoClient
const password = process.env.MONGO_PS
const state={
    db:null
}
module.exports.connect=function(done){
    const url=`mongodb+srv://hari:${password}@cluster0.ec77m.mongodb.net/?retryWrites=true&w=majority`
    const dbname='yummyburger'

    mongoClient.connect(url,(err,data)=>{
        if (err) return done(err)
        state.db=data.db(dbname)
        done()
    })
}

module.exports.get=function(){
    return state.db
}