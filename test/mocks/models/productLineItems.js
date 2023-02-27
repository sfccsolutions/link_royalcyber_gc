'use strict';

var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var collections = require('../util/collections');

function proxyModel() {
    return proxyquire('../../../cartridges/int_royalcyber_giftcard/cartridge/models/productLineItems', {
		 '*/cartridge/scripts/util/collections': collections,
        '*/cartridge/scripts/factories/product': {
            get: function () {
                return { bonusProducts: null, bonusProductLineItemUUID: null };
            }
        },
        'dw/web/URLUtils': {
            staticURL: function () {
                return '/images/noimagelarge.png';
            }
        },
        'dw/web/Resource': {
            msgf: function (param1) {
                return param1;
            }
        },
        'module.superModule':{
            call: function(){
                return call;
            }
        },
        'getTotalQuantity': function(productLineItems){
        var productLineItems ={
            bonusProductLineItem: false,
            gift: false,
            UUID: 'some UUID',
            adjustedPrice: {
                value: 'some value',
                currencyCode: 'US'
            },
            quantity: {
                value: 1
            },
            product: toProductMock(productMock),
            custom: { bonusProductLineItemUUID: '' }
        }
        return productLineItems
        }
    });
}

module.exports = proxyModel();
