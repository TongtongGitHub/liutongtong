;(function($){

    //header
    $(".J-bar").on('click', function(event) {
        $(".J-nav").toggleClass('nav-show');
    });

    $(".desc h1").addClass('animate-fadeUp');

    $(window).scroll(function(event){
    	var pos1 = $(window).scrollTop();//文档上端隐藏内容的高度
    	var pos2 = $(".work").offset().top;//文档特定元素距离顶端的高度
    	console.log(pos2 - pos1); //元素距离工作区顶端的高度
    });

    $(".scroll-top").on("click",function(){
    	$(window).scrollTop(0);
    });
})(jQuery)