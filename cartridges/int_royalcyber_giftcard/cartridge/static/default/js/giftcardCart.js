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
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
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
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var processInclude = __webpack_require__(1);

$(document).ready(function () {
    processInclude(__webpack_require__(6));
    
});

__webpack_require__(4);

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function appendToUrl(url, params) {
    var newUrl = url;
    newUrl += (newUrl.indexOf("?") !== -1 ? "&" : "?")
        + Object.keys(params)
            .map(function (key) {
                return key + "=" + encodeURIComponent(params[key]);
            })
            .join("&");

    return newUrl;
}

/**
 * re-renders the order totals and the number of items in the cart
 * @param {Object} data - AJAX response from the server
 */
function updateCartTotals(data) {
    $(".number-of-items").empty().append(data.resources.numberOfItems);
    $(".shipping-cost").empty().append(data.totals.totalShippingCost);
    $(".tax-total").empty().append(data.totals.totalTax);
    $(".grand-total").empty().append(data.totals.grandTotal);
    $(".sub-total").empty().append(data.totals.subTotal);
    $(".minicart-quantity").empty().append(data.numItems);
    $(".minicart-link").attr({
        "aria-label": data.resources.minicartCountOfItems,
        title: data.resources.minicartCountOfItems
    });
    if (data.totals.orderLevelDiscountTotal.value > 0) {
        $(".order-discount").removeClass("hide-order-discount");
        $(".order-discount-total")
            .empty()
            .append("- " + data.totals.orderLevelDiscountTotal.formatted);
    } else {
        $(".order-discount").addClass("hide-order-discount");
    }

    if (data.totals.shippingLevelDiscountTotal.value > 0) {
        $(".shipping-discount").removeClass("hide-shipping-discount");
        $(".shipping-discount-total")
            .empty()
            .append(
                "- " + data.totals.shippingLevelDiscountTotal.formatted
            );
    } else {
        $(".shipping-discount").addClass("hide-shipping-discount");
    }

    data.items.items.forEach(function (item) {
        if (item.renderedPromotions) {
            $(".item-" + item.UUID)
                .empty()
                .append(item.renderedPromotions);
        }
        if (item.priceTotal && item.priceTotal.renderedPrice) {
            $(".item-total-" + item.UUID)
                .empty()
                .append(item.priceTotal.renderedPrice);
        }
    });
}

/**
 * re-renders the approaching discount messages
 * @param {Object} approachingDiscounts - updated approaching discounts for the cart
 */
function updateApproachingDiscounts(approachingDiscounts) {
    var html = "";
    $(".approaching-discounts").empty();
    if (approachingDiscounts.length > 0) {
        approachingDiscounts.forEach(function (item) {
            html += "<div class=\"single-approaching-discount text-center\">"
                + item.discountMsg
                + "</div>";
        });
    }
    $(".approaching-discounts").append(html);
}

/**
 * Checks whether the basket is valid. if invalid displays error message and disables
 * checkout button
 * @param {Object} data - AJAX response from the server
 */
function validateBasket(data) {
    if (data.valid.error) {
        if (data.valid.message) {
            var errorHtml = "<div class=\"alert alert-danger alert-dismissible valid-cart-error "
                + "fade show\" role=\"alert\">"
                + "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">"
                + "<span aria-hidden=\"true\">&times;</span>"
                + "</button>"
                + data.valid.message
                + "</div>";

            $(".cart-error").append(errorHtml);
        } else {
            $(".cart")
                .empty()
                .append(
                    "<div class=\"row\"> "
                    + "<div class=\"col-12 text-center\"> "
                    + "<h1>"
                    + data.resources.emptyCartMsg
                    + "</h1> "
                    + "</div> "
                    + "</div>"
                );
            $(".number-of-items")
                .empty()
                .append(data.resources.numberOfItems);
            $(".minicart-quantity").empty().append(data.numItems);
            $(".minicart-link").attr({
                "aria-label": data.resources.minicartCountOfItems,
                title: data.resources.minicartCountOfItems
            });
            $(".minicart .popover").empty();
            $(".minicart .popover").removeClass("show");
        }

        $(".checkout-btn").addClass("disabled");
    } else {
        $(".checkout-btn").removeClass("disabled");
    }
}

/**
 * re-renders the order totals and the number of items in the cart
 * @param {Object} message - Error message to display
 */
function createErrorNotification(message) {
    var errorHtml = "<div class=\"alert alert-danger alert-dismissible valid-cart-error "
        + "fade show\" role=\"alert\">"
        + "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">"
        + "<span aria-hidden=\"true\">&times;</span>"
        + "</button>"
        + message
        + "</div>";

    $(".cart-error").append(errorHtml);
}

