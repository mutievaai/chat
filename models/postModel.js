const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    title:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:false
    },
    content:{
        type:String,
        required: true
    }
},
{timestamps: true});
postSchema.virtual('comments', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'post_id'
});

postSchema.set('toObject', { virtuals: true });
postSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Post', postSchema);