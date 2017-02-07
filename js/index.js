;(function($){
    var fs2 = new Slider({
        naturalOrder:0,
        interval:3000,
        speed:1000,
        autoPlay:false,
        animationType:'fade',
        carrier:{
            content: ".J-home-slider .J-slider-list",
            banner: ".J-home-slider .J-slider-control"
        },
        // extend:{
        //     switchSpot:function(outObj, inObj, motionDir, motionTime, callback) {
        //         outObj.css({
        //             'position' : 'absolute',
        //             'zIndex' : 2
        //         });
        //         inObj.css({
        //             'position' : 'absolute',
        //             'zIndex' : 1
        //         }).show();
        //         outObj.fadeOut(motionTime / 2, function () {
        //             outObj.css({
        //                 'position' : 'static',
        //                 'zIndex' : 'auto'
        //             });
        //             inObj.css({
        //                 'position' : 'static',
        //                 'zIndex' : 'auto'
        //             });
        //             callback.call(this);
        //         });
        //     }
        // }
    });

//     var flag = false;
//     function waitprocess(slider,index){
//         var list = $(slider.config.carrier.banner).children('li');
//         list.stop();
//         list.removeAttr('style');
//         var timer = list.eq(index);
//         timer.animate({ 'backgroundPositionX' : '0'}, slider.config.interval, function() {
//             timer.removeAttr('style');
//         });
//     }
//     waitprocess(fs2,0);

//     fs2.onSpotCompleted(function(e, index, m) {
//         if (!flag) {
//             waitprocess(fs2,index);
//         }
//     });

// // 动画停止清除未执行完的计时器
//     $('.J-home-slider').hover(function() {
//         flag = true;
//         var list = $(fs2.config.carrier.banner).children('li');
//         list.stop();
//         list.removeAttr('style');
//     }, function(){
//         flag = false;
//         var timer = $(fs2.config.carrier.banner).children('.selected');
//         timer && timer.animate({ 'backgroundPositionX' : '0'}, fs2.config.interval, function() {
//             timer.removeAttr('style');
//         });
//     });

//     $('.slider .pre').bind('click', function() {
//         fs2.prev();
//     });

//     $('.slider .next').bind('click', function() {
//         fs2.next();
//     });

})(jQuery)