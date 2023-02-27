'use strict';


var base = module.superModule;
var GiftCardModel = require("*/cartridge/models/giftCardModel");
var ProductLineItemsModel = require('*/cartridge/models/productLineItems');
var DEFAULT_MODEL_CONFIG = {
    numberOfLineItems: '*'
};

function getitems (){
    return {
    totalQuantity: ''
    }
}

module.exports = function OrderModel(lineItemContainer, options) {
    module.superModule.call(this, lineItemContainer, options)
    

    if (lineItemContainer) {
        var safeOptions = options || {};
        var modelConfig = safeOptions.config || DEFAULT_MODEL_CONFIG;
        var productLineItemsModel = new ProductLineItemsModel(lineItemContainer.productLineItems, lineItemContainer.giftCertificateLineItems, options.containerView);
        this.giftcertificates = GiftCardModel.getGiftCertificateModelArray(lineItemContainer.getGiftCertificateLineItems());
        if (modelConfig.numberOfLineItems === '*') {
            //this.items = getitems();
            this.items.totalQuantity = productLineItemsModel.totalQuantity;
            this.numItems = productLineItemsModel.totalQuantity;         
        } 
    }
}