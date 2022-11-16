
// console.log($("#signupForm").serialize()+'&'+$("#signupForm").serialize())
function sendOtp() {
    let phoneNumber = document.getElementById('phone-number').value
    console.log(phoneNumber);
    $.ajax({
        url: '/sendotp',
        method: 'post',
        data: { "phoneNumber": phoneNumber },
        success: (response) => {
            // location.reload(); 
            document.getElementById('user-name').style.display = "none"
            document.getElementById('user-email').style.display = "none"
            document.getElementById('user-phn').style.display = "none"
            document.getElementById('user-password').style.display = "none"
            document.getElementById('user-confirm-password').style.display = "none"
            document.getElementById('signup-btn').style.display = "none"
            document.getElementById('otp-body').style.display = "block"
            document.getElementById('verfiy-button').style.display = "block"

        }
    })


}




function submit_signup() {
    let name = document.getElementById('name').value;
    let email = document.getElementById('emailid').value;
    let phoneNumber = document.getElementById('phone-number').value
    let password = document.getElementById('password_s').value;
    let otp = document.getElementById('otp').value
    // $("#signupForm").serialize(),
    $.ajax({
        url: "/signup",
        method: "POST",
        data: {
            "name": name,
            "email": email,
            "number": phoneNumber,
            "password": password,
            "otp": otp
        },
        success: function (response) {

            if (response.valid) {

                Swal.fire({
                    title: "Good job!",
                    text: "You Registration success!",
                    icon: "success",
                    timer: 3000,
                    showConfirmButton: false
                }).then(() => {
                    window.location.href = '/';
                })

            } else {
                Swal.fire("OTP wrong!", "Please enter correct OTP", "error");
            }
        },
        error: function (err) {
            Swal.fire("Error!", "Something went wrong!", "error");
        },
    });
}


//siginupform


$(document).ready(function () {

    $.validator.methods.email = function (value, element) {
        return this.optional(element) || /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value);
    }
    $("#signinForm").validate({

        rules: {
            email: {
                required: true,
                email: true,
            },
            password: {
                minlength: 5
            },

        },
        messages: {
            email: {
                email: "Please enter a valid Email id",
            },
        },
        submitHandler: function (form) {
            console.log("in function submit");
            submit_signin();
        },
    });
});
function submit_signin() {
    
    $.ajax({
        url: "/signin",
        data: $("#signinForm").serialize(),
        method: "POST",
        success: function (response) {
            console.log("ressssss", response.blockStatus)
            if (response.blockStatus) {
                Swal.fire({
                    title: "Oops..",
                    text: "your are blocked",
                    icon: "error",
                    // buttons: true,
                    // dangerMode: true
                })
            } else if (response.status) {
                Swal.fire({
                    title: "Good job!",
                    text: "Login success!",
                    icon: "success",
                    timer: 4000,
                    showConfirmButton: false

                }).then(() => {
                    window.location.href = '/';
                })

            } else {
                console.log('fgdfg', response)
                Swal.fire({
                    title: "Oops..",
                    text: response,
                    icon: "error",
                    // buttons: true,
                    // dangerMode: true

                }).then(() => {
                    window.location.href = '/';
                })
            }
        },
        error: function (err) {
            swal("Error!", "Something went wrong!", "error");
        },
    });
}






var nub

function otplogin() {
    $.ajax({
        url: "/otplogin",
        data: $("#otplog").serialize(),
        method: "POST",
        success: function (response) {
            if (response.num) {
                nub = response.num;
                document.getElementById("ot").click();
            } else if (response.res) {
                Swal.fire({
                    title: "Oops..",
                    text: response.res,
                    icon: "error",

                })

                // } else {
                //     console.log('fgdfg', response)
                //     Swal.fire({
                //         title: "Oops..",
                //         text: response,
                //         icon: "error",
                //         // buttons: true,
                //         // dangerMode: true

                //     }).then(() => {
                //         window.location.href = '/';
                //     })
            }
        },
        error: function (err) {
            swal("Error!", "Something went wrong!", "error");
        },
    });
}


function ot() {
    
    let otp = document.getElementById('otpvalue').value;
    let numb = nub
    $.ajax({
        url: "/otpnum",
        data: {
            "number": numb,
            "otp": otp
        },
        method: "POST",
        success: function (response) {
            if (response.valid) {
                Swal.fire({
                    title: "Good job!",
                    text: "You login success!",
                    icon: "success",
                    timer: 3000,
                    showConfirmButton: false
                }).then(() => {
                    window.location.href = '/';
                })

            } else {
                Swal.fire("OTP wrong!", "Please enter correct OTP", "error");
            }
        },
        error: function (err) {
            swal("Error!", "Something went wrong!", "error");
        },
    });
}



