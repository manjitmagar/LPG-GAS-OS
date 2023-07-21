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

            //chk if items doesnot exist in cart
            if (!cart.items[req.body._id]) {
                if( action == '+' ){
                    cart.items[req.body._id] = {
                        item: req.body,
                        qty: 1,
                    };
                    cart.totalQty = cart.totalQty + 1;
                    cart.totalPrice = parseFloat(cart.totalPrice) + parseFloat(req.body.price);
                }
            } else {
                if( action == '+' ){
                    cart.items[req.body._id].qty = cart.items[req.body._id].qty + 1;
                    cart.totalQty = cart.totalQty + 1
                    cart.totalPrice = parseFloat(cart.totalPrice) + parseFloat(req.body.price)
                }else{
                    if( cart.items[req.body._id].qty > 1 ){
                        cart.items[req.body._id].qty = cart.items[req.body._id].qty - 1;
                        cart.totalQty = cart.totalQty - 1
                        cart.totalPrice = parseFloat(cart.totalPrice) - parseFloat(req.body.price);
                    }
                }
            }
            return res.json({
                productQty: req.session.cart.items[req.body._id].qty,
                totalPrice: req.session.cart.totalPrice,
                totalQty : req.session.cart.totalQty
            });
        },
    };
}

module.exports = cartController;
