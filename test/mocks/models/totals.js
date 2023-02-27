'use strict';

var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var Money = require('../dw.value.Money');

function proxyModel() {
    return proxyquire('../../../cartridges/int_royalcyber_giftcard/cartridge/models/totals', {
        'dw/util/StringUtils': {
            formatMoney: function () {
                return 'formatted money';
            }
        },
        'dw/value/Money': Money,
        'dw/util/Template': function () {
            return {
                render: function () {
                    return { text: 'someString' };
                }
            };
        },
        'dw/util/HashMap': function () {
            return {
                result: {},
                put: function (key, context) {
                    this.result[key] = context;
                }
            };
        },
        '*/cartridge/scripts/util/collections': require('../util/collections'),
		add : function (){
			var total = 'some value'
			return total
		}
    });
}

module.exports = proxyModel();
