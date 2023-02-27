"use strict";

/**
 * Stub hook no payment verification is needed at this step
 * @param {Object} req - The request object
 * @param {Object} paymentForm - the payment form
 * @param {Object} viewFormData - object contains billing form data
 * @returns {Object} an object that has error information or payment information
 */
function processForm(req, paymentForm, viewFormData) {
    var viewData = viewFormData;
    return {
        error: false,
        viewData: viewData
    };
}

/**
 * Stub hook no payment information is saved
 */
function savePaymentInformation() {
    // eslint-disable-next-line no-useless-return
    return;
}

exports.processForm = processForm;
exports.savePaymentInformation = savePaymentInformation;
