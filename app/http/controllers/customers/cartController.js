function cartController() {
    return {
      index(req, res) {
          res.render("customers/cart");
      },
      update(req, res) {
          /*let cart = {
            items: {
              gasId: { item: gasObject, qty: 0 },
            },
            totalQty: 0,
            totalPrice: 0,
          };*/
          //for the first time creating card and ading basic object structure
          if (!req.session.cart) {
              req.session.cart = {
                  items: {},
                  totalQty: 0,
                  totalPrice: 0,
              };
          }
          let cart = req.session.cart;

          let action = "+";
          if( req?.body?.cartAction ){
              action = req?.body?.cartAction;
          }

        // Check if the item exists in the cart
        if (!cart.items[req.body._id]) {
          if (action === "+" && cart.totalQty < 10) {
            cart.items[req.body._id] = {
              item: req.body,
              qty: 1,
            };
            cart.totalQty++;
            cart.totalPrice = parseFloat(cart.totalPrice) + parseFloat(req.body.price);
          }
        } else {
          // Item exists in the cart
          if (action === "+") {
            // Check if the individual item quantity is less than 10
            if (cart.items[req.body._id].qty < 10) {
              cart.items[req.body._id].qty++;
              cart.totalQty++;
              cart.totalPrice = parseFloat(cart.totalPrice) + parseFloat(req.body.price);
            }
          } else {
            // Decrease action
            if (cart.items[req.body._id].qty > 1) {
              cart.items[req.body._id].qty--;
              cart.totalQty--;
              cart.totalPrice = parseFloat(cart.totalPrice) - parseFloat(req.body.price);
            }
          }
        }
        
  
        return res.json({
          productQty: req.session.cart.items[req.body._id].qty,
          totalPrice: req.session.cart.totalPrice,
          totalQty: req.session.cart.totalQty,
        });
      },
    };
  }
  
  module.exports = cartController;




  