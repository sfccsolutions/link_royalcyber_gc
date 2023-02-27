/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */

"use strict";

var formatMoney = require("dw/util/StringUtils").formatMoney;
/**
 * Accepts a total object and formats the value
 * @param {dw.value.Money} total - Total price of the cart
 * @returns {string} the formatted money value
 */
function getTotals(total) {
    return !total.available ? "-" : formatMoney(total);
}

module.exports = function (lineItemContainer) {
    var BaseTotalsModel = module.superModule;
    var totalsModel = new BaseTotalsModel(lineItemContainer);
    if (lineItemContainer) {
        totalsModel.subTotal = getTotals(lineItemContainer.getAdjustedMerchandizeTotalPrice(false).add(lineItemContainer.giftCertificateTotalPrice));
        if (totalsModel.totalShippingCost === "-" && lineItemContainer.getGiftCertificateTotalPrice() === 0) {
            totalsModel.totalTax = "-";
            totalsModel.grandTotal = "-";
        } else {
            totalsModel.totalTax = getTotals(lineItemContainer.totalTax);
            totalsModel.grandTotal = getTotals(lineItemContainer.totalGrossPrice);
        }
    }

    return totalsModel;
};
