/* ZoomBox jQuery plugin for ShopScript 5 */
(function($) {
	var win = $(window), options, images, active_image = -1, active_url, prev_image, next_image, middle, center_width, center_height,
        hidden_els = [], center, image, w, h, preload = { }, offset = { }, scale, drag = false, moved = false, size, href;
	$.fn.zoombox = function() {
        images = $('#product-gallery img');
        options = {
            loop: true,
            opacity: 0.8,
            duration: 300,
            easing: 'swing',
            initial_width: 250,
            initial_height: 250,
            paddings: 20,
            counter_tpl: '!x! / !y!',
            close_keys: [27],
            prev_keys: [37],
            next_keys: [39]
        };
		return this.unbind('click').click(function() {
            href = $(this).attr('href');
            size = href.replace(/^.*\/[0-9]+\.(.*)\..*$/, '$1');
            middle = win.scrollTop() + (win.height() / 2);
            center_width = options.initial_width;
            center_height = options.initial_height;
            if (!$('#zb-center').length) {
                $('body').append(['<div id="zb-overlay" style="display:none;" />', '<div id="zb-center" style="display:none;" />', '<div id="zb-bottom-container" style="display:none;" />']);
                $('<div id="zb-image" />').appendTo($('#zb-center'));
                $('<div id="zb-bottom" />').appendTo($('#zb-bottom-container')).append([
                    '<div id="zb-name" />', '<i id="zb-prev-link" />', '<i id="zb-number" />',
                    '<i id="zb-next-link" />', '<i id="zb-close-link" />', '<div style="clear: both;" />'
                ]);
            }
            center = $('#zb-center');
            image = $('#zb-image');
            center.css({ top: Math.max(0, middle - (center_height / 2)), width: center_width, height: center_height }).show();
            $('#zb-overlay').css('opacity', options.opacity).fadeIn(options.duration);
            position();
            setup(1);
            options.loop = options.loop && (images.length > 1);
            $('#zb-prev-link').unbind('click').click(prev);
            $('#zb-next-link').unbind('click').click(next);
            $('#zb-close-link').unbind('click').click(close);
            return changeImage(Math.max($('#product-gallery .image').index($('#product-gallery .image.selected')), 0));
		});
	};
	function position() {
        var left = win.scrollLeft() + win.width() / 2 - center_width / 2;
		center.css('left', left);
        $('#zb-bottom-container').css('left', left);
	}
	function setup(open) {
		if (open) {
			$('object').add('embed').each(function(index, el) {
				hidden_els[index] = [el, el.style.visibility];
				el.style.visibility = 'hidden';
			});
		} else {
			$.each(hidden_els, function(index, el) {
				el[0].style.visibility = el[1];
			});
			hidden_els = [];
		}
		var fn = open ? 'bind' : 'unbind';
		$(document)[fn]('keydown', keyDown);
	}
	function keyDown(event) {
		var code = event.keyCode, fn = $.inArray;
		return (fn(code, options.close_keys) >= 0) ? close()
			: (fn(code, options.next_keys) >= 0) ? next()
			: (fn(code, options.prev_keys) >= 0) ? prev()
			: false;
	}
	function prev() {
		return changeImage(prev_image);
	}
	function next() {
		return changeImage(next_image);
	}
	function changeImage(idx) {
		if (idx >= 0) {
			active_image = idx;
			active_url = getUrl(active_image);
			prev_image = (active_image || (options.loop ? images.length : 0)) - 1;
			next_image = ((active_image + 1) % images.length) || (options.loop ? 0 : -1);
			stop();
			center.attr('class', 'zb-loading');
			preload = new Image();
			preload.onload = _animateBox;
			preload.src = active_url;
		}
		return false;
	}
	function _animateBox() {
		center.attr('class', '');
		h = Math.min(preload.height, Math.max(win.height() - 110, 200));
        w = Math.round(h * preload.width / preload.height)
        var wrap_w = (w < 140 ? 140 : w), css = ((w < preload.width || w == 800) ? ' class="zoomin"' : '');
		image.empty().append('<div id="zb-wrap" style="width:' + wrap_w + 'px; height:' + h + 'px;"><img src="' + active_url + '" width="' + w + '" height="' + h + '"' + css + ' /></div>')
            .css({ visibility: 'hidden', display: '' });
        $('#zb-wrap img.zoomin').click(function(e) {
            var o = $(this).offset(), zoom_img = $('#zb-wrap img.zoomout');
            offset.x = (e.pageX - o.left) * -1;
            offset.y = (e.pageY - o.top) * -1;
            if (!zoom_img.length) {
                $('#zb-name').append('<i class="zb-loading"></i>');
                preload = new Image();
                preload.onload = function() {
                    $('i.zb-loading').remove();
                    var img = $('#zb-wrap img');
                    scale = preload.width / img.width();
                    offset.x = Math.min(0, Math.max(w - preload.width, offset.x * scale - offset.x));
                    offset.y = Math.min(0, Math.max(h - preload.height, offset.y * scale - offset.y));
                    img.hide();
                    img = $('<img src="' + getUrl(active_image) + '" class="zoomout drag" style="width:' + w + 'px; height:' + h + 'px;" />');
                    $('#zb-wrap').append(img);
                    img.animate({ width: preload.width + 'px', height: preload.height + 'px', 'margin-left': Math.round(offset.x) + 'px', 'margin-top': Math.round(offset.y) + 'px' });
                    img.bind('mousedown', function(e) {
                        if (!drag) {
                            drag = true;
                            moved = false;
                            offset.mouseX = e.pageX;
                            offset.mouseY = e.pageY;
                            e.preventDefault();
                        }
                    }).bind('mouseup', function(e) {
                        if (drag) {
                            drag = false;
                            e.preventDefault();
                        }
                    }).bind('mouseleave', function(e) {
                        if (drag) {
                            drag = false;
                            e.preventDefault();
                        }
                    }).bind('mousemove', function(e) {
                        if (drag) {
                            offset.x = Math.min(
                                0,
                                Math.max(
                                    w - preload.width,
                                    Math.round(offset.x - offset.mouseX + e.pageX)
                                )
                            );
                            offset.y = Math.min(
                                0,
                                Math.max(
                                    h - preload.height,
                                    Math.round(offset.y - offset.mouseY + e.pageY)
                                )
                            );
                            offset.mouseX = e.pageX;
                            offset.mouseY = e.pageY;
                            $(this).css({
                                'margin-left': Math.round(offset.x) + 'px',
                                'margin-top':  Math.round(offset.y) + 'px'
                            });
                            moved = true;
                        }
                    }).click(function() {
                        if (!moved) {
                            $('#zb-wrap img.zoomout').animate({ width: w + 'px', height: h + 'px', 'margin-left': 0, 'margin-top': 0 }, function() {
                                $(this).hide();
                                $('#zb-wrap img.zoomin').show();
                            });
                        }
                    });
                };
                preload.src = getUrl(active_image);
                return false;
            } else {
                offset.x = Math.min(0, Math.max(w - preload.width, offset.x * scale - offset.x));
                offset.y = Math.min(0, Math.max(h - preload.height, offset.y * scale - offset.y));
                $(this).hide();
                zoom_img.show().animate({ width: preload.width + 'px', height: preload.height + 'px', 'margin-left': Math.round(offset.x) + 'px', 'margin-top': Math.round(offset.y) + 'px' });
            }
        });
		//$('#zb-name').html(images[active_image][1] + '<i></i>');
		$('#zb-number').html(options.counter_tpl.replace(/!x!/, active_image + 1).replace(/!y!/, Math.max(images.length, 1)));
		center_width = image.width() + options.paddings;
		center_height = image.height() + options.paddings;
		var top = Math.max(0, middle - (center_height / 2) - 20);
		if (center.height() != center_height) {
			center.animate({ height: center_height, top: top }, options.duration, options.easing);
		}
		if (center.width() != center_width) {
			center.animate({ width: center_width, marginLeft: (options.initial_width - center_width)/2 }, options.duration, options.easing);
		}
		center.queue(function() {
            $('#zb-bottom-container').css({ width: center_width, top: top + center_height, marginLeft: (options.initial_width - center_width)/2 }).slideDown(options.duration);
			image.css({ display: 'none', visibility: '', opacity: '' }).fadeIn(options.duration);
		});
		if (prev_image >= 0) {
			$('#zb-prev-link').removeClass('disabled');
		} else {
			$('#zb-prev-link').addClass('disabled');
		}
		if (next_image >= 0) {
			$('#zb-next-link').removeClass('disabled');
		} else {
			$('#zb-next-link').addClass('disabled');
		}
	}
	function stop() {
		preload.onload = null;
		preload.src = active_url;
		center.stop(true);
        image.stop(true).hide();
        $('#zb-bottom').stop(true);
        $('#zb-bottom-container').hide();
	}
	function close() {
		if (active_image >= 0) {
			stop();
			active_image = -1;
			center.hide().css('marginLeft', 0);
			$('#zb-overlay').stop().fadeOut(options.duration, setup);
            $('#zb-bottom-container').css('marginLeft', 0);
		}
		return false;
	}
	function getUrl(idx) {
        if (images.length > 0) {
            return $(images[idx]).attr('src').replace(/^(.*\/[0-9]+\.)(.*)(\..*)$/, '$1' + size + '$3');
        } else {
            return href;
        }
	}
})(jQuery);
