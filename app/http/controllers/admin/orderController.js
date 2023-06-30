const Order = require("../../../models/order");

function orderController() {
  return {
    async index(req, res) {
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
  };
}

module.exports = orderController;
