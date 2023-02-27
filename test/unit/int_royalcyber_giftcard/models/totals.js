'use strict';

var assert = require('chai').assert;

var Money = require('../../../mocks/dw.value.Money');
var ArrayList = require('../../../mocks/dw.util.Collection');


var createApiBasket = function (isAvailable) {
    return {
        totalGrossPrice: new Money(isAvailable),
        totalTax: new Money(isAvailable),
        shippingTotalPrice: new Money(isAvailable),
        getAdjustedMerchandizeTotalPrice: function () {
            return new Money(isAvailable);
        },
		getAdjustedMerchandizeTotalPrice : function (){
            var add = {
                add: function () {
                    var array = {
                        orderNumber: 'some String',
                        creationDate: 'some Date'
                    };
                    return array;
                },

            };
            return add;
			
		},
        adjustedShippingTotalPrice: new Money(isAvailable),
        couponLineItems: new ArrayList([
            {
                UUID: 1234567890,
                couponCode: 'some coupon code',
                applied: true,
                valid: true,
                priceAdjustments: new ArrayList([{
                    promotion: { calloutMsg: 'some call out message' }
                }])
            }
        ]),
        priceAdjustments: new ArrayList([{
            UUID: 10987654321,
            calloutMsg: 'some call out message',
            basedOnCoupon: false,
            price: { value: 'some value', currencyCode: 'usd' },
            lineItemText: 'someString',
            promotion: { calloutMsg: 'some call out message' }
        },
        {
            UUID: 10987654322,
            calloutMsg: 'price adjustment without promotion msg',
            basedOnCoupon: false,
            price: { value: 'some value', currencyCode: 'usd' },
            lineItemText: 'someString'
        }]),
        allShippingPriceAdjustments: new ArrayList([{
            UUID: 12029384756,
            calloutMsg: 'some call out message',
            basedOnCoupon: false,
            price: { value: 'some value', currencyCode: 'usd' },
            lineItemText: 'someString',
            promotion: { calloutMsg: 'some call out message' }
        }]),
		giftCertificateTotalPrice: new Money(isAvailable),
		
    };
};

describe('Totals', function () {
    var Totals = require('../../../mocks/models/totals');

    it('should accept a basket and format the totals', function () {
        var basket = createApiBasket(true);
        var result = new Totals(basket);
        assert.equal(result.grandTotal, 'formatted money');
        assert.equal(result.totalTax, 'formatted money');
    });
});
