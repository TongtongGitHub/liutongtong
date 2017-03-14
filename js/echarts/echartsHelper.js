/**
 * Created by liutongtong on 2017/3/1.
 * require jQuery, echarts
 */
(function($){
    if(window.EchartsHelper)
        return;

    var defaults = {
        echartsId: "",
        data: "",   //用户传入基本数据
        type: "",   //图表类型
        mapName:"",
        mapJson: "", //地图类型图表需要地图json文件
        mapAdjust:"" //地图部分位置调整数据
    };

    var EchartsHelper = {
        //工厂方式创建echart实例
        init: function(cf){
            var config = $.extend(defaults, cf);
            //初始化实例
            var echartInstance = echarts.init(document.getElementById(config.echartsId));
            //获取基本配置项
            var echartOption = getBaseOptionByType(config);
            if(!echartOption){
                console.log("Not support!");
                return;
            }
            $.extend(true,echartOption,config.data);
            echartInstance.setOption(echartOption);
            //图形自适应
            $(window).resize(function () {
                echartInstance.resize();
            });
            return echartInstance;
        }
    };

    //获取每种图表的基础配置参数
    var getBaseOptionByType = function(config){
        var option = null;
        if(config.type == "line"){
            option = {
                title: {
                    text: "",
                    subtext: "",
                    subtextStyle: {
                        color: '#222'
                    },
                    left: 'center'
                },
                tooltip: {
                    trigger: 'axis',
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    borderWidth: 1,
                    borderColor: '#c2c2c2',
                    textStyle: {
                        color: '#222',
                        fontSize: 12
                    }
                },
                legend: {
                    data: [],
                    left: "",   //20 20% or left center right
                    right: "",  //20 20%
                    top: "",    //20 20% or top middle bottom
                    bottom: ""  //20 20%
                },
                grid: {
                    top: 90,
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                toolbox: {
                    show: false
                },
                xAxis: {
                    name:"",
                    type: 'category',
                    nameGap: 30,
                    data: []
                },
                yAxis: "",
                series: ""
            }
        } else if (config.type == "pie"){
            option = {
                title: {
                    text: "",
                    subtext: "",
                    x: "center"
                },
                tooltip: {
                    trigger: 'item',
                    formatter: "{b}: <strong>{c}({d}%)</strong>",
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    borderWidth: 1,
                    borderColor: '#c2c2c2',
                    transitionDuration: 0,
                    extraCssText: 'margin-left: 20px;',
                    textStyle: {
                        color: '#222',
                        fontSize: 12
                    }
                },
                legend: {
                    orient: 'vertical',
                    left: 'left',
                    data: []
                },
                series: [{
                    name: "",
                    type: 'pie',
                    radius: '55%',
                    center: ['50%', '60%'],
                    data: [],
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }]
            }
        } else if (config.type == "map"){
            echarts.registerMap(config.mapName, config.mapJson, config.mapAdjust);
            option = {
            }
        }
        return option;
    }

    //工具方法
    //计算y轴最大值
    EchartsHelper.getMaxNum = function(arr){
        var series = arr || [];
        var maxNum = 0;
        for (var i = 0; i < series.length; i++) {
            if (series[i] > maxNum) {
                maxNum = series[i];
            }
        }
        var digits = Math.pow(10, Math.ceil(maxNum).toString().length - 1);
        var about = Math.ceil(maxNum / digits);

        if (about === 0) {
            maxNum = Math.ceil(maxNum / digits) * digits;
        } else if (about <= 5) {
            maxNum = 5 * digits;
        } else {
            maxNum = 10 * digits;
        }

        return maxNum ? maxNum : 10;
    }

    //获取组装后图例名字
    EchartsHelper.getlegendName = function (arr) {
        var series = arr || [];
        var name = [];
        for (var i = 0; i < series.length; i++) {
            //name.push(series[i].name || "Other");
            if(series[i].name){
                name.push(series[i].name);
            }
        }
        return name.length ? name : ['0'];
    };

    //图数据处理
    EchartsHelper.getEchartData = function (arr, color) {
        var series = arr || [];
        var pieSeries = [];
        for (var i = 0; i < series.length; i++) {
            var item = {};
            item.value = series[i].value;
            item.name = series[i].name || "Other";
            if (color && color[i]) {
                item.itemStyle = {};
                item.itemStyle.normal = {};
                item.itemStyle.normal.color = color[i];
            }
            pieSeries.push(item);
        }
        return pieSeries.length ? pieSeries : [{ name: '0', value: '0' }];
    };

    //空数据过滤
    EchartsHelper.filterOther = function(json){
        var otherVal = 0;
        var seriesJson = [];
        var retObj = {};
        for(var i=0; i<json.length; i++){
            if(!json[i].id || !json[i].name){
                otherVal += json[i].value;
            }else{
                seriesJson.push(json[i]);
            }
        }
        if(otherVal){
            seriesJson.push({"id":"null","name":"Other","value":otherVal})
        }
        return {"isExistOther": otherVal, "series": seriesJson};
    };

    EchartsHelper.arrPush = function(arr, str){
        arr.push(str)
        return arr;
    }

    window.EchartsHelper = EchartsHelper;
})(jQuery)