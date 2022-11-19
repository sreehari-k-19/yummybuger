//login form

const loginText = document.querySelector(".title-text .login");
const loginForm = document.querySelector("form.login");
const loginBtn = document.querySelector("label.login");
const signupBtn = document.querySelector("label.signup");
const signupLink = document.querySelector("form .signup-link a");
signupBtn.onclick = (() => {
  loginForm.style.marginLeft = "-50%";
  loginText.style.marginLeft = "-50%";
});
loginBtn.onclick = (() => {
  loginForm.style.marginLeft = "0%";
  loginText.style.marginLeft = "0%";
});
signupLink.onclick = (() => {
  signupBtn.click();
  return false;
});

//hide password

const togglePassword = document.querySelector("#togglePassword");
const password = document.querySelector("#password");
const togglePassword_s = document.querySelector("#togglePassword_s");
const password_s = document.querySelector("#password_s");

togglePassword.addEventListener("click", function () {
  // toggle the type attribute
  const type = password.getAttribute("type") === "password" ? "text" : "password";
  password.setAttribute("type", type);
  // toggle the icon
  this.classList.toggle("bi-eye");
});

togglePassword_s.addEventListener("click", function () {
  const type = password_s.getAttribute("type") === "password" ? "text" : "password";
  password_s.setAttribute("type", type);
  this.classList.toggle("bi-eye");
});

// prevent form submit
const form = document.querySelector("form");
form.addEventListener('submit', function (e) {
  e.preventDefault();
});


//floating button

const inputs = document.querySelectorAll("input");

inputs.forEach((input) => {
  input.addEventListener("blur", (event) => {
    if (event.target.value) {
      input.classList.add("is-valid");
    } else {
      input.classList.remove("is-valid");
    }
  });
});



function addtoCart(proId,proName) {
  $.ajax({
    url: `/addtocart/${proId}/${proName}`,
    method: "get",
    success: function (response) {

      if (response.status) {
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'addtocart',
          showConfirmButton: false,
          timer: 1500
        })
        let count = $('#cart-count').html()
        count = parseInt(count) + 1
        $('#cart-count').html(count)
      }else{
        Swal.fire("Already in cart !");
      }
    },
    error: function (err) {
      Swal.fire("Error!", "Something went wrong!", "error");
    },
  });
}


function changeQuantity(cartId, proId, count, name, userId) {
  let quantity = parseInt(document.getElementById(proId).innerHTML)
  console.log("userid",userId)
  count = parseInt(count)
  $.ajax({
    url: '/changeProductQ',
    data: {
      userId: userId,
      cart: cartId,
      proId: proId,
      count: count,
      quantity: quantity
    },
    method: 'post',
    success: (response) => {
      if (response.removeProduct) {
        Swal.fire(name, 'Removed from cart').then(() => {
          location.reload()
        })
      } else {
        console.log(response)
        document.getElementById(proId).innerHTML = quantity + count;
        document.getElementById("total-value").innerHTML=response.cartTotal;
      }
    }

  })
}

function deletecartProduct(cartId, proId,name) {
        
  $.ajax({
      url: '/removecartproduct',
      data: {
        cart: cartId,
        proId: proId
      },
      method: 'post',
      success: (response) => {
          if (response.deleteProduct) {
            Swal.fire(name, 'Removed from cart').then(() => {
              location.reload()
            })
            
          }
          else {
              document.getElementById(proId).innerHTML = response.deleteProduct
          }

      }
  });
};