module.exports = function () {
    $("body").on("click", ".remove-gift-item", function (e) {
        e.preventDefault();
        var $this = $(this);
        var actionUrl = $this.data("action");
        var uuid = $this.data("uuid");
        var $deleteConfirmBtn = $(".delete-giftcard-confirmation-btn");
        $deleteConfirmBtn.data("uuid", uuid);
        $deleteConfirmBtn.data("action", actionUrl);
        var $minicart = $(".minicart .popover");
        if ($minicart.hasClass("show")) {
            $minicart.removeClass("show");
        }
    });

    $("body").off("click", ".delete-giftcard-confirmation-btn");

    $("body").on("click", ".delete-giftcard-confirmation-btn", function (e) {
        e.preventDefault();
        var $this = $(this);
        var url = $this.data("action");
        var uuid = $this.data("uuid");
        var urlParams = {
            uuid: uuid
        };
        url = appendToUrl(url, urlParams);
        $("body > .modal-backdrop").remove();
        $.spinner().start();
        $.ajax({
            url: url,
            type: "get",
            dataType: "json",
            success: function (data) {
                if (
                    data.items.length === 0 && data.giftcertificates.length === 0
                ) {
                    $(".cart")
                        .empty()
                        .append(
                            "<div class=\"row\"> "
                            + "<div class=\"col-12 text-center\"> "
                            + "<h1>"
                            + data.resources.emptyCartMsg
                            + "</h1> "
                            + "</div> "
                            + "</div>"
                        );
                    var $minicart = $(".minicart");
                    var $minicartPopover = $minicart.find(".popover");

                    $(".number-of-items")
                        .empty()
                        .append(data.resources.numberOfItems);
                    $(".minicart-quantity").empty().append(data.numItems);
                    $minicartPopover.empty().removeClass("show");
                    $("body").removeClass("modal-open");
                    $("html").removeClass("veiled");
                } else {
                    $(".uuid-" + uuid).remove();
                    $(".coupons-and-promos")
                        .empty()
                        .append(data.totals.discountsHtml);
                    updateCartTotals(data);
                    updateApproachingDiscounts(data.approachingDiscounts);
                    $("body").trigger("setShippingMethodSelection", data);
                    validateBasket(data);
                }
                $.spinner().stop();
            },
            error: function (err) {
                if (err.responseJSON.redirectUrl) {
                    window.location.href = err.responseJSON.redirectUrl;
                } else {
                    createErrorNotification(err.responseJSON.errorMessage);
                    $.spinner().stop();
                }
            }
        });
    });

    $("body").off("click", ".cart-delete-confirmation-btn");

    $("body").on("click", ".cart-delete-confirmation-btn", function (e) {
        e.preventDefault();

        var productID = $(this).data("pid");
        var url = $(this).data("action");
        var uuid = $(this).data("uuid");
        var urlParams = {
            pid: productID,
            uuid: uuid
        };

        url = appendToUrl(url, urlParams);

        $("body > .modal-backdrop").remove();

        $.spinner().start();
        $.ajax({
            url: url,
            type: "get",
            dataType: "json",
            success: function (data) {
                if (
                    data.basket.items.length === 0 && data.basket.giftcertificates.length === 0
                ) {
                    $(".cart")
                        .empty()
                        .append(
                            "<div class=\"row\"> "
                            + "<div class=\"col-12 text-center\"> "
                            + "<h1>"
                            + data.basket.resources.emptyCartMsg
                            + "</h1> "
                            + "</div> "
                            + "</div>"
                        );
                    $(".number-of-items")
                        .empty()
                        .append(data.basket.resources.numberOfItems);
                    $(".minicart-quantity")
                        .empty()
                        .append(data.basket.numItems);
                    $(".minicart-link").attr({
                        "aria-label":
                            data.basket.resources.minicartCountOfItems,
                        title: data.basket.resources.minicartCountOfItems
                    });
                    $(".minicart .popover").empty();
                    $(".minicart .popover").removeClass("show");
                    $("body").removeClass("modal-open");
                    $("html").removeClass("veiled");
                } else {
                    if (
                        data.toBeDeletedUUIDs && data.toBeDeletedUUIDs.length > 0
                    ) {
                        for (var i = 0; i < data.toBeDeletedUUIDs.length; i++) {
                            $(".uuid-" + data.toBeDeletedUUIDs[i]).remove();
                        }
                    }
                    $(".uuid-" + uuid).remove();
                    if (!data.basket.hasBonusProduct) {
                        $(".bonus-product").remove();
                    }
                    $(".coupons-and-promos")
                        .empty()
                        .append(data.basket.totals.discountsHtml);
                    updateCartTotals(data.basket);
                    updateApproachingDiscounts(
                        data.basket.approachingDiscounts
                    );
                    $("body").trigger(
                        "setShippingMethodSelection",
                        data.basket
                    );
                    validateBasket(data.basket);
                }

                $("body").trigger("cart:update");

                $.spinner().stop();
            }
        });
    });
};


/***/ })
/******/ ]);