const {check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Users = require('../models/User');

const loadSignup = (req, res) => {    
    title = "Create new Account";
     res.render('register', {title, login: false});
}

const loadLogin =  (req, res) => {    
    title = "User Login";
    res.render('login', {title, login: false});
}

const LoginValidation = [    
    check('email').not().isEmpty().withMessage('Please enter valid email.'),
    check('password').not().isEmpty().withMessage('Password is required.')
]

const postLogin = async (req, res) => {
    const {email, password} = req.body;
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        res.render('login', {title: 'User Login', errors: errors.array(), inputs: req.body, login: false });
    }
    else{
        try{
            const checkEmail = await Users.findOne({email});
              if(checkEmail !== null){
                  const id = checkEmail._id;
                  const dbpassword = checkEmail.password;
                  const name = checkEmail.name;

                  const verifyPassword = await bcrypt.compare(password, dbpassword);
                  if(verifyPassword){
                     // Create Token
                     const token = await jwt.sign({userID: id, userName: name}, process.env.JWT_KEY, {expiresIn: "7d"});
                     
                     req.session.user = token;
                     res.redirect('profile');

                  }
                  else{
                    res.render('login', {title: 'User Login', errors: [{msg: 'Your Password is wrong.'}], inputs: req.body, login: false });
                  }
              }
              else{
                res.render('login', {title: 'User Login', errors: [{msg: 'Email is not found.'}], inputs: req.body, login: false });
              }
       }catch(err){
           console.log(err.message);
       }
    }

}

const registerValidation = [
    check('name').isLength({min: 3}).withMessage('Name is required & character length 3'),
    check('email').isEmail().withMessage('Please enter valid email.'),
    check('password').isLength({min: 6}).withMessage('Password is required & character length 6')
]

const postRegister = async (req, res) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()){       
       title = "Create new Account";
       res.render('register', {title, errors: errors.array(), inputs: req.body, login: false });
    }
    else{         
        try{
            const {name, email, password} = req.body;
            const checkEmail = await Users.findOne({email});
            if(checkEmail === null){
                
                    const salt    = await bcrypt.genSalt(10);
                    const hashedPassword = await bcrypt.hash(password, salt);                    
                    const newUser = new Users({
                       name: name,
                       email: email,
                       password : hashedPassword
                           })
                    try{
                       const createdUser = await newUser.save(); 
                       req.flash('success', "Your account successfully created.");                       
                       res.redirect('/login');

                   }catch(err){
                    console.log(err.message);
                }
            }
            else{
               res.render('register', {title: 'Create new Acount', errors: [{msg: 'Email is already exists.'}], inputs: req.body, login: false});
            }

        }catch(err){
            console.log(err.message);
        }
    }
}

module.exports = {
    loadSignup, 
    loadLogin,
    registerValidation,
    postRegister,
    postLogin,
    LoginValidation
}