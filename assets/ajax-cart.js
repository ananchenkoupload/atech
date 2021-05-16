const defaults = {
    cartModal: '.js-ajax-cart-modal', // classname
    cartModalContent: '.js-ajax-cart-modal-content', // classname
    cartModalClose: '.js-ajax-cart-modal-close', // classname
    cartDrawer: '.js-ajax-cart-drawer', // classname
    cartDrawerContent: '.js-ajax-cart-drawer-content', // classname
    cartDrawerClose: '.js-ajax-cart-drawer-close', // classname
    cartDrawerCloseTrigger: '.js-ajax-cart-drawer-close-trigger', // classname
    cartDrawerTrigger: '.js-ajax-cart-drawer-trigger', // classname
    cartOverlay: '.js-ajax-cart-overlay', // classname
    cartCounter: '.js-ajax-cart-counter', // classname
  	cartCounterHeader: '.js-ajax-cart-counter-header', // classname
    addToCart: '.js-ajax-add-to-cart', // classname
    addToCartCollection: '.js-ajax-add-to-cart-collection', // classname
    removeFromCart: '.js-ajax-remove-from-cart', //classname
    removeFromCartNoDot: 'js-ajax-remove-from-cart', //classname,
    checkoutButton: '.js-ajax-checkout-button',
    qtyPlus: '.js-ajax-cart-quantity-plus',
    qtyMinus: '.js-ajax-cart-quantity-minus',
};

const cartModal = document.querySelector(defaults.cartModal);
const cartModalContent = document.querySelector(defaults.cartModalContent);
const cartModalClose = document.querySelector(defaults.cartModalClose);
const cartDrawer = document.querySelector(defaults.cartDrawer);
const cartDrawerContent = document.querySelector(defaults.cartDrawerContent);
const cartDrawerClose = document.querySelector(defaults.cartDrawerClose);
const cartDrawerCloseTrigger = document.querySelector(defaults.cartDrawerCloseTrigger);
const cartDrawerTrigger = document.querySelector(defaults.cartDrawerTrigger);
const cartOverlay = document.querySelector(defaults.cartOverlay);
const cartCounter = document.querySelector(defaults.cartCounter);
const cartCounterHeader = document.querySelector(defaults.cartCounterHeader);
const addToCart = document.querySelectorAll(defaults.addToCart);
const addToCartCollection = document.querySelectorAll(defaults.addToCartCollection);
let removeFromCart = document.querySelectorAll(defaults.removeFromCart);
const checkoutButton = document.querySelector(defaults.checkoutButton);
const htmlSelector = document.documentElement;
let qtyPlus = document.querySelectorAll(defaults.qtyPlus);
let qtyMinus = document.querySelectorAll(defaults.qtyMinus);
//console.log(qtyPlus);
let formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

      
for (let i = 0; i < addToCart.length; i++) {
    addToCart[i].addEventListener('click', function(event) {
        event.preventDefault();
        //console.log(this.parentNode.parentNode.id);
        const formID = this.parentNode.parentNode.parentNode.parentNode.getAttribute('id'); 
        console.log(formID);
        if ($('.js-ext-popup').hasClass('m-added')) {
            $('.js-ext-popup').removeClass('m-added')
        }
        if ($('.m-ext-single').hasClass('m-added')) {
            $('.m-ext-single').removeClass('m-added')
        }
        addProductToCart(formID);
        recalcEnrouteTRK(true,true)
        $('.site-header__cart-count').removeClass('_hide');
    });
}

$('.js-ajax-add-to-cart-collection').on('click', function(e) {
    e.preventDefault();
    var url = $(this).attr('data-url');
    window.location.href = url; 
})

function reChargeProcessCart() {
    function get_cookie(name){ return( document.cookie.match('(^|; )'+name+'=([^;]*)')||0 )[2] }
    do {
            token=get_cookie('cart');
    }
    while(token == undefined);	var myshopify_domain='{{ shop.permanent_domain }}'
    try { var ga_linker = ga.getAll()[0].get('linkerParam') } catch(err) { var ga_linker ='' }

    return checkout_url= "https://checkout.rechargeapps.com/r/checkout?myshopify_domain=aromatech-systems-canada.myshopify.com&cart_token="+token+"&"+ga_linker;
}

