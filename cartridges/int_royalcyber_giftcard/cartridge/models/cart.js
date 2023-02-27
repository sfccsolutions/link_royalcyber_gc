"use strict";
var collections = require("*/cartridge/scripts/util/collections");
var URLUtils = require("dw/web/URLUtils");
var Resource = require("dw/web/Resource");

var ProductLineItemsModel = require("*/cartridge/models/productLineItems");

function getCartActionUrls() {
    return {
        removeProductLineItemUrl: URLUtils.url('Cart-RemoveProductLineItem').toString(),
        updateQuantityUrl: URLUtils.url('Cart-UpdateQuantity').toString(),
        selectShippingUrl: URLUtils.url('Cart-SelectShippingMethod').toString(),
        submitCouponCodeUrl: URLUtils.url('Cart-AddCoupon').toString(),
        removeCouponLineItem: URLUtils.url('Cart-RemoveCouponLineItem').toString(),
        removeGiftCardLineItem: URLUtils.url("Giftcard-RemoveGiftCardLineItem").toString()
    };
}

function CartModel(basket) {
    var BaseCartModel = module.superModule;
    var baseModel = new BaseCartModel(basket);
    for (var key in baseModel) {
        this[key] = baseModel[key];
    }
    if (basket !== null) {
        this.actionUrls = getCartActionUrls();
        this.actionUrls.removeGiftCardLineItem = URLUtils.url("Giftcard-RemoveGiftCardLineItem").toString();
        var productLineItemsModel = new ProductLineItemsModel(basket.productLineItems, basket.getGiftCertificateLineItems(), "basket");
        this.giftcertificates = basket.getGiftCertificateLineItems();

        this.items = productLineItemsModel;
        this.numItems = productLineItemsModel.totalQuantity;
        this.items.totalQuantity = productLineItemsModel.totalQuantity;
    } else {
        this.giftcertificates = [];
    }

    this.resources = {
        numberOfItems: Resource.msgf("label.number.items.in.cart", "cart", null, this.numItems),
        emptyCartMsg: Resource.msg("info.cart.empty.msg", "cart", null)
    };
}

module.exports = CartModel;
