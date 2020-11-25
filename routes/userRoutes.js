const express = require('express');
const router = express.Router();
const {loadSignup, loadLogin, registerValidation, postRegister, postLogin, LoginValidation} = require('../controllers/userController');
const {stopLogin} = require('../middlewares/auth');


// Routes
router.get('/',stopLogin, loadSignup);

router.get('/login', stopLogin, loadLogin);

router.post('/register',registerValidation, postRegister);

router.post('/postLogin', LoginValidation,  postLogin)

module.exports = router;