function buildCheckoutLink(cart) {
    if(!cart) return

    let checkoutUrl = '/checkout'
    const checkoutBtn = document.querySelector('.ajax-cart-drawer__buttons a')
    const rechargeProperties = cart.items?.filter(item => item.properties.shipping_interval_frequency)

    if(rechargeProperties.length > 0 && checkoutUrl){
        checkoutUrl = reChargeProcessCart()

        checkoutBtn.setAttribute('href', checkoutUrl)
        // console.error('checkout url', checkoutUrl)
    } else {
        checkoutBtn.setAttribute('href', checkoutUrl)
        // console.error('checkout url', checkoutUrl)
    }
}

function addProductToCart(formID) {
    $.ajax({
        type: 'POST',
        url: '/cart/add.js',
        dataType: 'json',
        data: $('#' + formID)
            .serialize(),
        success: addToCartOk,
        error: addToCartFail,
    });
}

function fetchCart() {
    $.ajax({
        type: 'GET',
        url: '/cart.js',
        dataType: 'json',
        success: function(cart) {
            onCartUpdate(cart);
            buildCheckoutLink(cart)

            if (cart.item_count === 0) {
                cartDrawerContent.innerHTML = '<p class="empty-cart">You have no items in your shopping cart.</p>';
                checkoutButton.classList.add('is-hidden');
                $(".ajax-cart-drawer__buttons").hide();
              	$(".note-wrapper").hide();
              	$(".agree_to_terms_wrapper").hide();
            } else {
                renderCart(cart);
                checkoutButton.classList.remove('is-hidden');
                $(".ajax-cart-drawer__buttons").show();
              	$(".note-wrapper").show();
              	$(".agree_to_terms_wrapper").show();
            }

        },
    });
}

function changeItem(line,qty, callback) {
     const quantity = 0;
     $.ajax({
         type: 'POST',
         url: '/cart/change.js',
         data: 'quantity=' + quantity + '&line=' + line,
         dataType: 'json',
         success: function(cart) {
             if ((typeof callback) === 'function') {
                 callback(cart);
             } else {
                 // onCartUpdate(cart);
                 fetchCart();
                 // removeProductFromCart(qty);
             }
         },
     });
}

function updateCart(qty,line, callback) {
     const quantity = qty;
     $.ajax({
         type: 'POST',
         url: '/cart/change.js',
         data: 'quantity=' + quantity + '&line=' + line,
         dataType: 'json',
         success: function(cart) {
             if ((typeof callback) === 'function') {
                 callback(cart);
             } else {
                 //onCartUpdate(cart);
                 fetchCart();
                 //removeProductFromCart();
             }
         },
     });
}

function onCartUpdate(cart) {
    console.log('update')
  	//cartCounter.innerHTML = cart.item_count;

    if (cart.item_count == 1) {
        cart.items.forEach(function(item, index) {
            if (item.url.includes('enroute')) {
                // $('#enroute').trigger('click');
                return;
            }
        });
    }

    cartCounterHeader.innerHTML = cart.item_count; 
    //console.log('items in the cart?', cart.item_count); 
}
function addToCartOk(product) {
    var qantity=jQuery("#Quantity").val();
    //cartCounter.innerHTML = Number(cartCounter.innerHTML) + Number(qantity); 
  	
  	cartCounterHeader.innerHTML = Number(cartCounterHeader.innerHTML) + Number(qantity);

    fetchCart();

    if ($('.js-ext-popup').length) {
        if (!$('.m-ext-single').hasClass('m-added') && !$('.js-ext-popup').hasClass('m-added')) {
            if ($(window).width() < 768) {
                // setTimeout(function() { 
                    $('.js-ext-popup').fadeIn( "fast", function() { });
                    closeCartDrawer();
                    closeCartOverlay();
                // }, 1000);
            } else {
                // setTimeout(function() { 
                    $('.js-ext-popup').fadeIn( "slow", function() { });
                    closeCartDrawer();
                    closeCartOverlay();
                // }, 1000);
            }
            $('html').addClass('is-locked')
        }
    } else {
        openCartDrawer();
        openCartOverlay();
    }
}

function removeProductFromCart(qty) {
    console.log(qty);
  	console.log(Number(cartCounterHeader.innerHTML));
    return;
    //cartCounter.innerHTML = Number(cartCounter.innerHTML) - qty;
  	cartCounterHeader.innerHTML = Number(cartCounterHeader.innerHTML) - qty;
}

