
const authController = require("../app/http/controllers/authController");
const homeController = require("../app/http/controllers/homeController");
const cartController = require("../app/http/controllers/customers/cartController");
const orderController = require("../app/http/controllers/customers/orderController");
const adminOrderController = require("../app/http/controllers/admin/orderController");
const statusController = require("../app/http/controllers/admin/statusController");

// Middlewares
const guest = require("../app/http/middlewares/guest");
const auth = require("../app/http/middlewares/auth");
const admin = require("../app/http/middlewares/admin");

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dirname = path.join(__dirname, '../public/img');
    cb(null, dirname);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = file.fieldname + '-' + uniqueSuffix + extension;
    cb(null, filename);
  }
});

const upload = multer({ storage: storage }).single('image');

function initRoutes(app) {
  homeController()
  app.get("/", homeController().index);
  app.get("/login", guest, authController().login);
  app.post("/login", authController().postLogin);
  app.get("/register", guest, authController().register);
  app.post("/register", authController().postRegister);
  app.post("/logout", authController().logout);

  app.get("/cart", cartController().index);
  app.post("/update-cart", cartController().update);
  //app.post("/cart/remove-item", cartController().deleteItem);

  //Customer routes

  app.post("/orders", auth, orderController().store);
  app.get("/customer/orders", auth, orderController().index);
  app.get("/customer/orders/:id", auth, orderController().show);

  //Admin routeso
  app.get("/admin/orders", admin, adminOrderController().index);
  app.get("/admin/users", admin, adminOrderController().users);
  app.post("/admin/order/status", admin, statusController().update);
  app.get("/admin/product/add", auth, adminOrderController().add);
  app.get("/admin/products", auth, adminOrderController().products);
  app.post("/admin/product/add", auth, upload, adminOrderController().submitOrder);
  app.post("/admin/product/delete", admin, statusController().deleteProduct);
}

module.exports = initRoutes;
