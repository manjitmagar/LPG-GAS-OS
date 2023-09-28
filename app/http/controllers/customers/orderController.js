const Order = require("../../../models/order");
const moment = require("moment");
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);

function orderController() {
  return {
    store(req, res) {
      // Validate request
      const { phone, address, stripeToken, paymentType } = req.body;
      if (!phone || !address) {
        return res.status(422).json({ message: 'All fields are required' });
      }

      const order = new Order({
        customerId: req.user._id,
        items: req.session.cart.items,
        phone,
        address,
      });

      order
        .save()
        .then((result) => {
          return Order.populate(result, { path: "customerId" });
        })
        .then((placedOrder) => {
          // Stripe payment
          if (paymentType === 'card') {
            stripe.charges
              .create({
                amount: req.session.cart.totalPrice * 114,
                source: stripeToken,
                currency: 'usd',
                description: `LPG order: ${placedOrder.id}`,
              })
              .then(() => {
                placedOrder.paymentStatus = true
                placedOrder.paymentType = paymentType
                placedOrder
                  .save()
                  .then(() => {
                    // Emit

                    const eventEmitter = req.app.get("eventEmitter");
                    eventEmitter.emit("orderPlaced", placedOrder);
                    delete req.session.cart;
                    return res.json({ message: "Payment successful, Order Placed Successfully" });
                  })
                  .catch((err) => {
                    console.log(err);
                   
                  });
              })
              .catch((err) => {
                delete req.session.cart;
                return res.json({ message: "Payment Failed" });
              });
          } else{
            const eventEmitter = req.app.get("eventEmitter");
            eventEmitter.emit("orderPlaced", placedOrder);
            delete req.session.cart;
            return res.json({ message: "Order placed sucessfully" });
          }
        })
        .catch((err) => {
          
          return res.status(500).json({ message: "Somethingwent wrong" });
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
      try {
        const order = await Order.findById(req.params.id);
        // Authorize user
        if (req.user._id.toString() === order.customerId.toString()) {
          return res.render("customers/singleOrder", { order });
        }
        return res.redirect("/");
      } catch (error) {
        req.flash("error", "Something went wrong");
        return res.redirect("/");
      }
    },
  };
}

module.exports = orderController;
