"use strict";

/* global empty */
var collections = require("*/cartridge/scripts/util/collections");
var ShippingMgr = require("dw/order/ShippingMgr");
var ArrayList = require("dw/util/ArrayList");
var Transaction = require("dw/system/Transaction");

var baseModule = module.superModule;

/**
* The function removes all empty shipments of the current cart.
* @param {dw.order.BasketMgr} currentBasket - basket
*/
function removeEmptyShipments(currentBasket) {
    // Gets the list of shipments.
    var shipments = currentBasket.getShipments();

    Transaction.wrap(function () {
        for (var i = 0; i < shipments.length; i++) {
            var shipment = shipments[i];

            if (!shipment.isDefault()) {
                if (shipment.getProductLineItems().isEmpty() && shipment.getGiftCertificateLineItems().isEmpty()) {
                    currentBasket.removeShipment(shipment);
                }
            }
        }
    });
}

/**
 * Determines a unique shipment ID for shipments in the current cart and the given base ID. The function appends
 * a counter to the base ID and checks the existence of the resulting ID. If the resulting ID is unique, this ID
 * is returned; if not, the counter is incremented and checked again.
 * @param {string} baseID - The base ID.
 * @param {dw.order.BasketMgr} currentBasket - basket
 * @returns {string} Calculated shipment ID.
 */
function determineUniqueShipmentID(baseID, currentBasket) {
    var counter = 1;
    var shipment = null;
    var candidateID = baseID + "" + counter;

    while (shipment === null) { // NOSONAR
        shipment = currentBasket.getShipment(candidateID);
        if (shipment) {
            // This ID is already taken, increment the counter
            // and try the next one.
            counter++;
            candidateID = baseID + "" + counter;
            shipment = null;
        } else {
            return candidateID;
        }
    }

    // Should never go here
    return null;
}

/**
 * Cleans the shipments of the current basket by putting all gift certificate line items to single, possibly
 * new, shipments, with one shipment per gift certificate line item.
 * @param {dw.order.BasketMgr} currentBasket - basket
 */
function updateGiftCertificateShipments(currentBasket) {
    // List of line items.
    var giftCertificatesLI = new ArrayList();

    // Finds gift certificates in shipments that have
    // product line items and gift certificate line items merged.
    var shipments = currentBasket.getShipments();

    for (var i = 0; i < shipments.length; i++) {
        var shipment = shipments[i];

        // Skips shipment if no gift certificates are contained.
        if (shipment.giftCertificateLineItems.length === 0) {
            continue;
        }

        // Skips shipment if it has no products and just one gift certificate is contained.
        if (shipment.productLineItems.length === 0 && shipment.giftCertificateLineItems.length === 1) {
            continue;
        }

        // If there are gift certificates, add them to the list.
        if (shipment.giftCertificateLineItems.length > 0) {
            giftCertificatesLI.addAll(shipment.giftCertificateLineItems);
            var shippingData = shipments[i];
            var address = shippingData.shippingAddress;
        }
        
       
    }
    Transaction.wrap(function () {
        // Create a shipment for each gift certificate line item.
        for (var n = 0; n < giftCertificatesLI.length; n++) {
            var newShipmentID = determineUniqueShipmentID("Shipment #", currentBasket);
            giftCertificatesLI[n].setShipment(currentBasket.createShipment(newShipmentID));
            var shippingAddress = giftCertificatesLI[n].shipment.shippingAddress;
            if (!shippingAddress) {
                    shippingAddress = giftCertificatesLI[n].shipment.createShippingAddress();
            }
            shippingAddress.setFirstName(address.firstName || '');
            shippingAddress.setLastName(address.lastName || '');
            shippingAddress.setAddress1(address.address1 || '');
            shippingAddress.setAddress2(address.address2 || '');
            shippingAddress.setCity(address.city || '');
            shippingAddress.setPostalCode(address.postalCode || '');
            shippingAddress.setStateCode(address.stateCode || '');
            shippingAddress.setCountryCode(address.countryCode || '');
            shippingAddress.setPhone(address.phone || '');

        }
    });
}

/**
 * Returns the first shipping method (and maybe prevent in store pickup)
 * @param {dw.util.Collection} methods - Applicable methods from ShippingShipmentModel
 * @param {boolean} filterPickupInStore - whether to exclude PUIS method
 * @returns {dw.order.ShippingMethod} - the first shipping method (maybe non-PUIS)
 */
function getFirstApplicableShippingMethod(methods, filterPickupInStore) {
    var method;
    var iterator = methods.iterator();
    while (iterator.hasNext()) {
        method = iterator.next();
        if (empty(filterPickupInStore) || (!empty(filterPickupInStore) && !method.custom.storePickupEnabled)) {
            break;
        }
    }

    return method;
}

/**
 * Sets the default ShippingMethod for a Shipment, if absent
 * @param {dw.order.Shipment} shipment - the target Shipment object
 */
function ensureShipmentHasMethod(shipment) {
    var shippingMethod = shipment.shippingMethod;
    if (!shippingMethod) {
        var methods = ShippingMgr.getShipmentShippingModel(shipment).applicableShippingMethods;
        var defaultMethod = ShippingMgr.getDefaultShippingMethod();

        if (!defaultMethod) {
            // If no defaultMethod set, just use the first one
            shippingMethod = getFirstApplicableShippingMethod(methods, true);
        } else {
            // Look for defaultMethod in applicableMethods
            shippingMethod = collections.find(methods, function (method) {
                return method.ID === defaultMethod.ID;
            });
        }

        // If found, use it.  Otherwise return the first one
        if (!shippingMethod && methods && methods.length > 0) {
            shippingMethod = getFirstApplicableShippingMethod(methods, true);
        }

        if (shippingMethod) {
            shipment.setShippingMethod(shippingMethod);
        }
    }
}

baseModule.removeEmptyShipments = removeEmptyShipments;
baseModule.updateGiftCertificateShipments = updateGiftCertificateShipments;
baseModule.ensureShipmentHasMethod = ensureShipmentHasMethod;

module.exports = baseModule;