function addToCartFail() {
    cartModalContent.innerHTML = 'The product you are trying to add is out of stock.';
    openCartOverlay();
}

function renderCart(cart) {
    clearCartDrawer();
    cart.items.forEach(function(item, index) {
        if (!item.properties.enroute) {item.properties.enroute = null}
        const productTitle = '<div class="ajax-cart-item__title"><a href="'+ item.url +'">' + item.title + '</a></div>';
        const productImage = '<img class="ajax-cart-item__image" src="' + item.image + '" >';
      	//const productRemove = '<div class="ajax-cart-item__remove"><span class="js-ajax-cart-quantity-minus remove" data-qty="0">remove</span></div>';
        const productPrice = '<div class="ajax-cart-item__price">' + formatter.format(item.line_price/100) + '</div>';
        const productQuantity = '<div class="ajax-cart-item__quantity"><span class="ajax-cart-item__quantity-button js-ajax-cart-quantity-minus" data-qty="'+item.quantity+'">-</span><input class="ajax-cart-item__quantity-number js-ajax-cart-quantity" type="number" value="'+item.quantity+'" disabled><span class="ajax-cart-item__quantity-button js-ajax-cart-quantity-plus" data-qty="'+item.quantity+'">+</span></div>';
        const productRemove = '<div class="ajax-cart-item__remove ' + defaults.removeFromCartNoDot + '"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 6L14 14" stroke="#2F2F2F"/><path d="M6 14L14 6" stroke="#2F2F2F"/></svg></div>'; 
        const edit_product = '<div class="edit-cart-product"><a href="'+ item.url +'">edit product</a></div>';
        const concatProductInfo = '<div class="ajax-cart-item__single" data-enroute="'+item.properties.enroute+'"  data-line="' + Number(index + 1) + '" data-qty="' + item.quantity + '"> <div class="minicart-product-image">' + productImage + '</div>' + '<div class="minicart-product-content">' + productTitle + productRemove + '<div class="minicart-product-qty">' + productQuantity + '</div><div class="product-price">' + productPrice + '</div></div></div>';
        cartDrawerContent.innerHTML = cartDrawerContent.innerHTML + concatProductInfo;
    });

    cartDrawerContent.innerHTML = '<div class="ajax-cart-items">' +  cartDrawerContent.innerHTML + '</div>';
    const cartDrawerSubTotal = '<div class="sub-total-contain"><div class="ajax-cart-drawer__subtotal"><span>Subtotal </span> <span class="ajax-cart-drawer__subtotal-price js-ajax-cart-drawer-subtotal">'+ formatter.format(cart.total_price/100) + '</span></div>  </div> '; 
    cartDrawerContent.innerHTML = cartDrawerContent.innerHTML + cartDrawerSubTotal; 
    
    removeFromCart = document.querySelectorAll(defaults.removeFromCart);
    for (let i = 0; i < removeFromCart.length; i++) {
        removeFromCart[i].addEventListener('click', function() {
            const line = this.parentNode.parentNode.getAttribute('data-line');
            const qty = this.parentNode.parentNode.getAttribute('data-qty'); 
            console.log(this.parentNode)
            console.log(line);

            let is_enroute = $(this).closest('.ajax-cart-item__single').attr('data-enroute');

            setTimeout(function() {
                
                let countEnroutes = $('.ajax-cart-item__single[data-enroute="true"]').length;
 
                if (is_enroute == 'true' && countEnroutes < 2) {
                    // $('div#is-a-gift .tt #enroute').prop('checked', false);
                    $('div#is-a-gift .tt').removeClass('m-active');
                }

            }, 300);
            changeItem(line,qty);
            setTimeout(function() {
                let counterCart = parseInt($('.js-ajax-cart-counter-header').text())
 
                if (counterCart < 1) {
                    $('.site-header__cart-count').addClass('_hide')
                    $('.ajax-cart-summary').addClass('m-hide')
                    setTimeout(function() {
                        if ($('body').hasClass('template-product')) {
                            recalcEnrouteTRK(false, false)
                        }
                    }, 900);
                }
            }, 700);
            if ($('body').hasClass('template-product')) {
                setTimeout(function() {
                    recalcEnrouteTRK(true, undefined)
                }, 300);
            }
            setTimeout(function() {
                var counterCart = parseInt($('.js-ajax-cart-counter-header').text());
                console.log('chekir')
                console.log(counterCart)
                if (counterCart == 1) {
                    if ($(".ajax-cart-item__single").data('enroute') == true) {
                        $('.ajax-cart-item__single[data-enroute="true"]').find('.js-ajax-remove-from-cart').trigger('click');
                        $('.ajax-cart-summary').addClass('m-hide')
                        console.log('chekir succes')
                    }
                }
            }, 900);
            setTimeout(function() {
                let counterCartHd = parseInt($('.js-ajax-cart-counter-header').text())
                if (counterCartHd == 0) {
                    $('.ajax-cart-summary, .ajax-to-cart').addClass('m-hide')
                }  
            }, 700);
        });
    }

    qtyPlus = document.querySelectorAll(defaults.qtyPlus);
    for (let i = 0; i < qtyPlus.length; i++) {
        qtyPlus[i].addEventListener('click', function() { 

            const line = this.parentNode.parentNode.parentNode.parentNode.getAttribute('data-line');
            const qty = parseInt(this.getAttribute("data-qty"))+1;
            updateCart(qty,line);
        });
    }
  
    qtyMinus = document.querySelectorAll(defaults.qtyMinus);
    for (let i = 0; i < qtyMinus.length; i++) {
        qtyMinus[i].addEventListener('click', function() {
            const line = this.parentNode.parentNode.parentNode.parentNode.getAttribute('data-line');
            
            const qty = parseInt(this.getAttribute("data-qty"))-1;
            updateCart(qty,line);
            setTimeout(function() {
                let counterCart = parseInt($('.js-ajax-cart-counter-header').text())
                console.log(counterCart)
                if (counterCart < 1) {
                    $('.site-header__cart-count').addClass('_hide')
                    $('.ajax-cart-summary').addClass('m-hide')
                }
            }, 700);
        }); 
    }
}

