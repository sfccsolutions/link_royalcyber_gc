'use strict';

var assert = require('chai').assert;
var ArrayList = require('../../../mocks/dw.util.Collection');
var toProductMock = require('../../../util');
var mockSuperModule = require('../../../mockModuleSuperModule');
var baseProductLineItems = require('../../../../test/mocks/models/baseModule/base');

var ProductLineItemsModel = require('../../../mocks/models/productLineItems');

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
        value: 1
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



var giftcardMock = {
	
	ID: '1234567',
    name: 'test gift',
    availabilityModel: {
        isOrderable: {
            return: true,
            type: 'function'
        },

    },
    minOrderQuantity: {
        value: 1
    }
    
}
var giftcardMock = {
    giftcardModel: {
        GiftVariationAttributes: new ArrayList([{
            attributeID: '',
            value: ''
        }]),
        selectedgiftcard: giftcardMock
    }
};
var apiBasketNoBonusLineItems = {
    productLineItems: new ArrayList([{
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
    }]),
	giftCertificatesLineItems: new ArrayList([{
        gift: true,
        UUID: 'some UUID',
        adjustedPrice: {
            value: 'some value',
            currencyCode: 'US'
        },
        quantity: {
            value: 1
        },
        product: toProductMock(giftcardMock),
    }])
	
	
};
var productLineItems = new ArrayList([{
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
}]);





describe('ProductLineItems model', function () {
    it('should accept/process a null Basket object', function () {
        var lineItems = null;
		var giftCertificatesLineItems = null;
        mockSuperModule.create(baseProductLineItems);
        var result = new ProductLineItemsModel(lineItems, giftCertificatesLineItems);
		assert.equal(result.totalQuantity,  );
    });

    it('should create product line items and get total quantity', function () {
        mockSuperModule.create(baseProductLineItems);
        var result = new ProductLineItemsModel(productLineItems, apiBasketNoBonusLineItems.giftCertificatesLineItems);
        assert.equal(result.totalQuantity, 2);
    });
});
