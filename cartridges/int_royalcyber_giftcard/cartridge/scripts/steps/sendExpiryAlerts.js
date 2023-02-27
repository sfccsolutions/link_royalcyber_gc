'use strict';

var Transaction = require('dw/system/Transaction');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var Resource = require('dw/web/Resource');
var Site = require('dw/system/Site');
var emailHelpers = require("app_storefront_base/cartridge/scripts/helpers/emailHelpers");

function SendExpiryAlerts() {
        Transaction.wrap(function () {
            var gcItr = CustomObjectMgr.getAllCustomObjects('rc_GiftCertificateObj');
            var currentDate = new Date();
            var rc_expiryReminderDays = Site.current.getCustomPreferenceValue('rc_expiryReminderDays');
            while (gcItr.hasNext()) {
                var nextCO = gcItr.next();
                var daysleft = (nextCO.custom.rc_ExpirationDate - currentDate) / (1000*3600*24);
                if (daysleft <= rc_expiryReminderDays) {
                    var emailObj = {
                        to: nextCO.custom.rc_RecipientEmail,
                        subject: Resource.msg("giftcard.expiry.reminder", "giftcard", null),
                        from: Site.current.getCustomPreferenceValue('customerServiceEmail') || "no-reply@salesforce.com",
                        type: 0
                    };

                    var context = {
                        giftcertificate : nextCO,
                        daysleft : daysleft
                    };
                    
                    emailHelpers.sendEmail(emailObj, 'mail/ExpiryReminder', context);
                    
                }
            }
        });
    }
module.exports = {
    SendExpiryAlerts:  SendExpiryAlerts
}