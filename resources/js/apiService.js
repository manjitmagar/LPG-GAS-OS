import axios from "axios";
import Noty from "noty";
export function placeOrder(formObject) {
  axios
    .post("/orders", formObject)
    .then((res) => {
      new Noty({
        type: "success",
        timeout: 1000,
        progressBar: false,
        text: res.data.message,
      }).show();

      setTimeout(() => {
        window.location.href = "/customer/orders";
      }, 1000);
    })
    .catch((err) => {
      new Noty({
        type: "error",
        timeout: 1000,
        progressBar: false,
        text: err.data.message,
      }).show();
    });
}
