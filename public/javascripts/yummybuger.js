window.onscroll = () => {
    const nav = document.querySelector('#navbar');
    if(this.scrollY <= 80) nav.className = 'nav-section'; else nav.className = 'nav-section-s';
  }

  new WOW().init();
$(document).ready(function() {
//scroll
    // $(window).scroll(function() {

    //     var height = $('nav').height();
    //     var scrollTop = $(window).scrollTop();

    //     if (scrollTop >= height - 45) {
    //         $('.nav-section').addClass('.nav-section-s');
    //     } else {
    //         $('.nav-section').removeClass('.nav-section-s');
    //     }

    // });

   

});
    // external js: isotope.pkgd.js

    // init Isotope
    var $grid = $('.menu-list').isotope({
        itemSelector: '.menu-card',
        masonry: {
            columnWidth: 100,
            isFitWidth: true
          }
    });

    // store filter for each group
    var filters = {};

    $('.filters').on('click', '.button', function (event) {
        var $button = $(event.currentTarget);
        // get group key
        var $buttonGroup = $button.parents('.button-group');
        var filterGroup = $buttonGroup.attr('data-filter-group');
        // set filter for group
        filters[filterGroup] = $button.attr('data-filter');
        // combine filters
        var filterValue = concatValues(filters);
        // set filter for Isotope
        $grid.isotope({ filter: filterValue });
    });

    // change is-checked class on buttons
    $('.button-group').each(function (i, buttonGroup) {
        var $buttonGroup = $(buttonGroup);
        $buttonGroup.on('click', 'button', function (event) {
            $buttonGroup.find('.is-checked').removeClass('is-checked');
            var $button = $(event.currentTarget);
            $button.addClass('is-checked');
        });
    });

    // flatten object by concatting values
    function concatValues(obj) {
        var value = '';
        for (var prop in obj) {
            value += obj[prop];
        }
        return value;
    }

// /*=============== SHOW MENU ===============*/
// const navMenu = document.getElementById('nav-menu'),
//       navToggle = document.getElementById('nav-toggle'),
//       navClose = document.getElementById('nav-close')

// /*===== MENU SHOW =====*/
// /* Validate if constant exists */
// if(navToggle){
//     navToggle.addEventListener('click', () =>{
//         navMenu.classList.add('show-menu')
//     })
// }

// /*===== MENU HIDDEN =====*/
// /* Validate if constant exists */
// if(navClose){
//     navClose.addEventListener('click', () =>{
//         navMenu.classList.remove('show-menu')
//     })
// }

// /*=============== REMOVE MENU MOBILE ===============*/
// const navLink = document.querySelectorAll('.nav__link')

// const linkAction = () =>{
//     const navMenu = document.getElementById('nav-menu')
//     // When we click on each nav__link, we remove the show-menu class
//     navMenu.classList.remove('show-menu')
// }
// navLink.forEach(n => n.addEventListener('click', linkAction))

// /*=============== CHANGE BACKGROUND HEADER ===============*/
// const scrollHeader = () =>{
//     const header = document.getElementById('header')
//     // When the scroll is greater than 50 viewport height, add the scroll-header class to the header tag
//     this.scrollY >= 50 ? header.classList.add('scroll-header') 
//                        : header.classList.remove('scroll-header')
// }
// window.addEventListener('scroll', scrollHeader)

// /*=============== TESTIMONIAL SWIPER ===============*/
// let testimonialSwiper = new Swiper(".testimonial-swiper", {
//     spaceBetween: 30,
//     loop: 'true',

//     navigation: {
//         nextEl: ".swiper-button-next",
//         prevEl: ".swiper-button-prev",
//     },
// });

function getwhishlist(){
    $.ajax({
        url: '/getwhishlist',
        method: 'get',
        success: function (response) {
            if (response.status) {
                window.location.href="/whishlist"
            } else {
                Swal.fire('your whishlist empty')
            }
        },
        error: function (err) {
            Swal.fire("Error!", "Something went wrong!", "error");
        },
    })
}
function addtowhishlist(id) {

    $.ajax({
        url: '/addtowhishlist',
        data: {
            proId: id
        },
        method: 'post',
        success: function (response) {
            if (response.status) {
            
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'add to whishlist',
                    showConfirmButton: false,
                    timer: 1500
                })
            } else {
                Swal.fire('This product already in whishlist')
            }
        },
        error: function (err) {
            Swal.fire("Error!", "Something went wrong!", "error");
        },
    })
}