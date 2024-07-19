const mongoose = require('mongoose')


const postSchema = mongoose.Schema({

    title:String,
    thumbnail:String,
    video:String,
    discription:String,
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"user",
    },
    date:{
        type:Date,
        default: Date.now,
    },
    likes:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"user",
    }

})

module.exports= mongoose.model('Post',postSchema)