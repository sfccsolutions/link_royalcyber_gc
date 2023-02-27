'use strict';

var assert = require('chai').assert;
var giftCardModel = require('../../../mocks/models/giftCardModel');

var giftcertificateLineItem = {
	
	uuid: '1234567',
	netPrice:{
		value: '100',
	},
	recipientEmail:'some Email',
	recipientName:'some Email',
	senderName: 'some Name'
	
	
    
}
var orderNo = 'some String';


describe('giftCard model', function () {
    it('should create gift card', function () {
        var result = giftCardModel.createGiftCertificateFromLineItem(giftcertificateLineItem, orderNo);
        assert.equal(result.netprice.value, 100);
        
    });
})
