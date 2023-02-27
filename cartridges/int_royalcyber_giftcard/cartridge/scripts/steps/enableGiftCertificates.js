'use strict';

var Transaction = require('dw/system/Transaction');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var Resource = require('dw/web/Resource');
var Site = require('dw/system/Site');
var emailHelpers = require("app_storefront_base/cartridge/scripts/helpers/emailHelpers");
var GiftCertificateMgr = require("dw/order/GiftCertificateMgr");

module.exports = {
    EnableGiftCertificates: function EnableGiftCertificates() {
        Transaction.wrap(function () {
            var gcItr = CustomObjectMgr.getAllCustomObjects('rc_GiftCertificateObj');
            var currentDate = new Date();
            while (gcItr.hasNext()) {
                var nextCO = gcItr.next();
                var giftCertificate = GiftCertificateMgr.getGiftCertificateByCode(nextCO.custom.rc_GiftCertificateCode);
                var rc_expirationDate = nextCO.custom.rc_ExpirationDate;
                if (giftCertificate.balance.value <= 0 || rc_expirationDate < currentDate) {
                    Transaction.wrap(function () {
                        CustomObjectMgr.remove(nextCO);
                    });
                    continue;
                }

                var rc_enableDate = nextCO.custom.rc_enableDate;
                if (rc_enableDate <= currentDate) {
                    giftCertificate.setEnabled(true);
                }
            }
        });
    }
}