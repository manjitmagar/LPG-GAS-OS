const Order = require("../../../models/order");
const moment = require("moment");

function orderController() {
  return {
    store(req, res) {
      // Validate request
      const { phone, address } = req.body;
      if (!phone || !address) {
        req.flash("error", "All fields are required");
        return res.redirect("/cart");
      }

      const order = new Order({
        customerId: req.user._id,
        items: req.session.cart.items,
        phone,
        address,
      });

      order
        .save()
        .then(async (result) => {
          const placeOrder = await Order.findById(result._id).populate(
            "customerId"
          );
          req.flash("success", "Order Placed Successfully");
          delete req.session.cart;

          // Emit
          const eventEmitter = req.app.get("eventEmitter");
          eventEmitter.emit("orderPlaced", placeOrder);

          return res.redirect("/customer/orders");
        })
        .catch((err) => {
          req.flash("error", "Something went wrong");
          return res.redirect("/cart");
        });
    },

    async index(req, res) {
      try {
        const orders = await Order.find({ customerId: req.user._id })
          .sort({ createdAt: -1 })
          .populate("customerId");

        res.header(
          "Cache-Control",
          "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
        );

        res.render("customers/orders", { orders, moment });
      } catch (error) {
        req.flash("error", "Something went wrong");
        return res.redirect("/");
      }
    },

    async show(req, res) {
      const order = await Order.findById(req.params.id);
      // Authorize user
      if (req.user._id.toString() === order.customerId.toString()) {
        return res.render("customers/singleOrder", { order: order });
      }
      return res.redirect("/");
      
      
    },
  };
}

module.exports = orderController;