function openCartDrawer() {

    // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
    let wh = window.innerHeight * 0.01,
        hh = $('#header').outerHeight() - $(window).scrollTop();
    // Then we set the value in the --vh custom property to the root of the document
    document.documentElement.style.setProperty('--wh', `${wh}px`);
    document.documentElement.style.setProperty('--hh', `${hh}px`);

    cartDrawer.classList.toggle('is-open');
    $("#mobile_menu").removeClass('show');
    $("#mobile_menu_button").removeClass('skip-active');
  	$('body').addClass('overflow_hidden');

    $('.ajax-cart-item__single').each(function () {
        let crItm = $(this)
        if (crItm.attr('data-enroute') == 'true') {
            $('div#is-a-gift .tt').addClass('m-active')
            console.log('ajx5')
            $('div#is-a-gift .tt #enroute').prop('checked', true);
        }
    });

    let counterCartHd = parseInt($('.js-ajax-cart-counter-header').text())
    if (counterCartHd == 0) {
        $('.ajax-cart-summary, .ajax-to-cart').addClass('m-hide')
    }  else {
        $('.ajax-cart-summary, .ajax-to-cart').removeClass('m-hide')
    }
 
}

function closeCartDrawer() {
    cartDrawer.classList.remove('is-open');
  	$('body').removeClass('overflow_hidden');
}

function clearCartDrawer() {
    cartDrawerContent.innerHTML = '';
}

function openAddModal() {
    cartModal.classList.add('is-open');
}

function closeAddModal() {
    cartModal.classList.remove('is-open');
}

function openCartOverlay() {
    cartOverlay.classList.add('is-open');
    // htmlSelector.classList.add('is-locked');
}

function closeCartOverlay() {
    cartOverlay.classList.remove('is-open');
    // htmlSelector.classList.remove('is-locked');
}

cartModalClose.addEventListener('click', function() {
    closeAddModal();
    closeCartOverlay();
});

cartDrawerClose.addEventListener('click', function() {
    /*closeCartDrawer();
    closeCartOverlay();*/
});
cartDrawerCloseTrigger.addEventListener('click', function() {
    closeCartDrawer();
    closeCartOverlay();
}); 
// cart is empty stanje
cartOverlay.addEventListener('click', function() {
    closeAddModal();
    closeCartDrawer();
    closeCartOverlay();
});

