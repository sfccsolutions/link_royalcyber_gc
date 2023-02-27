/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 7);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */,
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function (include) {
    if (typeof include === 'function') {
        include();
    } else if (typeof include === 'object') {
        Object.keys(include).forEach(function (key) {
            if (typeof include[key] === 'function') {
                include[key]();
            }
        });
    }
};


/***/ }),
/* 2 */,
/* 3 */,
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Show a spinner inside a given element
 * @param {element} $target - Element to block by the veil and spinner.
 *                            Pass body to block the whole page.
 */
function addSpinner($target) {
    var $veil = $('<div class="veil"><div class="underlay"></div></div>');
    $veil.append('<div class="spinner"><div class="dot1"></div><div class="dot2"></div></div>');
    if ($target.get(0).tagName === 'IMG') {
        $target.after($veil);
        $veil.css({ width: $target.width(), height: $target.height() });
        if ($target.parent().css('position') === 'static') {
            $target.parent().css('position', 'relative');
        }
    } else {
        $target.append($veil);
        if ($target.css('position') === 'static') {
            $target.parent().css('position', 'relative');
            $target.parent().addClass('veiled');
        }
        if ($target.get(0).tagName === 'BODY') {
            $veil.find('.spinner').css('position', 'fixed');
        }
    }
    $veil.click(function (e) {
        e.stopPropagation();
    });
}

/**
 * Remove existing spinner
 * @param  {element} $veil - jQuery pointer to the veil element
 */
function removeSpinner($veil) {
    if ($veil.parent().hasClass('veiled')) {
        $veil.parent().css('position', '');
        $veil.parent().removeClass('veiled');
    }
    $veil.off('click');
    $veil.remove();
}

// element level spinner:
$.fn.spinner = function () {
    var $element = $(this);
    var Fn = function () {
        this.start = function () {
            if ($element.length) {
                addSpinner($element);
            }
        };
        this.stop = function () {
            if ($element.length) {
                var $veil = $('.veil');
                removeSpinner($veil);
            }
        };
    };
    return new Fn();
};

// page-level spinner:
$.spinner = function () {
    var Fn = function () {
        this.start = function () {
            addSpinner($('body'));
        };
        this.stop = function () {
            removeSpinner($('.veil'));
        };
    };
    return new Fn();
};


/***/ }),
/* 5 */,
/* 6 */,
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var processInclude = __webpack_require__(1);

$(document).ready(function () {
    processInclude(__webpack_require__(8));
});

__webpack_require__(4);

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* eslint-disable operator-linebreak */



/* eslint-env es6 */
/* eslint-disable no-console */
/* global $ */

/**
 * Updates the payment information in checkout, based on the supplied order model
 * @param {Object} order - checkout model to use as basis of new truth
 */
function updatePaymentInformation(order) {
    // update payment details
    var $paymentSummary = $(".payment-details-new");
    var htmlToAppend = "";
    
    if (
        order.billing.payment &&
        order.billing.payment.selectedPaymentInstruments &&
        order.billing.payment.selectedPaymentInstruments.length > 0
    ) {
        const $paymentInstruments =
            order.billing.payment.selectedPaymentInstruments;
        
        $paymentInstruments.forEach(function (payment) {
            if (payment.paymentMethod == "GIFT_CERTIFICATE" && payment.amount > 0) {
                htmlToAppend +=
                    "<div> Gift Card </div> <span>" +
                    payment.maskedGiftCertificateCode +
                    "</span>";
            }
            if (payment.paymentMethod === "CREDIT_CARD" && payment.amount > 0) {
                htmlToAppend +=
                    "<span>" +
                    order.resources.cardType +
                    " " +
                    $paymentInstruments[0].type +
                    "</span><div>" +
                    $paymentInstruments[0].maskedCreditCardNumber +
                    "</div><div><span>" +
                    order.resources.cardEnding +
                    " " +
                    $paymentInstruments[0].expirationMonth +
                    "/" +
                    $paymentInstruments[0].expirationYear +
                    "</span></div>";
            }
            

            
        });
    }

    $paymentSummary.empty().append(htmlToAppend);
}

/**
 * updates the order product shipping summary for an order model
 * @param {Object} order - the order model
 */
