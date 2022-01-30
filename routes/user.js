var express = require("express");
var router = express.Router();
const productHelpers = require("../helpers/product-helpers");
const userHelpers = require("../helpers/user-helper");
const { route } = require("./admin");
const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};

/* GET home page. */
router.get("/", async function (req, res, next) {
  let user = req.session.user;
  console.log(user);
  let cartCount = null;
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id);
  }
  productHelpers.getAllProducts().then((products) => {
    console.log(products);
    res.render("user/view-products", { products, user, cartCount });
  });
});

router.get("/login", (req, res) => {
  if (req.session.loggedIn) {
    res.redirect("/");
  } else {
    res.render("user/login", { loginErr: req.session.loginErr });
    req.session.loginErr = false;
  }
});

router.get("/signup", (req, res) => {
  res.render("user/signup");
});

router.post("/signup", (req, res) => {
  userHelpers.doSignup(req.body).then((data) => {
    if (data.response) {
      req.session.user = data.data;
      req.session.userLoggedIn = true;
      res.redirect("/");
    } else {
      let user = req.session.user;
      res.render("user/signup", {
        loginErr: "Email is already in use..!",
        user,
      });
    }
  });
});

router.post("/login", (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true;
      req.session.user = response.user;
      res.redirect("/");
    } else {
      req.session.loginErr = "Invalid Username or Password";
      res.redirect("/login");
    }
  });
});
router.get("/logout", (req, res) => {
  req.session.user = null;
  req.session.userLoggedIn = false;
  res.redirect("/");
});

router.get("/cart", verifyLogin, async (req, res) => {
  let user = req.session.user;
  let products = await userHelpers.getCartProducts(req.session.user._id);
  let totalValue = 0;
  if (products && products.length > 0) {
    totalValue = await userHelpers.getTotalAmount(req.session.user._id);
  }
  res.render("user/cart", { user, products, totalValue });
});

router.get("/add-to-cart/:id", (req, res) => {
  console.log("api call");
  userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
    // res.redirect('/')
    res.json({ status: true });
  });
});

router.post("/change-product-quantity", (req, res, next) => {
  userHelpers.changeProductQuantity(req.body).then(async (response) => {
    let total = await userHelpers.getTotalAmount(req.body.user);
    response.total = total;
    res.json(response);
  });
});

router.post("/delete-product", (req, res, next) => {
  console.log(req.body);
  userHelpers.delProduct(req.body).then((response) => {
    console.log(response);
    res.json(response);
  });
});
router.post("/place-order", async (req, res) => {
  console.log(Hi);
  let products = await userHelpers.getCartProductList(req.body.userId);
  let totalPrice = await userHelpers.getTotalAmount(req.body.userId);
  console.log(products);
  console.log(totalPrice);
  userHelpers.placeOrder(req.body, products, totalPrice).then((orderId) => {
    if (req.body["payment-method"] === "COD") {
      res.json({ codsuccess: true });
    } else {
      userHelpers.generateRazorpay(orderId, totalPrice).then((response) => {
        res.json(response);
      });
    }
  });
});

router.get("/order-placed", verifyLogin, (req, res) => {
  let user = req.session.user;
  res.render("user/order-placed", { user });
});

router.get("/orders", verifyLogin, async (req, res) => {
  let user = req.session.user;
  let orders = await userHelpers.getUserOrders(req.session.user._id);
  res.render("user/orders", { user, orders });
});


router.get("/view-order-products/:id", verifyLogin, async (req, res) => {
  let products = await userHelpers.getOrderProducts(req.params.id);
  console.log(products);
  let user = req.session.user;
  res.render("user/view-order-products", { user, products });
});

router.post("/payment-verify", (req, res) => {
  console.log(req.body);
  userHelpers
    .verifyPayment(req.body)
    .then(() => {
      userHelpers.changePaymentStatus(req.body["order[receipt]"]).then(() => {
        console.log("Payment successfull");
        res.json({ status: true });
      });
    })
    .catch((err) => {
      console.log(err);
      res.json({ status: false, errMsg: "" });
    });
});

module.exports = router;
