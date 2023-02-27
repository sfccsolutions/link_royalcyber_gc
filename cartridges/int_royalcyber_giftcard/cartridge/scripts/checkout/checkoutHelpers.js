/* eslint-disable no-plusplus */

"use strict";

var collections = require("*/cartridge/scripts/util/collections");

var PaymentInstrument = require("dw/order/PaymentInstrument");
var PaymentMgr = require("dw/order/PaymentMgr");
var Transaction = require("dw/system/Transaction");
var Money = require("dw/value/Money");
var AddressModel = require("*/cartridge/models/address");

var ShippingHelper = require("*/cartridge/scripts/checkout/shippingHelpers");
var OrderMgr = require("dw/order/OrderMgr");
var Order = require("dw/order/Order");
var GiftCard = require("*/cartridge/models/giftCardModel");
var Status = require("dw/system/Status");
var BasketMgr = require("dw/order/BasketMgr");

var baseModule = module.superModule;

/**
 * Loop through all shipments and make sure all not null
 * @param {dw.order.LineItemCtnr} lineItemContainer - Current users's basket
 * @returns {boolean} - allValid
 */
function ensureValidShipments(lineItemContainer) {
    ShippingHelper.updateGiftCertificateShipments(lineItemContainer);
    ShippingHelper.removeEmptyShipments(lineItemContainer);
    var shipments = lineItemContainer.shipments;
    var allValid = collections.every(shipments, function (shipment) {
        if (shipment) {
                var address = shipment.shippingAddress;
                return address && address.address1;
            return true;
        }
        return false;
    });
    return allValid;
}

/**
 * Ensures that no shipment exists with 0 product line items
 * @param {Object} req - the request object needed to access session.privacyCache
 */
function ensureNoEmptyShipments(req) {
    Transaction.wrap(function () {
        var currentBasket = BasketMgr.getCurrentBasket();

        var iter = currentBasket.shipments.iterator();
        var shipment;
        var shipmentsToDelete = [];

        while (iter.hasNext()) {
            shipment = iter.next();
            if (shipment.productLineItems.length < 1 && shipmentsToDelete.indexOf(shipment) < 0) {
                if (shipment.default) {
                    // Cant delete the defaultShipment
                    // Copy all line items from 2nd to first
                    var altShipment = baseModule.getFirstNonDefaultShipmentWithProductLineItems(currentBasket);
                    if (!altShipment) return;

                    // Move the valid marker with the shipment
                    var altValid = req.session.privacyCache.get(altShipment.UUID);
                    req.session.privacyCache.set(currentBasket.defaultShipment.UUID, altValid);

                    collections.forEach(altShipment.productLineItems,
                        function (lineItem) {
                            lineItem.setShipment(currentBasket.defaultShipment);
                        });

                    if (altShipment.shippingAddress) {
                        // Copy from other address
                        var addressModel = new AddressModel(altShipment.shippingAddress);
                        baseModule.copyShippingAddressToShipment(addressModel, currentBasket.defaultShipment);
                    } else {
                        // Or clear it out
                        currentBasket.defaultShipment.createShippingAddress();
                    }

                    if (altShipment.custom && altShipment.custom.fromStoreId && altShipment.custom.shipmentType) {
                        currentBasket.defaultShipment.custom.fromStoreId = altShipment.custom.fromStoreId;
                        currentBasket.defaultShipment.custom.shipmentType = altShipment.custom.shipmentType;
                    }

                    currentBasket.defaultShipment.setShippingMethod(altShipment.shippingMethod);
                    // then delete 2nd one
                    shipmentsToDelete.push(altShipment);
                } else {
                    shipmentsToDelete.push(shipment);
                }
            }
        }

        for (var j = 0, jj = shipmentsToDelete.length; j < jj; j++) {
            if (shipmentsToDelete[j].getGiftCertificateLineItems().length === 0) {
                currentBasket.removeShipment(shipmentsToDelete[j]);
            }
        }
    });
}

/**
 * Calculates the amount to be paid by a non-gift certificate payment instrument based on the given basket.
 * The function subtracts the amount of all redeemed gift certificates from the order total and returns this
 * value.
 * @param {dw.order.BasketMgr} currentBasket - basket
 * @returns {dw.value.Money} The amount to be paid by a non-gift certificate payment instrument.
 */
function getNonGiftCertificateAmount(currentBasket) {
    // The total redemption amount of all gift certificate payment instruments in the basket.
    var giftCertTotal = new Money(0.0, currentBasket.getCurrencyCode());

    // Gets the list of all gift certificate payment instruments
    var gcPaymentInstrs = currentBasket.getGiftCertificatePaymentInstruments();
    var iter = gcPaymentInstrs.iterator();
    var orderPI = null;

    // Sums the total redemption amount.
    while (iter.hasNext()) {
        orderPI = iter.next();
        giftCertTotal = giftCertTotal.add(orderPI.getPaymentTransaction().getAmount());
    }

    // Gets the order total.
    var orderTotal = currentBasket.getTotalGrossPrice();

    // Calculates the amount to charge for the payment instrument.
    // This is the remaining open order total that must be paid.
    var amountOpen = orderTotal.subtract(giftCertTotal);

    // Returns the open amount to be paid.
    return amountOpen;
}

/**
 * Sets the payment transaction amount
 * @param {dw.order.Basket} currentBasket - The current basket
 * @returns {Object} an error object
 */
