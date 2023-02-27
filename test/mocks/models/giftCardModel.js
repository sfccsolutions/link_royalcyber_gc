'use strict';

var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

function proxyModel() {
    return proxyquire('../../../cartridges/int_royalcyber_giftcard/cartridge/models/giftCardModel', {
        'dw/system/Transaction': {
            wrap : function () {
            }
                
        },
        'dw/system/Site': {

        },
        '*/cartridge/scripts/helpers/emailHelpers': {

        },
        'dw/order/GiftCertificateMgr' : {
            createGiftCertificate: function (giftCertificate) {
                var giftCertificate = {
                    uuid: '',
                    netprice:{
                        value: '100',
                    },
                    recipientEmail:'',
                    recipientName:'',
                    senderName: '',
                    orderNo: '',
                    code: '1234',
                    getGiftCertificateCode : function() {
                       var code = '1234';
                    return code;
                    }
                    
                    };
                    
                return giftCertificate;
            }
        },

        'dw/object/CustomObjectMgr' : {
            createCustomObject : function (giftCertificate){
                return giftCertificate;
            }
        },
        
    });
}

module.exports = proxyModel();
