import axios from "axios";
import moment from "moment";
import Noty from "noty";

export async function initAdmin(socket) {
    const orderTableBody = document.querySelector("#orderTableBody");
    const productTableBody = document.querySelector("#productTableBody");
    const usersTableBody = document.querySelector("#usersTableBody");

    let orders = [];
    let markup;

    let products = [];
    let productHtml;

    function generateUsersHTML(users) {
        return users
            .map((user) => {
                return `
                    <tr>
                        <td class="border px-4 py-2 text-green-900">${user.name}</td>
                        <td class="border px-4 py-2">${user.email}</td>
                        <td class="border px-4 py-2">${user.role}</td>
                    </tr>
                `;
            }) .join("");
    }

    if (usersTableBody) {
        await axios.get("/admin/users", {
            headers: {
                "X-Requested-With": "XMLHttpRequest",
            }
        }).then((res) => {
            usersTableBody.innerHTML = generateUsersHTML(res.data);
        }).catch((error) => {
            console.log(err);
        })
    }

    function generateProductHTML() {
        return products
            .map((product) => {
                return `
                    <tr>
                        <td class="border px-4 py-2 text-green-900">${product.name}</td>
                        <td class="border px-4 py-2"><img style="width: auto;height: 100px;" class="h-40 mb-4 mx-auto" src="/public/img/${product.image}" alt="${product.name}"></td> 
                        <td class="border px-4 py-2">${product.price}</td>
                        <td class="border px-4 py-2">${product.size}</td>
                        <td class="border px-4 py-2">
                        <div class="inline-block relative w-64">
                            <form action="/admin/product/delete" method="POST">
                                <input type="hidden" name="productID" value="${product._id}">
                                <button type="submit" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Delete</button>
                            </form>
                        </td>
                    </tr>
                `;
            }) .join("");
    }

    if (productTableBody) {
        await axios.get("/admin/products", {
            headers: {
                "X-Requested-With": "XMLHttpRequest",
            }
        }).then((res) => {
            products = res.data;
            productHtml = generateProductHTML();
            productTableBody.innerHTML = productHtml;
        }).catch((error) => {
            console.log(err);
        })
    }

    if (orderTableBody) {
        axios
            .get("/admin/orders", {
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                },
            })
            .then((res) => {
                orders = res.data;
                markup = generateMarkup(orders);
                orderTableBody.innerHTML = markup;
            })
            .catch((err) => {
                console.log(err);
            });
    }

    function renderItems(items) {
        let parsedItems = Object.values(items);
        return parsedItems
            .map((menuItem) => {
                return `
      <p>${menuItem.item.name} - ${menuItem.qty} pcs </p>
      `;
            })
            .join("");
    }

    function generateMarkup(orders) {
        return orders
            .map((order) => {
                return `
          <tr>
            <td class="border px-4 py-2 text-green-900">
              <p>${order._id}</p>
              <div>${renderItems(order.items)}</div>
            </td>
            <td class="border px-4 py-2">${order.customerId.name}</td> 
            <td class="border px-4 py-2">${order.address}</td>
            <td class="border px-4 py-2">
              <div class="inline-block relative w-64">
                <form action="/admin/order/status" method="POST">
                  <input type="hidden" name="orderId" value="${order._id}">
                  <select name="status" onchange="this.form.submit()"
                    class="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                    <option value="order_placed" ${order.status === "order_placed" ? "selected" : ""
                    }>Placed</option>
                    <option value="confirmed" ${order.status === "confirmed" ? "selected" : ""
                    }>Confirmed</option>
                    <option value="prepared" ${order.status === "prepared" ? "selected" : ""
                    }>Prepared</option>
                    <option value="delivered" ${order.status === "delivered" ? "selected" : ""
                    }>Delivered</option>
                    <option value="completed" ${order.status === "completed" ? "selected" : ""
                    }>Completed</option>
                  </select>
                </form>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </td>
            <td class="border px-4 py-2">${moment(order.createdAt).format("hh:mm A")}
            </td>
               <td class="border px-4 py-2">
              ${order.paymentStatus ? 'Paid By Card ' : 'Cash On Delivery'}
              </td>
          </tr>
        `;
            })
            .join("");
    }

    // Socket event listener for 'orderPlaced'
    socket.on("orderPlaced", (order) => {
        new Noty({
            type: "success",
            timeout: 1000,
            progressBar: false,
            text: "New Order",
        }).show();
        orders.unshift(order);
        orderTableBody.innerHTML = generateMarkup(orders);
    });
}