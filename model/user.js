const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/myDatabase')

const userSchema = mongoose.Schema({
    name: String,
    email: String,
    password: String,
    image: String,
    discription: String,
    posts:[
        {type: mongoose.Schema.Types.ObjectId,
            ref:"post"
        }
    ],
})

module.exports= mongoose.model('User',userSchema)