$(function () {
    function updateCart(data)
    {
        $('.cart-total').html(data.total);
        $('.cart-count').html(data.count);
        if (data.discount_numeric) {
            $('.cart-discount').closest('div.coupon').show();
        }
        $('.cart-discount').html('&minus; ' + data.discount);
    }
    $('.cart a.delete').click(function () {
        var row = $(this).closest('div.cart-item');
        $.post('delete/', {html: 1, id: row.data('id')}, function (response) {
            if (response.data.count == 0) {
                location.reload();
            }
            row.remove();
            updateCart(response.data);
        }, 'json');
        return false;
    });
    
    $('#minus').click(function(){
       var curVal = $(this).closest('div.cart-item').find('.qty').val();
       var nextVal;
       if(curVal-1){
           nextVal = parseInt(curVal)-1;
           $(this).closest('div.cart-item').find('.qty').val(nextVal);  
        var that = $(this).closest('div.cart-item').find('.qty');
        if (that.val() > 0) {
            var row = that.closest('div.cart-item');
            if (that.val()) {
                $.post('save/', {html: 1, id: row.data('id'), quantity: that.val()}, function (response) {
                    row.find('.item-total').html(response.data.item_total);
                    if (response.data.q) {
                        that.val(response.data.q);
                    }
                    if (response.data.error) {
                        alert(response.data.error);
                    } else {
                        that.removeClass('error');
                    }
                    updateCart(response.data);
                }, 'json');
            }
        } else {
            that.val(1);
        }             
       }
    });
    $('#plus').click(function(){
       var curVal = $(this).closest('div.cart-item').find('.qty').val();
       var nextVal = parseInt(curVal)+1;
       $(this).closest('div.cart-item').find('.qty').val(nextVal);
       
        var that = $(this).closest('div.cart-item').find('.qty');
        if (that.val() > 0) {
            var row = that.closest('div.cart-item');
            if (that.val()) {
                $.post('save/', {html: 1, id: row.data('id'), quantity: that.val()}, function (response) {
                    row.find('.item-total').html(response.data.item_total);
                    if (response.data.q) {
                        that.val(response.data.q);
                    }
                    if (response.data.error) {
                        alert(response.data.error);
                    } else {
                        that.removeClass('error');
                    }
                    updateCart(response.data);
                }, 'json');
            }
        } else {
            that.val(1);
        }       
    });
    $('.cart input.qty').change(function () {
        var that = $(this);
        if (that.val() > 0) {
            var row = that.closest('div.cart-item');
            if (that.val()) {
                $.post('save/', {html: 1, id: row.data('id'), quantity: that.val()}, function (response) {
                    row.find('.item-total').html(response.data.item_total);
                    if (response.data.q) {
                        that.val(response.data.q);
                    }
                    if (response.data.error) {
                        alert(response.data.error);
                    } else {
                        that.removeClass('error');
                    }
                    updateCart(response.data);
                }, 'json');
            }
        } else {
            that.val(1);
        }
    });
    $('.cart .services input:checkbox').change(function () {
        var obj = $('select[name="service_variant[' + $(this).closest('div.row').data('id') + '][' + $(this).val() + ']"]');
        if (obj.length) {
            if ($(this).is(':checked')) {
                obj.removeAttr('disabled');
            } else {
                obj.attr('disabled', 'disabled');
            }
        }
        var div = $(this).closest('div');
        var row = $(this).closest('div.row');
        if ($(this).is(':checked')) {
           var parent_id = row.data('id')
           var data = {html: 1, parent_id: parent_id, service_id: $(this).val()};
           var variants = $('select[name="service_variant[' + parent_id + '][' + $(this).val() + ']"]');
           if (variants.length) {
               data['service_variant_id'] = variants.val();
           }
           $.post('add/', data, function(response) {
               div.data('id', response.data.id);
               row.find('.item-total').html(response.data.item_total);
               updateCart(response.data);
           }, 'json');
        } else {
           $.post('delete/', {html: 1, id: div.data('id')}, function (response) {
               div.data('id', null);
               row.find('.item-total').html(response.data.item_total);
               updateCart(response.data);
           }, 'json');
        }
    });
    $('.cart .services select').change(function () {
        var row = $(this).closest('div.row');
        $.post('save/', {html: 1, id: $(this).closest('div').data('id'), 'service_variant_id': $(this).val()}, function (response) {
            row.find('.item-total').html(response.data.item_total);
            updateCart(response.data);
        }, 'json');
    });
    $('#cancel-affiliate').click(function () {
        $(this).closest('form').append('<input type="hidden" name="use_affiliate" value="0">').submit();
        return false;
    });
    $('div.addtocart input:button').click(function () {
        var f = $(this).closest('div.addtocart');
        if (f.data('url')) {
            var d = $('#dialog');
            var c = d.find('.cart');
            c.load(f.data('url'), function () {
                c.prepend('<a href="#" class="dialog-close">&times;</a>');
                c.find('form').data('cart', 1);
                d.show();
                if ((c.height() > c.find('form').height())) {
                    c.css('bottom', 'auto');
                } else {
                    c.css('bottom', '15%');
                }
            });
            return false;
        }
        $.post($(this).data('url'), {html: 1, product_id: $(this).data('product_id')}, function (response) {
            if (response.status == 'ok') {
                $('#cart-content').parent().load(location.href, function () {
                    var cart_total = $('.cart-total'), cart_obj = $('#cart'), cart_right = Math.round($(window).width() - cart_obj.offset().left - cart_obj.outerWidth()) - 15;
                    cart_total.closest('#cart').removeClass('empty');
                    cart_total.html(response.data.total);
                    $('.cart-count').html(response.data.count);
                    cart_obj.css('right', cart_right + 'px').addClass('fixed');
                });
            }
        }, 'json');
        return false;
    });
});
