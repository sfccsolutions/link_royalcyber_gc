'use strict';

var assert = require('chai').assert;

var Order = require('../../../mocks/models/order');
var mockSuperModule = require('../../../mockModuleSuperModule');
var baseOrderModel = require('../../../../test/mocks/models/baseModule/base');

var createApiBasket = function () {
    return {
        billingAddress: true,
        defaultShipment: {
            shippingAddress: true
        },
        orderNo: 'some String',
        creationDate: 'some Date',
        customerEmail: 'some Email',
        status: 'some status',
        productQuantityTotal: 1,
        totalGrossPrice: {
            available: true,
            value: 180.00
        },
        totalTax: {
            available: true,
            value: 20.00
        },
        shippingTotalPrice: {
            available: true,
            value: 20.00,
            subtract: function () {
                return {
                    value: 20.00
                };
            }
        },
        discounts: [],
        adjustedShippingTotalPrice: {
            value: 20.00,
            available: true
        },
        shipments: [{
            id: 'me'
        }],

        getAdjustedMerchandizeTotalPrice: function () {
            return {
                subtract: function () {
                    return {
                        value: 100.00
                    };
                },
                value: 140.00,
                available: true
            };
        },
        getGiftCertificateLineItems: function () {

            var toArray = {
                toArray: function () {
                    var array = {
                        orderNumber: 'some String',
                        creationDate: 'some Date'
                    };
                    return array;
                },

            };
            return toArray;
        }
    };
};

var config = {
    numberOfLineItems: '*'
};

describe('Order', function () {
    it('should handle null parameters', function () {
        mockSuperModule.create(baseOrderModel);
        var result = new Order(null, null);
        assert.equal(result.shipping, null);
        assert.equal(result.billing, null);
        assert.equal(result.totals, null);
        assert.equal(result.items, null);
        assert.equal(result.steps, null);
        assert.equal(result.orderNumber, null);
        assert.equal(result.creationDate, null);
        assert.equal(result.orderEmail, null);
    });

    it('should handle a basket object ', function () {
        mockSuperModule.create(baseOrderModel);
        var result = new Order(createApiBasket(), { config: config });
        assert.equal(result.items.totalQuantity, 'some value');
        assert.equal(result.numItems, 'some value');
    });
});