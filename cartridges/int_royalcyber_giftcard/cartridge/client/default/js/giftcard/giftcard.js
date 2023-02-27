"use strict";

var formValidation = require('base/components/formValidation');

module.exports = function () {
    function showNotificationGiftCertificate(response) {
        if ($(".add-to-cart-messages").length === 0) {
            $("body").append("<div class=\"add-to-cart-messages\"></div>");
        }

        $(".add-to-cart-messages").append(
            "<div class=\"alert-success " +
            " add-to-basket-alert text-center\" role=\"alert\">" +
            response.alertmessage +
            "</div>"
        );

        setTimeout(function () {
            $(".add-to-basket-alert").remove();
        }, 10000);
    };

    $('form.purchasegiftcard').submit(function (e) {
        var $form = $(this);
        e.preventDefault();
        var url = $form.attr('action');
        $form.spinner().start();
        $('form.purchasegiftcard').trigger('purchasegiftcard:submit', e);
        $.ajax({
            url: url,
            type: 'post',
            dataType: 'json',
            data: $form.serialize(),
            success: function (data) {
                $form.spinner().stop();
                if (!data.success) {
                    formValidation($form, data);
                } else {
                    showNotificationGiftCertificate(data);
                    window.location.href = data.redirectUrl;
                }
            },
            error: function (err) {
                if (err.responseJSON.redirectUrl) {
                    window.location.href = err.responseJSON.redirectUrl;
                }
                $form.spinner().stop();
            }
        });
        return false;
    });

    $('#btnsubmitcheckbalance').click(function (e) {
        var url = $(this).data('url');
        var giftcard = document.getElementById("giftcardID").value;
        url += giftcard;
        $.ajax({
            url: url,
            type: 'post',
            dataType: 'json',
            success: function (data) {
                if (!data.success) {
                    if (data.ErrorMsg) {
                        $(".invalid-balance-feedback").html(data.ErrorMsg);
                        $(".check-balance-container").empty();
                        $(".giftcard-apply").addClass("d-none");
                    }
                }
                else {
                    var contentHtml = "";
                    contentHtml +=
                        "<span> Gift Card Balance: " +
                        data.value +" "+ data.currency + "</span>";
                    $(".check-balance-container").html(contentHtml);
                    $(".invalid-balance-feedback").empty();
                    if(data.value > 0)
                    {
                        $(".giftcard-apply").removeClass("d-none");
                    }
                }
            },
            error: function (err) {
                if (err.responseJSON.redirectUrl) {
                    window.location.href = err.responseJSON.redirectUrl;
                }
            }
        });
        return false;
    })


    $('#add-giftcard').click(function (e) {
        var url = $(this).data('url');
        var giftcard = document.getElementById("giftcardID").value;
        url += giftcard;
        $.ajax({
            url: url,
            type: "GET",
            cache: false,
            success: function (data) {
                if (!data.status) {
                    $(".check-code-container").empty();
                    $(".check-balance-container").empty();
                    $("#giftcerts-applied").html(data);
                    egPayCheck();
                    $("#giftcardID1").val("");
                } else {
                    $(".check-balance-container").empty();
                    $(".invalid-code-container").html(data.message);
                    $("#giftcardID1").val("");
                    
                }
            },
            error: function (err) {
                if (err.responseJSON.redirectUrl) {
                    window.location.href = err.responseJSON.redirectUrl;
                }
            }

        });
        return false;
    });
    
    /**
     * egPayCheck
     */
    function egPayCheck() {
        var addedGiftCertificate = $(".success.giftcert-pi")
            .last()
            .data("gcpiTotal");
        var totalCartPrice = $(".success.giftcert-pi").data("totalPrice");
        if (addedGiftCertificate === totalCartPrice) {
            var cvvCode = $(
                ".saved-payment-instrument." +
                "selected-payment .saved-payment-security-code"
            );
            cvvCode.val(" ");
        }
    };
    

    if (performance.navigation.type == performance.navigation.TYPE_RELOAD) {
        console.info("This page is reloaded");
        var url = $(".success").data('url');
        if (url) {
            $.ajax({
                url: url,
                type: "GET",
                cache: false,
                success: function (data) {
                    if (!data.status) {
                        $("#giftcerts-applied").html(data);
                        $("#giftcardID").val("");
                    }
                    else {
                        //fail
                    }
                },
                error: function (err) {
                    if (err.responseJSON.redirectUrl) {
                        window.location.href = err.responseJSON.redirectUrl;
                    }
                }
            });
            return false;
        }
        else {
            //reload;
        }
    };

    $("#giftcerts-applied").on("click", ".remove-checkout-gc", function (e) {
        e.preventDefault();
        var url = $(this).attr("href");
        url += $(this).attr("id").split("-")[1];
        $.ajax({
            url: url,
            type: "GET",
            cache: false,
            success: function (data) {
                if (!data.status) {
                    $("#giftcerts-applied").html(data);
                    $(".check-balance-container").empty();
                    $("#giftcardID").val("");
                    $(".giftcard-apply").addClass("d-none");
                }
                else {
                    $(".check-balance-container").empty();
                }

            },
            error: function (err) {
                if (err.responseJSON.redirectUrl) {
                    window.location.href = err.responseJSON.redirectUrl;
                }
            }
        });
        return false;

    });


};