// cartDrawerTrigger.addEventListener('click', function(event) {
//     event.preventDefault();
//     //fetchCart();
//     openCartDrawer();
//     openCartOverlay();
// });

document.addEventListener('DOMContentLoaded', function() {
    fetchCart();
}); 

$(document).on("click", ".template-product .product-single .m-ext-single .swatch label, .template-product .m-common-wrap .swatch .swatch-element label", function(event) {
    event.preventDefault();
    let id = $(this).attr('for');
    $('input[id="'+id+'"]').addClass('asd').trigger('change')
});

$(document).on("click", ".js-ajax-cart-drawer-trigger", function(e) {
    e.preventDefault();
    openCartDrawer();
    openCartOverlay();
});

$(document).on("change", ".js-ext, .js-ext-m", function() {
    let currentVariant = $(this).data('vr'),
        parrentWrapSingle =  $(this).closest('.m-ext-single'),
        ID = currentVariant,
        current = $(this);

    parrentWrapSingle.addClass('m-added');

    if ($(this).hasClass('js-ext')) {
        $('.js-ext-popup').addClass('m-added');
    }
 
    $.ajax({
      type: 'POST',
      url: '/cart/add.js',
      data: {
        quantity: 1,
        id: ID,
        properties: { 'enroute': false }
      },
      dataType: 'json', 
      success: function (data) {
        addToCartOk();
        $('.site-header__cart-count').removeClass('_hide');
        if (!parrentWrapSingle.length) {
            $('.js-ext-popup').fadeOut( "slow", function() { });
            $('html').removeClass('is-locked')
        }
        if ($('.js-ext-popup').is(':visible') || current.hasClass('js-ext-m')) {
            openCartDrawer();
            openCartOverlay();
        }
        recalcEnrouteTRK(true,true)
      } 
    });
});

$(document).on("click",".js-ext-close",function() {
    $('.js-ext-popup').fadeOut( "slow", function() { });
    $('html').removeClass('is-locked')
    if ($('.js-ext-popup').is(':visible')) {
        openCartDrawer();
        let counterCartHd = parseInt($('.js-ajax-cart-counter-header').text());
        console.log(counterCartHd)
        setTimeout(function() {
            if ($('body').hasClass('template-product') && counterCartHd == 1) {
                recalcEnrouteTRK(true, false)
                console.log(8484848)
            }
            console.log(124124124)
        }, 700);
        openCartOverlay();
    }
});

$(document).mouseup(function (e) {
    var container = $(".js-ext-popup .m-common-inner");
    if (container.has(e.target).length === 0){
        $('.js-ext-popup').fadeOut( "slow", function() { });
        $('html').removeClass('is-locked')
        if ($('.js-ext-popup').is(':visible')) {
            openCartDrawer();
            let counterCartHd = parseInt($('.js-ajax-cart-counter-header').text());
            console.log(counterCartHd)
            setTimeout(function() {
                if ($('body').hasClass('template-product') && counterCartHd == 1) {
                    recalcEnrouteTRK(true, false)
                    console.log(8484848)
                }
                console.log(124124124)
            }, 700);
            openCartOverlay();
        }
    }
});

$('.checkbox-wrapper > input').on('change', function() {
  
  if ($(this).is(':checked')) {
    $('.ajax-cart-drawer__buttons').removeClass('disabled');
  } else{
    $('.ajax-cart-drawer__buttons').addClass('disabled');
  }

});

