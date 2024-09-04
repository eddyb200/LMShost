import mongoose from "mongoose";

const BookSchema = new mongoose.Schema({
    bookName:{
        type:String,
        require:true
    },
    alternateTitle:{
        type:String,
        default:""
    },
    author:{
        type:String,
        require:true
    },
    language:{
        type:String,
        default:""
    },
    bookCoverImageName: {
        type: String, 
        default: null 
    },
    publisher:{
        type:String,
        default:""
    },
    bookCountAvailable:{
        type:Number,
        require:true
    },
    bookReservedCopies:{
        type:Number,
        default:0
    },
    bookIssuedCopies:{
        type:Number,
        default:0
    },
    bookStatus:{
        type:String,
        default:"Available"
    },
    categories:[{ 
        type: mongoose.Types.ObjectId, 
        ref: "BookCategory" 
    }],
    transactions:[{
        type:mongoose.Types.ObjectId,
        ref:"BookTransaction"
    }]
},
{
    timestamps:true
})

export default mongoose.model("Book",BookSchema)