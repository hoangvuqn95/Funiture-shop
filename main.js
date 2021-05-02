// variables

// cart
const cartBtn = document.querySelector(".cart-btn");
// close cart
const closeCartBtn = document.querySelector(".close-cart");
// clear all items
const clearCartBtn = document.querySelector(".clear-cart");

const cartDOM = document.querySelector(".cart");
// turn on cart box
const cartOverlay = document.querySelector(".cart-overlay");
// show items on navbar
const itemOnNav = document.querySelector(".cart-item-on-nav");
// total amount
const cartTotal = document.querySelector(".cart-total");
// cart content
const cartContent = document.querySelector(".cart-content");
// remove a item
const cartRemoveItem = document.querySelector(".remove-item");

const productsDOM = document.querySelector(".products-center");

// cart
let cart = [];
// button
let buttonDOM = [];

// getting the products
class Products {
  async getProducts() {
    try {
      let result = await fetch("product.json");
      let data = await result.json();
      let products = data.items;
      products = products.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

// display products
class UI {
  displayProducts(products) {
    let result = "";
    products.forEach((product) => {
      result += `
      <!-- single product -->
      <article class="product">
        <div class="img-container">
          <img 
            src=${product.image} 
            alt="product" 
            class="product-img"
          >
          <button class="bag-btn" data-id=${product.id}>
            <i class="fas fa-shopping-cart">
              Add to bag
            </i>
          </button>
        </div>
        <h3>${product.title}</h3>
        <h4>${product.price}</h4>
      </article>
      <!-- end of single product -->
      `;
    });
    productsDOM.innerHTML = result;
  }

  getBagButtons() {
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttonDOM = buttons;

    buttons.forEach((button) => {
      let id = button.dataset.id;
      let inCart = cart.find((item) => item.id === id);
      if (inCart) {
        button.innerText = "In Cart";
        button.disabled = true;
      }
      button.addEventListener("click", (event) => {
        event.target.innerText = "In Cart";
        event.target.disabled = true;

        // get product from products
        let cartItem = { ...Storage.getProduct(id), amount: 1 };

        // add product to the cart
        cart = [...cart, cartItem];

        // save cart in local storage
        Storage.saveCart(cart);

        // set cart values
        this.setCartValues(cart);

        // display cart item
        this.addCartItem(cartItem);

        // show the cart
        this.showCart();
      });
    });
  }

  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });

    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    itemOnNav.innerText = itemsTotal;
  }

  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
      <img src=${item.image} alt="image">
      <div>
        <h4>${item.title}</h4>
        <h5>${item.price}</h5>
        <span class="remove-item" data-id=${item.id}>remove</span>
      </div>
      <div>
        <i class="fas fa-chevron-up" data-id=${item.id}></i>
        <p class="item-amount">${item.amount}</p>
        <i class="fas fa-chevron-down" data-id=${item.id}></i>
      </div>
    `;
    cartContent.appendChild(div);
  }

  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }

  setupAPP() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }

  populateCart(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }

  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }

  cartLogic() {
    // clear cart button
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });

    // cart functionality - remove a item
    cartContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("remove-item")) {
        let removeSingleItem = event.target;
        let id = removeSingleItem.dataset.id;
        cartContent.removeChild(removeSingleItem.parentElement.parentElement);
        this.removeItem(id);
      }
      // Xoa the ben trong .card-content, lay tu vi tri remove-item, remove-item ben trong 1 the div va` 1 the .cart-item => phai dung` 2 lan parentElement.
      else if (event.target.classList.contains("fa-chevron-up")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      }

      // removeAmount
      else if (event.target.classList.contains("fa-chevron-down")) {
        let removeAmount = event.target;
        let id = removeAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          removeAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(removeAmount.parentElement.parentElement);
        }
      }
    });
  }

  clearCart() {
    let cartItem = cart.map((item) => item.id);
    cartItem.forEach((id) => this.removeItem(id));

    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    console.log(cartContent);
    this.hideCart();
  }
  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>Add to bag`;
  }
  getSingleButton(id) {
    return buttonDOM.find((button) => button.dataset.id === id);
  }
}

// local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }

  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id === id);
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();

  // setup app
  ui.setupAPP();

  // get all products
  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });
});

// localStorage.setItem("products", JSON.stringify(products)); dua item vao localStorage
