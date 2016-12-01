var frm = null;
$(document).ready(function () {
    $('.bxslider').bxSlider( { mode: 'fade', auto: true, pause: 5000, autoHover: true });
    $('.promo-bxslider').bxSlider( { auto: true, pause: 5000, autoHover: true, pager: true });
    $('.dialog').on('click', 'a.dialog-close', function () {
        $(this).closest('.dialog').hide().find('.cart').empty();
        return false;
    });
    $(document).keyup(function(e) {
        if (e.keyCode == 27) {
            $('.dialog:visible').hide().find('.cart').empty();
        }
    });
    $('.content').on('submit', '.product-list form.addtocart', function () {
        frm = $(this);
        if (frm.data('url')) {
            var d = $('#dialog');
            var c = d.find('.cart');
            c.load(frm.data('url'), function () {
                c.prepend('<a href="#" class="dialog-close">&times;</a>');
                d.show();
                if ((c.height() > c.find('form').height())) {
                    c.css('bottom', 'auto');
                } else {
                    c.css('bottom', '15%');
                }
            });
            return false;
        }
        $.post(frm.attr('action') + '?html=1', frm.serialize(), function (response) {
            if (response.status == 'ok') {
                addToCart(frm, response);
            } else if (response.status == 'fail') {
                alert(response.errors);
            }
        }, 'json');
        return false;
    });
    var f = function () {
        //product filtering
        var ajax_form_callback = function (f) {
            var fields = f.serializeArray();
            var params = [];
            for (var i = 0; i < fields.length; i++) {
                if (fields[i].value !== '') {
                    params.push(fields[i].name + '=' + fields[i].value);
                }
            }
            var url = '?' + params.join('&');
            $(window).lazyLoad && $(window).lazyLoad('sleep');
            $('#product-list').html('<img src="' + f.data('loading') + '">');
            $.get(url, function(html) {
                console.log('sup dude');
                var tmp = $('<div></div>').html(html);
                $('#product-list').html(tmp.find('#product-list').html());
                if (!!(history.pushState && history.state !== undefined)) {
                    window.history.pushState({}, '', url);
                }
                $(window).lazyLoad && $(window).lazyLoad('reload');
            });
        };
        $('.filters.ajax form input').change(function () {
            ajax_form_callback($(this).closest('form'));
        });
        $('.filters.ajax form').submit(function () {
            ajax_form_callback($(this));
            return false;
        });
        $('.filters .slider').each(function () {
            if (!$(this).find('.filter-slider').length) {
                $(this).append('<div class="filter-slider"></div>');
            } else {
                return;
            }
            var min = $(this).find('.min');
            var max = $(this).find('.max');
            var min_value = parseFloat(min.attr('placeholder'));
            var max_value = parseFloat(max.attr('placeholder'));
            var step = 1;
            var slider = $(this).find('.filter-slider');
            if (slider.data('step')) {
                step = parseFloat(slider.data('step'));
            } else {
                var diff = max_value - min_value;
                if (Math.round(min_value) != min_value || Math.round(max_value) != max_value) {
                    step = diff / 10;
                    var tmp = 0;
                    while (step < 1) {
                        step *= 10;
                        tmp += 1;
                    }
                    step = Math.pow(10, -tmp);
                    tmp = Math.round(100000 * Math.abs(Math.round(min_value) - min_value)) / 100000;
                    if (tmp && tmp < step) {
                        step = tmp;
                    }
                    tmp = Math.round(100000 * Math.abs(Math.round(max_value) - max_value)) / 100000;
                    if (tmp && tmp < step) {
                        step = tmp;
                    }
                }
            }
            slider.slider({
                range: true,
                min: parseFloat(min.attr('placeholder')),
                max: parseFloat(max.attr('placeholder')),
                step: step,
                values: [parseFloat(min.val().length ? min.val() : min.attr('placeholder')),
                    parseFloat(max.val().length ? max.val() : max.attr('placeholder'))],
                slide: function( event, ui ) {
                    var v = ui.values[0] == $(this).slider('option', 'min') ? '' : ui.values[0];
                    min.val(v);
                    v = ui.values[1] == $(this).slider('option', 'max') ? '' : ui.values[1];
                    max.val(v);
                },
                stop: function (event, ui) {
                    min.change();
                }
            });
            min.add(max).change(function () {
                var v_min =  min.val() === '' ? slider.slider('option', 'min') : parseFloat(min.val());
                var v_max = max.val() === '' ? slider.slider('option', 'max') : parseFloat(max.val());
                if (v_max >= v_min) {
                    slider.slider('option', 'values', [v_min, v_max]);
                }
            });
        });
    }
    f();
    $('.view-select .icon24').click(function() {
        if ($(this).hasClass('selected')) {
            return;
        }
        if ($(this).hasClass('thumbs')) {
            document.cookie = 'view_select=thumbs; path=/;';
        } else {
            document.cookie = 'view_select=table; path=/;';
        }
        window.location.reload();
    });
    var offers = $('.special-offers');
    for (var i=0; i<offers.length; i++) {
        var outer = $(offers[i]), inner = outer.find('li'), outer_width = outer.width(), inner_width = $(inner[0]).width() * inner.length;
        if (inner_width > outer_width) {
            outer.prev().prepend('<div class="offers-ctrl"><a class="offers-btn next"></a><a class="offers-btn prev disabled"></a></div>');
        }
    }
    $('.offers-btn').click(function() {
        var outer = $(this).parent().parent().next(), inner = outer.find('li'), outer_width = outer.width(), inner_width = $(inner[0]).width(),
        off = Math.floor(outer_width / inner_width) * inner_width, scrollLeft = outer.scrollLeft();
        if ($(this).hasClass('next')) {
            outer.animate({scrollLeft: scrollLeft + off});
            if (scrollLeft + off >= outer_width) {
                $(this).addClass('disabled');
            }
            $('.offers-btn.prev').removeClass('disabled');
        } else {
            outer.animate({scrollLeft: scrollLeft - off});
            if (scrollLeft - off <= 0) {
                $(this).addClass('disabled');
            }
            $('.offers-btn.next').removeClass('disabled');
        }
    });
});
function addToCart(form, response) {
    var cart_total = $('.cart-total'), cart_obj = $('#cart');
    var cart_margin = cart_obj.hasClass('fixed') ? 0 : 15;
    var cart_right = Math.round($(window).width() - cart_obj.offset().left - cart_obj.outerWidth() - cart_margin);
    cart_total.closest('#cart').removeClass('empty');
    cart_total.html(response.data.total);
    $('.cart-count').html(response.data.count);
    var d = $('.dialog:visible');
    if (!d.length) {
        var btn = form.find('input[type="submit"]').fadeOut(1000, function() {
            btn.hide();
            form.find('span.added2cart').fadeIn(300);
        });
        cart_obj.css('right', cart_right + 'px').addClass('fixed');
    } else {
        if (window.matchMedia('only screen and (max-width: 800px)').matches) {
            // mobile: show "added to cart" message
            frm.find('input[type="submit"]').hide();
            frm.find('span.added2cart').show();
        } else {
            // flying cart
            var origin = frm.closest('li'), block = $('<div class="product-fly"></div>').append(origin.html());
            block.css({
                'z-index': 100500,
                background: '#fff',
                top: origin.offset().top,
                left: origin.offset().left,
                width: origin.width()+'px',
                height: origin.height()+'px',
                position: 'absolute',
                overflow: 'hidden'
            }).appendTo('body').css({'border':'2px solid #eee','padding':'20px','background':'#fff'}).animate({
                top: cart_total.offset().top,
                left: cart_total.offset().left,
                width: '10px',
                height: '10px',
                opacity: 0.7
            }, 700, function() {
                block.remove();
                d.fadeOut(100, function() {
                    $('.dialog .cart').empty();
                    frm.find('input[type="submit"]').hide();
                    frm.find('span.added2cart').show();
                });
            });
        }
    }
}
