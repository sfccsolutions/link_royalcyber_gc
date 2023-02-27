var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');
var chai = require('chai');
var chaiSubset = require('chai-subset');
chai.use(chaiSubset);

describe('Giftcard CheckBalance', function () {
    this.timeout(5000);

    it('should show gift card balance', function () {
        var cookieJar = request.jar();
        var myRequest = {
            url: config.baseUrl + '/Giftcard-CheckBalance?giftcardID=JVKLYPSDITVAAKZH',
            method: 'POST',
            jar: cookieJar,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        };

        return request(myRequest)
            .then(function (response) {
                var code = JSON.parse(response);
                var expectedResponse = {
                    'success': true,
                    value: 450,
                    currency: 'USD',
                    giftCardCode: 'JVKLYPSDITVAAKZH'
                };
                assert.equal(code.success, expectedResponse.success);
                assert.equal(code.value, expectedResponse.value);
                assert.equal(code.giftCardCode, expectedResponse.giftCardCode);


            });
    });
    it('should show gift card code is incorrect', function () {
        var cookieJar = request.jar();
        var myRequest1 = {
            url: config.baseUrl + '/Giftcard-CheckBalance?giftcardID=JVKLYPSDITVAAKZ',
            method: 'POST',
            jar: cookieJar,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        };

        return request(myRequest1)
            .then(function (response) {
                var code = JSON.parse(response);
                var expectedResponse = {
                    'success': false,
                    'msg': 'Please enter valid Gift Card code'
                };
                assert.equal(code.success, expectedResponse.success);
                assert.equal(code.ErrorMsg, expectedResponse.msg, 'Please enter valid Gift Card code');

            });
    });
});