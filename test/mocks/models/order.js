'use strict';

var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

//var AddressModel = require('./address');
//var BillingModel = require('./billing');
//var ShippingModel = require('./shipping');
//var PaymentModel = require('./payment');
var TotalsModel = require('./totals');
var GiftCardModel =  require('./giftCardModel');


function proxyModel() {
    return proxyquire('../../../cartridges/int_royalcyber_giftcard/cartridge/models/order', {
        'dw/web/URLUtils': {
        },
        'dw/order/PaymentMgr': {
        },
        'dw/util/StringUtils': {
            formatMoney: function () {
                return 'formatted money';
            }
        },
        'dw/web/Resource': {
            msg: function () {
                return 'someString';
            },
            msgf: function () {
                return 'someString';
            }
        },
        'dw/system/HookMgr': function () {},
        '*/cartridge/models/address':{},
        '*/cartridge/models/billing': function (){
			this.items.totalQuantity = '';
            return this
		 },
        '*/cartridge/models/shipping': function (){
			this.items.totalQuantity = '';
            return this
		 },
        '*/cartridge/models/payment': function (){
			this.items.totalQuantity = '';
            return this
		 },
        '*/cartridge/models/totals': TotalsModel,
        '*/cartridge/models/productLineItems': function(){
            var ProductLineItemsModel = {
                totalQuantity: 'some value',
            }
            return ProductLineItemsModel
        },
        "*/cartridge/models/giftCardModel" : GiftCardModel,
        '*/cartridge/scripts/checkout/shippingHelpers': {
            getShippingModels: function () {
                return [{ shippingAddress: {
                    firstName: 'someString',
                    lastName: 'some string'
                }
                }];
            }
        },
        '*/cartridge/scripts/checkout/checkoutHelpers': {
            isPickUpInStore: function () {
                return false;
            },
            ensureValidShipments: function () {
                return true;
            }
        },
        'dw/util/Locale': {
            getLocale: function () {
                return 'US';
            }
        },
        OrderModel: function (){
            var items = {
                totalQuantity : '',
            }
            return items
        }
    });
}

module.exports = proxyModel();
