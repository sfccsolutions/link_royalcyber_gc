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
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var processInclude = __webpack_require__(1);

$(document).ready(function () {
    processInclude(__webpack_require__(2));
   
});

__webpack_require__(4);

/***/ }),
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
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var formValidation = __webpack_require__(3);

module.exports = function () {
    function showNotificationGiftCertificate(response) {
        if ($(".add-to-cart-messages").length === 0) {
            $("body").append("<div class=\"add-to-cart-messages\"></div>");
        }

        $(".add-to-cart-messages").append(
            "<div class=\"alert-success " +
            " add-to-basket-alert text-center\" role=\"alert\">" +
            response.alertmessage +
            "</div>"
        );

        setTimeout(function () {
            $(".add-to-basket-alert").remove();
        }, 10000);
    };

    $('form.purchasegiftcard').submit(function (e) {
        var $form = $(this);
        e.preventDefault();
        var url = $form.attr('action');
        $form.spinner().start();
        $('form.purchasegiftcard').trigger('purchasegiftcard:submit', e);
        $.ajax({
            url: url,
            type: 'post',
            dataType: 'json',
            data: $form.serialize(),
            success: function (data) {
                $form.spinner().stop();
                if (!data.success) {
                    formValidation($form, data);
                } else {
                    showNotificationGiftCertificate(data);
                    window.location.href = data.redirectUrl;
                }
            },
            error: function (err) {
                if (err.responseJSON.redirectUrl) {
                    window.location.href = err.responseJSON.redirectUrl;
                }
                $form.spinner().stop();
            }
        });
        return false;
    });

    $('#btnsubmitcheckbalance').click(function (e) {
        var url = $(this).data('url');
        var giftcard = document.getElementById("giftcardID").value;
        url += giftcard;
        $.ajax({
            url: url,
            type: 'post',
            dataType: 'json',
            success: function (data) {
                if (!data.success) {
                    if (data.ErrorMsg) {
                        $(".invalid-balance-feedback").html(data.ErrorMsg);
                        $(".check-balance-container").empty();
                        $(".giftcard-apply").addClass("d-none");
                    }
                }
                else {
                    var contentHtml = "";
                    contentHtml +=
                        "<span> Gift Card Balance: " +
                        data.value +" "+ data.currency + "</span>";
                    $(".check-balance-container").html(contentHtml);
                    $(".invalid-balance-feedback").empty();
                    if(data.value > 0)
                    {
                        $(".giftcard-apply").removeClass("d-none");
                    }
                }
            },
            error: function (err) {
                if (err.responseJSON.redirectUrl) {
                    window.location.href = err.responseJSON.redirectUrl;
                }
            }
        });
        return false;
    })


    $('#add-giftcard').click(function (e) {
        var url = $(this).data('url');
        var giftcard = document.getElementById("giftcardID").value;
        url += giftcard;
        $.ajax({
            url: url,
            type: "GET",
            cache: false,
            success: function (data) {
                if (!data.status) {
                    $(".check-code-container").empty();
                    $(".check-balance-container").empty();
                    $("#giftcerts-applied").html(data);
                    egPayCheck();
                    $("#giftcardID1").val("");
                } else {
                    $(".check-balance-container").empty();
                    $(".invalid-code-container").html(data.message);
                    $("#giftcardID1").val("");
                    
                }
            },
            error: function (err) {
                if (err.responseJSON.redirectUrl) {
                    window.location.href = err.responseJSON.redirectUrl;
                }
            }

        });
        return false;
    });
    
    /**
     * egPayCheck
     */
    function egPayCheck() {
        var addedGiftCertificate = $(".success.giftcert-pi")
            .last()
            .data("gcpiTotal");
        var totalCartPrice = $(".success.giftcert-pi").data("totalPrice");
        if (addedGiftCertificate === totalCartPrice) {
            var cvvCode = $(
                ".saved-payment-instrument." +
                "selected-payment .saved-payment-security-code"
            );
            cvvCode.val(" ");
        }
    };
    

    if (performance.navigation.type == performance.navigation.TYPE_RELOAD) {
        console.info("This page is reloaded");
        var url = $(".success").data('url');
        if (url) {
            $.ajax({
                url: url,
                type: "GET",
                cache: false,
                success: function (data) {
                    if (!data.status) {
                        $("#giftcerts-applied").html(data);
                        $("#giftcardID").val("");
                    }
                    else {
                        //fail
                    }
                },
                error: function (err) {
                    if (err.responseJSON.redirectUrl) {
                        window.location.href = err.responseJSON.redirectUrl;
                    }
                }
            });
            return false;
        }
        else {
            //reload;
        }
    };

    $("#giftcerts-applied").on("click", ".remove-checkout-gc", function (e) {
        e.preventDefault();
        var url = $(this).attr("href");
        url += $(this).attr("id").split("-")[1];
        $.ajax({
            url: url,
            type: "GET",
            cache: false,
            success: function (data) {
                if (!data.status) {
                    $("#giftcerts-applied").html(data);
                    $(".check-balance-container").empty();
                    $("#giftcardID").val("");
                    $(".giftcard-apply").addClass("d-none");
                }
                else {
                    $(".check-balance-container").empty();
                }

            },
            error: function (err) {
                if (err.responseJSON.redirectUrl) {
                    window.location.href = err.responseJSON.redirectUrl;
                }
            }
        });
        return false;

    });


};





/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Remove all validation. Should be called every time before revalidating form
 * @param {element} form - Form to be cleared
 * @returns {void}
 */
function clearFormErrors(form) {
    $(form).find('.form-control.is-invalid').removeClass('is-invalid');
}

module.exports = function (formElement, payload) {
    // clear form validation first
    clearFormErrors(formElement);
    $('.alert', formElement).remove();

    if (typeof payload === 'object' && payload.fields) {
        Object.keys(payload.fields).forEach(function (key) {
            if (payload.fields[key]) {
                var feedbackElement = $(formElement).find('[name="' + key + '"]')
                    .parent()
                    .children('.invalid-feedback');

                if (feedbackElement.length > 0) {
                    if (Array.isArray(payload[key])) {
                        feedbackElement.html(payload.fields[key].join('<br/>'));
                    } else {
                        feedbackElement.html(payload.fields[key]);
                    }
                    feedbackElement.siblings('.form-control').addClass('is-invalid');
                }
            }
        });
    }
    if (payload && payload.error) {
        var form = $(formElement).prop('tagName') === 'FORM'
            ? $(formElement)
            : $(formElement).parents('form');

        form.prepend('<div class="alert alert-danger" role="alert">'
            + payload.error.join('<br/>') + '</div>');
    }
};


/***/ }),
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


/***/ })
/******/ ]);