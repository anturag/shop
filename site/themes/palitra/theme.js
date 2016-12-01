$(document).ready(function () {
	$('.productsets-product-list li:last-of-type ').wrapInner("<div class='wrapper'></div>");
	 
	
	$('.wa-submit a:first').prepend('<br>');	
	jQuery('.app-navigation').click(function(){
		if(jQuery('.app-navigation').width()>800)return false;
		if(jQuery(this).hasClass('active')){
			jQuery(this).removeClass('active')
		}else{
			jQuery(this).addClass('active')
		}
	})
	
    // SIDEBAR MENUS HANDLE
    $('.accordion li i').click(function(e) {
        $(this).parent().parent().next().stop(true,true).slideToggle(300);
    });
    var selected_menu_item = $('.accordion li.selected');
    if (selected_menu_item.length) {
        var parent_ul = selected_menu_item.parent(), parent_li = parent_ul.parent();
        while (parent_li.hasClass('collapsible')) {
            parent_ul.show();
            parent_ul = parent_li.parent(), parent_li = parent_ul.parent();
        }
        selected_menu_item.find('ul:eq(0)').stop(true,true).show();
    }
    // STICKY CART
    var cart_obj = $('#cart');
    if (cart_obj.length) {
        var cart_right = Math.round($(window).width() - cart_obj.offset().left - cart_obj.outerWidth()) - 15;
        $(window).scroll(function() {
            if ($(window).scrollTop() > 35 ) {
                $('#scrollup').fadeIn('fast');
                if (!cart_obj.hasClass('empty')) {
                    cart_obj.css('right', cart_right + 'px').addClass('fixed');
                }
            } else {
                $('#scrollup').fadeOut('fast');
                if ( $(window).scrollTop() < 25 ) {
                    cart_obj.removeClass('fixed');
                }
            }
        });
    }
    // SCROLL UP BUTTON
    $('#scrollup img').click(function() {
        $('html, body').animate({scrollTop: 0});
        return false;
    });

 
  
 

});
$('.si-jump').alert('OLOLO');