$(document).on("click",".cart__remove > a",function(e) {

    e.preventDefault();

    var line = $(this).closest('tr').attr('data-cart-item-index');
    var is_enroute = $(this).closest('tr').attr('data-enroute');

    var productId = $(this).closest('tr').attr('data-id');

    $.ajax({
        type: 'POST',
        url: '/cart/change.js',
        // data: 'quantity=0&line=' + line,
        data: {
            quantity: 0,
            id: productId
        },
        dataType: 'json',
        success: function(cart) {

            var row = $('tr[data-cart-item-index*="' + line + '"]');
            row.fadeOut().remove();

            console.log(cart.item_count)
            
            if (is_enroute == 'true') {
              $('div#is-a-gift .nt').removeClass('m-active');
            }

            if (!cart.item_count) {
                location.reload();
            } else if (cart.item_count == 1) {
                cart.items.forEach(function(item, index) {
                    if (item.url.includes('enroute')) {
                        // $('#enroute').trigger('click');
                        return;
                    }
                });
            }
            
            $('.cart-subtotal-ajax').text(formatter.format(cart.total_price/100));
            cartCounterHeader.innerHTML = cart.item_count; 

            $('.cart-table .cart__row').each(function (){
                let currentIndex = $(this).index(),
                    indx =  Number(currentIndex + 1);
                $(this).attr('data-cart-item-index', indx)
            });

            setTimeout(function() {
                var counterCart = parseInt($('.js-ajax-cart-counter-header').text());
                console.log('chekir n')
                console.log(counterCart)
                if (counterCart == 1) {
                    setTimeout(function() {
                        console.log('chekir 111')
                        console.log($('.cart__row'))
                        if ($('tbody .cart__row').data('enroute') == true) {
                            $('.cart__row[data-enroute="true"]').find('.cart__remove a').trigger('click');
                            console.log('chekir succes')
                        }
                    }, 600);
                }
                recalcEnrouteTRn()
            }, 700);
        },
    });
});

$(document).on("click",".qty-adjust",function(e) {
    var $el = $(this),
        $qtySelector = $el.siblings('.cart__qty-input'),
        qty = parseInt($qtySelector.val().replace(/\D/g, '')),
        available_qty = parseInt($(this).closest('tr').attr('data-item-available-quantity')),
        line = $(this).closest('tr').attr('data-cart-item-index'),
        is_enroute = $(this).closest('tr').attr('data-enroute'),
        update = $('.cart__qty-input'),
        crindex = $(this).closest('tr').index();

    // Add or subtract from the current quantity
    if ($el.hasClass('js-qty__adjust--plus')) {
        if (qty == available_qty) return;
        qty += 1;
    } else {
        qty -= 1;
    }
    //alert(qty);
    $qtySelector.val(qty);
    console.log(line)
    $.ajax({ 
        type: 'POST',
        url: '/cart/change.js',
        data: 'quantity=' + qty + '&line=' + line,
        dataType: 'json',
        success: function(cart) {

            var index = Number(line - 1);
            var product = cart.items[index];
            var row = $('tr[data-cart-item-index*="' + line + '"]');

            if (!qty) {
                console.log(is_enroute)
                if (is_enroute == 'true') {
                    $('.is-a-gift .label-checkbox').removeClass('m-active')
                }
                row.fadeOut().remove(); 
                $('.cart-table .cart__row').each(function (){
                    let currentIndex = $(this).index(),
                        indx =  Number(currentIndex + 1);
                    $(this).attr('data-cart-item-index', indx)
                });
                if (!cart.item_count) {
                    location.reload();
                } else if (cart.item_count == 1) {
                    cart.items.forEach(function(item, index) {
                        if (item.url.includes('enroute')) {
                         
                            return;
                        }
                    });
                } 
            } else {
                $('tr[data-cart-item-index*="' + line + '"] .cart-item-regular-price').text(formatter.format(product.line_price/100));
            }

            $('.cart-subtotal-ajax').text(formatter.format(cart.total_price/100));
            cartCounterHeader.innerHTML = cart.item_count;
        },
        error: function(error) {
            console.log(error);
        },
    });
});

$('.cart__qty-input').on('change', function() {
    var $qtySelector = $(this),
        qty = parseInt($qtySelector.val().replace(/\D/g, '')),
        line = $(this).closest('tr').attr('data-cart-item-index'),
        update = $('.cart__qty-input');

        $qtySelector.val(qty);

        $.ajax({
            type: 'POST',
            url: '/cart/change.js',
            data: 'quantity=' + qty + '&line=' + line,
            dataType: 'json',
            success: function(cart) {
                
                //location.reload();
                // onCartUpdate(cart);
                // $('.cart-subtotal__price').html(''+formatter.format(cart.total_price/100)+'').replace('£', '$')
            },
        });
});


$(document).ready(function () {
    if ($('body').hasClass('template-product')) {
        $('.m-ext-single .money').each(function (index, element) {
            let price = $(this).text()
            $(this).text(formatter.format(price/100))
        });
    }
});