function updateOrderProductSummaryInformation(order) {
    var $productSummary = $("<div />");
    //console.log(order);
    order.shipping.forEach(function (shipping) {
        console.log(shipping);
        shipping.productLineItems.items.forEach(function (lineItem) {
            var pli = $("[data-product-line-item=" + lineItem.UUID + "]");
            $productSummary.append(pli);
        });

        var address = shipping.shippingAddress || {};
        var selectedMethod = shipping.selectedShippingMethod;

        var nameLine = address.firstName ? address.firstName + " " : "";
        if (address.lastName) nameLine += address.lastName;

        var address1Line = address.address1;
        var address2Line = address.address2;

        var phoneLine = address.phone;

        var shippingCost = selectedMethod ? selectedMethod.shippingCost : "";
        var methodNameLine = selectedMethod ? selectedMethod.displayName : "";
        var methodArrivalTime = selectedMethod && selectedMethod.estimatedArrivalTime
            ? "( " + selectedMethod.estimatedArrivalTime + " )"
            : "";

        var tmpl = $("#pli-shipping-summary-template").clone();

        if (shipping.productLineItems.items && shipping.productLineItems.items.length > 1) {
            $("h5 > span").text(" - " + shipping.productLineItems.items.length + " "
                + order.resources.items);
        } else {
            $("h5 > span").text("");
        }

        var stateRequiredAttr = $("#shippingState").attr("required");
        var isRequired = stateRequiredAttr !== undefined && stateRequiredAttr !== false;
        var stateExists = (shipping.shippingAddress && shipping.shippingAddress.stateCode)
            ? shipping.shippingAddress.stateCode
            : false;
        var stateBoolean = false;
        if ((isRequired && stateExists) || (!isRequired)) {
            stateBoolean = true;
        }

        // eslint-disable-next-line quotes
        var shippingForm = $('.multi-shipping input[name="shipmentUUID"][value="' + shipping.UUID + '"]').parent();

        if (shipping.shippingAddress
            && shipping.shippingAddress.firstName
            && shipping.shippingAddress.address1
            && shipping.shippingAddress.city
            && stateBoolean
            && shipping.shippingAddress.countryCode
            && (shipping.shippingAddress.phone || shipping.productLineItems.items[0].fromStoreId)) {
            $(".ship-to-name", tmpl).text(nameLine);
            $(".ship-to-address1", tmpl).text(address1Line);
            $(".ship-to-address2", tmpl).text(address2Line);
            $(".ship-to-city", tmpl).text(address.city);
            if (address.stateCode) {
                $(".ship-to-st", tmpl).text(address.stateCode);
            }
            $(".ship-to-zip", tmpl).text(address.postalCode);
            $(".ship-to-phone", tmpl).text(phoneLine);

            if (!address2Line) {
                $(".ship-to-address2", tmpl).hide();
            }

            if (!phoneLine) {
                $(".ship-to-phone", tmpl).hide();
            }

            shippingForm.find(".ship-to-message").text("");
        } else {
            shippingForm.find(".ship-to-message").text(order.resources.addressIncomplete);
        }

        if (shipping.isGift) {
            $(".gift-message-summary", tmpl).text(shipping.giftMessage);
        } else {
            $(".gift-summary", tmpl).addClass("d-none");
        }

        // checking h5 title shipping to or pickup
        var $shippingAddressLabel = $(".shipping-header-text", tmpl);
        $("body").trigger("shipping:updateAddressLabelText",
            { selectedShippingMethod: selectedMethod, resources: order.resources, shippingAddressLabel: $shippingAddressLabel });

        if (shipping.selectedShippingMethod) {
            $(".display-name", tmpl).text(methodNameLine);
            $(".arrival-time", tmpl).text(methodArrivalTime);
            $(".price", tmpl).text(shippingCost);
        }
        // eslint-disable-next-line quotes
        var $shippingSummary = $('<div class="multi-shipping" data-shipment-summary="' + shipping.UUID + '" />');
        $shippingSummary.html(tmpl.html());
        $productSummary.append($shippingSummary);
    });

    $(".product-summary-block").html($productSummary.html());

    // Also update the line item prices, as they might have been altered
    $(".grand-total-price").text(order.totals.subTotal);
    if (order.items.items) {
        order.items.items.forEach(function (item) {
            if (item.priceTotal && item.priceTotal.renderedPrice) {
                $(".item-total-" + item.UUID).empty().append(item.priceTotal.renderedPrice);
            }
        });
    }
}

module.exports = function () {
    $(".submit-payment").on("click", function (e, data) {
        e.preventDefault();
        var cvvCode = $(".saved-payment-security-code").val();
        return true;
    });
    $("body").on("checkout:updateCheckoutView", function (e, data) {
        e.preventDefault();
        updatePaymentInformation(data.order);
        updateOrderProductSummaryInformation(data.order);
    });
};


/***/ })
/******/ ]);