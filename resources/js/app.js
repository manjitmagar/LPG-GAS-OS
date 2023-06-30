import axios from "axios";
import Noty from "noty";
import { initAdmin } from "./admin";
let addToCart = document.querySelectorAll(".add-to-cart");
let cartCounter = document.querySelector('#cartCounter');

function updateCart(gas) {
  axios.post('/update-cart', gas)
    .then(res => {
      cartCounter.innerText = res.data.totalQty;
      new Noty({
        type: 'success',
        timeout: 1000,
        progressBar: false,
        text: 'Item added to cart'
      }).show();
    })
    .catch(err => {
      new Noty({
        type: 'error',
        timeout: 1000,
        progressBar: false,
        text: 'Something went wrong'
      }).show();
    });
}

addToCart.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    let gas = JSON.parse(btn.dataset.gas);
    updateCart(gas);
    console.log(gas);
  });
});

// Remove alert message after X seconds
const alertMsg = document.querySelector("#success-alert");
if (alertMsg) {
  setTimeout(() => {
    alertMsg.remove();
  }, 2000);
}

initAdmin()