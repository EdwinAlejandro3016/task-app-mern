//Schema
const User = require('../models/User');
//validacion
const Joi = require('joi');
//contraseña
const bcrypt = require('bcrypt');
// jwt
const jwt = require('jsonwebtoken');

const schemaRegister = Joi.object({
    name: Joi.string().min(6).max(255).required(),
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(1024).required()
});

const schemaLogin = Joi.object({
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(1024).required()
})

exports.signup =  async(req,res)=>{
    const {name,email,password} = req.body;
        //validate user
        const {error} = schemaRegister.validate(req.body);
         
        if(error){
            return res.status(400).json(
                {error: error.details[0].message}
            )
        }

        const isEmailExist = await User.findOne({
            email
        })

        if(isEmailExist){
            return res.status(400).json(
                {error: 'Email ya registrado'}
            )
        }

        // hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password,salt);

        const user = new User({
            name,
            email,
            password: passwordHash
        })
    try{
        const savedUser = await user.save();
        res.json({
            error: null,
            data: savedUser
        })
    }catch(error){
        res.status(400).json({error}) 
    }
    
}

exports.login = async(req,res)=>{
    const {email,password} = req.body;

    //validations
    const {error} = schemaLogin.validate(req.body);
    if(error){
        return res.status(400).json(
            {error: error.details[0].message}
        )
    }
    const user = await User.findOne({
        email
    });
    if(!email){
        return res.status(400).json({
            error: "Email o contraseña no valida"
        })
    }
    const validPassword = await bcrypt.compare(password,user.password);

    if(!validPassword){
        return res.status(400).json({
            error: "Email o contraseña no valida"
        })
    }

    //create token
    const token = jwt.sign({
        name: user.name,
        id: user._id
    },process.env.TOKEN_SECRET)

    res.header('auth-token',token).json({
        error: null,
        data: {token}
    })
}