const menuSchema = require("../../../models/menu");
const userSchema = require("../../../models/user");
const Order = require("../../../models/order");

function orderController() {
  return {
    index: async (req, res) => {
      try {
        const orders = await Order.find({ status: { $ne: "completed" } })
          .sort({ createdAt: -1 })
          .populate("customerId", "-password");

        if (req.xhr) {
          return res.json(orders);
        } else {
          return res.render("admin/orders", { orders });
        }
      } catch (error) {
        // Handle the error
        console.error(error);
        // Render an error page or redirect
        return res.render("error", { error: "Something went wrong" });
      }
    },

    add: (req, res) => {
      try {
        res.render("admin/addorder");
      } catch (error) {
        req.flash("error", "Something went wrong");
        return res.redirect("/");
      }
    },

    submitOrder: async (req, res) => {
      try {
        const { name, price, size } = req.body;
        if (!name) {
          req.flash("error", "Please Enter Product Name");
          return res.redirect("/admin/product/add");
        }

        if (!price) {
          req.flash("error", "Please Enter Product Price");
          return res.redirect("/admin/product/add");
        }

        if (!size) {
          req.flash("error", "Please Enter Product Size");
          return res.redirect("/admin/product/add");
        }

        const menu = new menuSchema({
          name: name,
          image: req.file.filename,
          price: price,
          size: size
        });

        menu.save().then((success) => {
          req.flash("success", "Product saved Successfully.");
          return res.redirect("/admin/product/add");
        });
      } catch (error) {
        req.flash("error", "Unable to save Product.");
        return res.redirect("/admin/product/add");
      }
    },

    products : async (req, res) => {
      try {
        const products = await menuSchema.find();
        if (req.xhr) {
          return res.json(products);
        } else {
          return res.render("admin/products", { products });
        }
      } catch (error) {
        return res.render("error", { error: "Something went wrong" });
      }
    },

    users : async (req, res) => {
      try {
        const users = await userSchema.find();
        if (req.xhr) {
          return res.json(users);
        } else {
          return res.render("admin/users", { users });
        }
      } catch (error) {
        return res.render("error", { error: "Something went wrong" });
      }
    }
  };
}

module.exports = orderController;
