const defaults = {
    cartModal: '.js-ajax-cart-modal', // classname
    cartModalContent: '.js-ajax-cart-modal-content', // classname
    cartModalClose: '.js-ajax-cart-modal-close', // classname
    cartDrawer: '.js-ajax-cart-drawer', // classname
    cartDrawerContent: '.js-ajax-cart-drawer-content', // classname
    cartDrawerClose: '.js-ajax-cart-drawer-close', // classname
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
let formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'GBP' });

      
for (let i = 0; i < addToCart.length; i++) {
    addToCart[i].addEventListener('click', function(event) {
        event.preventDefault();
        //console.log(this.parentNode.parentNode.id);
        const formID = this.parentNode.parentNode.parentNode.parentNode.getAttribute('id'); 
        console.log(formID);
        addProductToCart(formID);
    });
}

/*$('.js-ajax-add-to-cart-collection').on('click', function(e) {
    e.preventDefault();
    const formID = $(this).closest('form').attr('id');
    addProductToCart(formID);
})*/

for (let i = 0; i < addToCartCollection.length; i++) {
    addToCartCollection[i].addEventListener('click', function(event) {
        event.preventDefault();
        console.log('testttttttt');
        const formID = this.parentNode.parentNode.getAttribute('id'); 
        console.log(formID);
        addProductToCart(formID);
    });
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
                 onCartUpdate(cart);
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
                 onCartUpdate(cart);
                 fetchCart();
                 //removeProductFromCart();
             }
         },
     });
}

function onCartUpdate(cart) {
  	//cartCounter.innerHTML = cart.item_count; 
    cartCounterHeader.innerHTML = cart.item_count; 
    //console.log('items in the cart?', cart.item_count); 
}
function addToCartOk(product) {
    var qantity=jQuery("#Quantity").val();
    //cartCounter.innerHTML = Number(cartCounter.innerHTML) + Number(qantity); 
  	
  	cartCounterHeader.innerHTML = Number(cartCounterHeader.innerHTML) + Number(qantity);
  
    openCartDrawer();
    openCartOverlay();
    fetchCart();
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
        const productTitle = '<div class="ajax-cart-item__title"><a href="'+ item.url +'">' + item.title + '</a></div>';
        const productImage = '<img class="ajax-cart-item__image" src="' + item.image + '" >';
      	//const productRemove = '<div class="ajax-cart-item__remove"><span class="js-ajax-cart-quantity-minus remove" data-qty="0">remove</span></div>';
        const productPrice = '<div class="ajax-cart-item__price">' + formatter.format(item.line_price/100) + '</div>';
        const productQuantity = '<div class="ajax-cart-item__quantity"><span class="ajax-cart-item__quantity-button js-ajax-cart-quantity-minus" data-qty="'+item.quantity+'">-</span><input class="ajax-cart-item__quantity-number js-ajax-cart-quantity" type="number" value="'+item.quantity+'" disabled><span class="ajax-cart-item__quantity-button js-ajax-cart-quantity-plus" data-qty="'+item.quantity+'">+</span></div>';
        const productRemove = '<div class="ajax-cart-item__remove ' + defaults.removeFromCartNoDot + '"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 6L14 14" stroke="#2F2F2F"/><path d="M6 14L14 6" stroke="#2F2F2F"/></svg></div>'; 
        const edit_product = '<div class="edit-cart-product"><a href="'+ item.url +'">edit product</a></div>';
        const concatProductInfo = '<div class="ajax-cart-item__single" data-line="' + Number(index + 1) + '" data-qty="' + item.quantity + '"> <div class="minicart-product-image">' + productImage + '</div>' + '<div class="minicart-product-content">' + productTitle + productRemove + '<div class="minicart-product-qty">' + productQuantity + '</div><div class="product-price">' + productPrice + '</div></div></div>';
        cartDrawerContent.innerHTML = cartDrawerContent.innerHTML + concatProductInfo;
    });
    cartDrawerContent.innerHTML = '<div class="ajax-cart-items">' +  cartDrawerContent.innerHTML + '</div>';
    const cartDrawerSubTotal = '<div class="sub-total-contain"><div class="ajax-cart-drawer__subtotal"><span>Subtotal </span> <span class="ajax-cart-drawer__subtotal-price js-ajax-cart-drawer-subtotal">'+ formatter.format(cart.total_price/100) + '</span></div>  </div> </div>'; 
    cartDrawerContent.innerHTML = cartDrawerContent.innerHTML + cartDrawerSubTotal; 

    
    removeFromCart = document.querySelectorAll(defaults.removeFromCart);
    for (let i = 0; i < removeFromCart.length; i++) {
        removeFromCart[i].addEventListener('click', function() {
            const line = this.parentNode.parentNode.getAttribute('data-line');
            const qty = this.parentNode.parentNode.getAttribute('data-qty'); 
            console.log(this.parentNode)
            console.log(line);
            changeItem(line,qty);
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
            console.log(line);
            const qty = parseInt(this.getAttribute("data-qty"))-1;
            updateCart(qty,line);
        }); 
    }

}

function openCartDrawer() {
    cartDrawer.classList.toggle('is-open');
    $("#mobile_menu").removeClass('show');
    $("#mobile_menu_button").removeClass('skip-active');
  	$('body').addClass('overflow_hidden');
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
    htmlSelector.classList.add('is-locked');
}

function closeCartOverlay() {
    cartOverlay.classList.remove('is-open');
    htmlSelector.classList.remove('is-locked');
}

cartModalClose.addEventListener('click', function() {
    closeAddModal();
    closeCartOverlay();
});

cartDrawerClose.addEventListener('click', function() {
    closeCartDrawer();
    closeCartOverlay();
});
// cart is empty stanje
cartOverlay.addEventListener('click', function() {
    closeAddModal();
    closeCartDrawer();
    closeCartOverlay();
});

cartDrawerTrigger.addEventListener('click', function(event) {
    event.preventDefault();
    //fetchCart();
    openCartDrawer();
    openCartOverlay();
});

document.addEventListener('DOMContentLoaded', function() {
    fetchCart();
}); 


$('.checkbox-wrapper > input').on('change', function() {
  
  if ($(this).is(':checked')) {
   	console.log('checked');
    $('.ajax-cart-drawer__buttons').removeClass('disabled');
  } else{
    console.log('not checked');
    $('.ajax-cart-drawer__buttons').addClass('disabled');
  }
  

});