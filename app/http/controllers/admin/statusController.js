const menuSchema = require('../../../models/menu');
const Order = require('../../../models/order');
const path = require("path")
const fs = require("fs")

function statusController() {
    return {
        update(req, res) {
            Order.updateOne({ _id: req.body.orderId }, { status: req.body.status }).then(() => {
                const eventEmitter = req.app.get('eventEmitter')
                eventEmitter.emit('orderUpdated', { id: req.body.orderId, status: req.body.status })
                res.redirect('/admin/orders');
            }).catch((err) => {
                res.redirect('/admin/orders');
            });
        },

        async deleteProduct(req, res) {
            try {
                const product = await menuSchema.findById(req.body.productID);

                if (!product) {
                    req.flash("error", "Product Not Found.");
                    return res.redirect("/admin/products/");
                }

                menuSchema.deleteOne(product).then((p) => {
                    const imagePathToDelete = path.join(__dirname, '../../../../public/img', product.image);
                    fs.stat(imagePathToDelete, (err, stat) => {
                        if (err) { 
                            console.log("Image Not Exists");
                        } else {
                            fs.unlinkSync(imagePathToDelete);
                        }
                    });

                    req.flash("success", "Product Deleted Successfully.");
                    return res.redirect("/admin/products/");
                }).catch((err) => {
                    console.log(error);
                    req.flash("error", "Unable to delete product.");
                    return res.redirect("/admin/products/");
                })
            } catch (error) {
                console.log(error);
                req.flash("error", "Unable to delete product.");
                return res.redirect("/admin/products/");
            }
        }
    };
}

module.exports = statusController;