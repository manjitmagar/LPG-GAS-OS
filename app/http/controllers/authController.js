const User = require("../../models/user");
const bcrypt = require("bcrypt");

const passport = require("passport");

function authController() {
  const _getRedirectUrl = (req) => {
    return req.user.role === "admin" ? "/admin/orders" : "/customer/orders";
  };

  return {
    login(req, res) {
      res.render("auth/login");
    },
    postLogin(req, res, next) {
      passport.authenticate("local", (err, user, info) => {
        if (err) {
          req.flash("error", info.message);
          return next(err);
        }
        if (!user) {
          req.flash("error", info.message);
          return res.redirect("/login");
        }

        req.login(user, (err) => {
          if (err) {
            req.flash("error", info.message);
            return next(err);
          }
          return res.redirect(_getRedirectUrl(req));
        });
      })(req, res, next);
    },
    register(req, res) {
      res.render("auth/register");
    },
    async postRegister(req, res) {
      const { name, email, password } = req.body;
      // Validate request
      if (!name || !email || !password) {
        req.flash("error", "All fields are required");
        req.flash("name", name);
        req.flash("email", email);
        return res.redirect("/register");
      }

      try {
        // Check if email exists
        const emailExists = await User.exists({ email: email });
        if (emailExists) {
          req.flash("error", "Email already taken");
          req.flash("name", name);
          req.flash("email", email);
          return res.redirect("/register");
        } 

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a User
        const user = new User({
          name,
          email,
          password: hashedPassword,
        });

        await user.save();

        // Login user
        req.login(user, (err) => {
          if (err) {
            req.flash("error", "Something went wrong");
            return res.redirect("/login");
          }

          return res.redirect("/");
        });
      } catch (error) {
        console.error(error);
        req.flash("error", "Something went wrong");
        return res.redirect("/register");
      }
    },
    logout(req, res) {
      req.logout(function (err) {
        if (err) {
          console.error(err);
        }
        return res.redirect("/login");
      });
    },
  };
}

module.exports = authController;