// No need for this rn 
function calculatePaymentTransaction(currentBasket) {
    var result = { error: false };

    try {
        Transaction.wrap(function () {
            // Gets all payment instruments for the basket.
            var iter = currentBasket.getPaymentInstruments().iterator();
            var paymentInstrument = null;
            var nonGCPaymentInstrument = null;
            var giftCertTotal = new Money(0.0, currentBasket.getCurrencyCode());

            // Locates a non-gift certificate payment instrument if one exists.
            while (iter.hasNext()) {
                paymentInstrument = iter.next();
                if (PaymentInstrument.METHOD_GIFT_CERTIFICATE.equals(paymentInstrument.getPaymentMethod())) {
                    giftCertTotal = giftCertTotal.add(paymentInstrument.getPaymentTransaction().getAmount());
                    // eslint-disable-next-line no-continue
                    continue;
                }

                // Captures the non-gift certificate payment instrument.
                nonGCPaymentInstrument = paymentInstrument;
                break;
            }

            // Gets the order total.
            var orderTotal = currentBasket.getTotalGrossPrice();

            // If a gift certificate payment and non-gift certificate payment
            // instrument are found, the function returns true.
            if (!nonGCPaymentInstrument) {
                // If there are no other payment types and the gift certificate
                // does not cover the open amount, then return false.
                if (giftCertTotal < orderTotal) {
                    result.error = true;
                } else {
                    result.error = false;
                }
            } else {
                // Calculates the amount to be charged for the
                // non-gift certificate payment instrument.
                var amount = getNonGiftCertificateAmount(currentBasket);

                // now set the non-gift certificate payment instrument total.
                if (amount.value <= 0.0) {
                    var zero = new Money(0, amount.getCurrencyCode());
                    nonGCPaymentInstrument.getPaymentTransaction().setAmount(zero);
                } else {
                    nonGCPaymentInstrument.getPaymentTransaction().setAmount(amount);
                }
            }
        });
    } catch (e) {
        result.error = true;
    }

    return result;
}

/**
 * Validates payment
 * @param {Object} req - The local instance of the request object
 * @param {dw.order.Basket} currentBasket - The current basket
 * @returns {Object} an object that has error information
 */

// same as base method
function validatePayment(req, currentBasket) {
    var applicablePaymentCards;
    var applicablePaymentMethods;
    var creditCardPaymentMethod = PaymentMgr.getPaymentMethod(PaymentInstrument.METHOD_CREDIT_CARD);
    var paymentAmount = currentBasket.totalGrossPrice.value;
    var countryCode = req.geolocation.countryCode;
    var currentCustomer = req.currentCustomer.raw;
    var paymentInstruments = currentBasket.paymentInstruments;
    var result = {};

    applicablePaymentMethods = PaymentMgr.getApplicablePaymentMethods(
        currentCustomer,
        countryCode,
        paymentAmount
    );
    applicablePaymentCards = creditCardPaymentMethod.getApplicablePaymentCards(
        currentCustomer,
        countryCode,
        paymentAmount
    );

    var invalid = true;

    for (var i = 0; i < paymentInstruments.length; i++) {
        var paymentInstrument = paymentInstruments[i];

        if (PaymentInstrument.METHOD_GIFT_CERTIFICATE.equals(paymentInstrument.paymentMethod)) {
            invalid = false;
        }

        var paymentMethod = PaymentMgr.getPaymentMethod(paymentInstrument.getPaymentMethod());

        if (paymentMethod && applicablePaymentMethods.contains(paymentMethod)) {
            if (PaymentInstrument.METHOD_CREDIT_CARD.equals(paymentInstrument.paymentMethod)) {
                var card = PaymentMgr.getPaymentCard(paymentInstrument.creditCardType);

                // Checks whether payment card is still applicable.
                if (card && applicablePaymentCards.contains(card)) {
                    invalid = false;
                }
            } else {
                invalid = false;
            }
        }

        if (invalid) {
            break; // there is an invalid payment instrument
        }
    }

    result.error = invalid;
    return result;
}

/**
 * Attempts to place the order
 * @param {dw.order.Order} order - The order object to be placed
 * @param {Object} fraudDetectionStatus - an Object returned by the fraud detection hook
 * @returns {Object} an error object
 */
function placeOrder(order, fraudDetectionStatus) {
    var result = { error: false };

    try {
        Transaction.begin();
        var placeOrderStatus = OrderMgr.placeOrder(order);
        if (placeOrderStatus === Status.ERROR) {
            throw new Error();
        }

        if (fraudDetectionStatus.status === "flag") {
            order.setConfirmationStatus(Order.CONFIRMATION_STATUS_NOTCONFIRMED);
        } else {
            // test here
                order.getGiftCertificateLineItems().toArray().map(function (lineItem) {
                lineItem.shipment.setShippingStatus(Order.SHIPPING_STATUS_SHIPPED);
                var test = lineItem;
                GiftCard.sendGiftCertificateEmail(GiftCard.createGiftCertificateFromLineItem(lineItem, order.getOrderNo()));
            })
            //.forEach(GiftCard.sendGiftCertificateEmail);
            if (order.getProductLineItems().length === 0) {
                order.setShippingStatus(Order.SHIPPING_STATUS_SHIPPED);
                order.setStatus(Order.ORDER_STATUS_COMPLETED);
            }
            order.setConfirmationStatus(Order.CONFIRMATION_STATUS_CONFIRMED);
        }

        order.setExportStatus(Order.EXPORT_STATUS_READY);
        Transaction.commit();
    } catch (e) {
        var err = e;
        Transaction.wrap(function () { OrderMgr.failOrder(order, true); });
        result.error = true;
    }

    return result;
}

baseModule.placeOrder = placeOrder;
baseModule.validatePayment = validatePayment;
baseModule.calculatePaymentTransaction = calculatePaymentTransaction;
baseModule.ensureNoEmptyShipments = ensureNoEmptyShipments;
baseModule.ensureValidShipments = ensureValidShipments;
baseModule.getNonGiftCertificateAmount = getNonGiftCertificateAmount;

module.exports = baseModule;
