const User = require('../../models/user')
const bcrypt = require('bcrypt')

const passport = require('passport');
function authController() {
        const _getRedirectUrl=(req) =>{
                return req.user.role === 'admin'? '/admin/orders':'/customer/orders'
        }


    return {
        login(req, res) {

            res.render('auth/login')
        },
        postLogin(req, res, next) {
            passport.authenticate('local', (err, user, info) => {
                if (err) {
                    req.flash('error', info.message)
                    return next(err)
                }
                if (!user) {

                    req.flash('error', info.message)
                    return res.redirect('/login')
                }

                req.login(user, (err) => {
                    if (err) {

                        req.flash('error', info.message)
                        return next(err)

                    }
                    return res.redirect(_getRedirectUrl(req))
                })

            })(req,res,next)
        },
        register(req, res) {

            res.render('auth/register')
        },
        async postRegister(req, res) {
            const { name, email, password } = req.body;
            //Validate request 
            if (!name || !email || !password) {
                req.flash('error', 'All Fields are required ')
                req.flash('name', name)
                req.flash('email', email)
                return res.redirect('/register')
            }
            //CHECK IF EMAIL EXISTS 
            /*  User.exists({ email: email }, (error, result) => {
                 if (result) {
                     req.flash('error', 'Email Already Taken')
                     req.flash('name', name)
                     req.flash('email', email)
                     return res.redirect('/register')
                 }
             }) */
            //hash Password 
            const hashedPassword = await bcrypt.hash(password, 10)


            // Create a User 
            const user = new User({
                name,
                email,
                password: hashedPassword
            })

            user.save().then((user) => {

                //login


                return res.redirect('/')


            }).catch(err => {

                req.flash('error', 'Something went wrong')

                return res.redirect('/register')



            })




        

        },
        logout(req, res) {
            req.logout(function (err) {
              if (err) {
                console.error(err);
                // Handle any errors that occurred during logout
              }
              // Redirect or respond after successful logout
              return res.redirect('/login');
            });
          }
          




    }
}

module.exports = authController