/* eslint-disable operator-linebreak */

"use strict";

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
