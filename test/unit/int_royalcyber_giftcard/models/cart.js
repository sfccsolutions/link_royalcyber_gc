'use strict';

var assert = require('chai').assert;
var ArrayList = require('../../../mocks/dw.util.Collection');
var mockSuperModule = require('../../../mockModuleSuperModule');
var baseProductLineItems = require('../../../../test/mocks/models/baseModule/base');
var toProductMock = require('../../../util');

var productVariantMock = {
    ID: '1234567',
    name: 'test product',
    variant: true,
    availabilityModel: {
        isOrderable: {
            return: true,
            type: 'function'
        },
        inventoryRecord: {
            ATS: {
                value: 100
            }
        }
    },
    minOrderQuantity: {
        value: 2
    }
};

var productMock = {
    variationModel: {
        productVariationAttributes: new ArrayList([{
            attributeID: '',
            value: ''
        }]),
        selectedVariant: productVariantMock
    }
};

var Money = require('../../../mocks/dw.value.Money');


var createApiBasket = function (options) {
    var safeOptions = options || {};

    var basket = {
        allProductLineItems: new ArrayList([{
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
            product: toProductMock(productMock)
        }]),
        totalGrossPrice: new Money(true),
        totalTax: new Money(true),
        shippingTotalPrice: new Money(true)
    };


    if (safeOptions.shipping) {
        basket.shipments = [safeOptions.shipping];
    } else {
        basket.shipments = [{
            shippingMethod: {
                ID: '005'
            }
        }];
    }
    basket.defaultShipment = basket.shipments[0];

    basket.getShipments = function () {
        return basket.shipments;
    };
    basket.getAdjustedMerchandizeTotalPrice = function () {
        return new Money(true);
    };
    basket.getGiftCertificateLineItems = function () {
        var giftcertificate = {
            uuid: '1234567',
            netPrice: {
                value: '100',
            },
            recipientEmail: 'some Email',
            recipientName: 'some Email',
            senderName: 'some Name',

        };
        return giftcertificate;
    }
    if (safeOptions.productLineItems) {
        basket.productLineItems = safeOptions.productLineItems;
    }

    if (safeOptions.totals) {
        basket.totals = safeOptions.totals;
    }

    return basket;
};

describe('cart', function () {
    var Cart = require('../../../mocks/models/cart');

    it('should accept/process a null Basket object', function () {
        mockSuperModule.create(baseProductLineItems);
        var nullBasket = null;
        var result = new Cart(nullBasket);
        assert.equal(result.numItems, null);
    });

    it('should get totals from totals model', function () {
        mockSuperModule.create(baseProductLineItems);
        var result = new Cart(createApiBasket());
        assert.equal(result.items.totalQuantity, 'some value');
        assert.equal(result.numItems, 'some value');
        assert.equal(result.resources.numberOfItems, 'someString');
    });
});
