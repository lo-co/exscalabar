(function () {
  angular.module('main')
  .factory('ExCalibrationSvc', ['$http', 'net', 'cvt', '$rootScope',
  function ($http, net, cvt, $rootScope) {

    var tabService = {
      lamp_rate: 0,
      o3_valve: false,
      default: [],
        cal_state: cvt.cal.active
    };
    var build_file = function (data) {
      var xml = '<?xml version="1.0" encoding="utf-8"?>\r\n<OZONE>\r\n';
      data.forEach(function (datum) {
        xml += "\t<" + datum.id + ">" + datum.val + '</' + datum.id + '>\r\n';
      });

      xml += "</OZONE>";

      return xml;
    };

    tabService.ship_data = function (data) {

      $http({
        method: 'POST',
        url: net.address() + 'Calibration/saveCalFile?file_name=' + "o3",
        data: build_file(data),
        headers: {
          "Content-Type": 'application/x-www-form-urlencoded'
        }
      });
    };

    /**
    * Use this to change the state of the calibration.  This takes two
    * input parameters that are optional:
    * * cal_type = the  type of calibration intended, '03' or 'p'
    * * start = boolean indicating whether the cal will be on or off
    */
    tabService.runCalibration = function(){

      cal_type = 'o3';
      start = true;
        if (!tabService.cal_state){
      if (arguments.length !== 0){

        cal_type = arguments[0];
        if (arguments.length ==1 ){

          $http.get(net.address + 'Calibration/StartCal?type=' + cal_type);


        }
      }
      else{

        $http.get(net.address() + 'Calibration/StartCal?type=' + cal_type);
        //console.log(net.address() + 'Calibration/StartCal?type=' + cal_type);
      }
        }
        else{
            $http.get(net.address() + 'Calibration/StopCalibration');
        }
      //console.log('Running calibration...');
    };
    tabService.set_lamp_rate = function(val){
         $http.get(net.address() + 'Calibration/O3LampFreq?Freq=' + val);
    };

    tabService.get_o3_file = function () {
      var data = '';
      var val = [];
      var req = {
        method: 'GET',
        url: net.address() + 'Calibration/getDefaultO3Cal',
        headers: {
          'Content-Type': 'application/xml'
        }
      };
      promise = $http(req).then(
        function (response) {
          // Remove all of the pretty spacing and carriage returns
          // That shows up as 'text' in the DOM
          data = response.data.replace(/\r?\n|\r?\t/g, '');
          console.log(data);
          parser = new DOMParser();
          xmlDoc = parser.parseFromString(data, "text/xml");
          x = xmlDoc.documentElement.childNodes;
          console.log(x);

          for (i = 0; i < x.length; i++) {
            val.push({
              "id": x[i].nodeName,
              "val": x[i].childNodes[0].nodeValue
            });
          }

          console.log(val);
        },
        function () {
          console.log('get failed');
        });

        tabService.default = val;
        return tabService.default;
      };
      tabService.default = tabService.get_o3_file();
      tabService.update_lamp_rate = function (val) {
        maxfreq=850;
         val=val<=maxfreq ? val : maxfreq;
         console.log(val);
          tabService.lamp_rate=val;
        $http.get(net.address() + 'Calibration/O3LampFreq?Freq=' + val);
      };

      $rootScope.$on('cvtUpdated', cvt_update);

      function cvt_update(){
        tabService.lamp_rate = cvt.cal.lamp_rate;
        tabService.o3_valve = cvt.cal.o3_valve;
      }
      
      $rootScope.$on('cvtUpdated', update_svc);
      
      function update_svc(){
          tabService.cal_state = cvt.cal.active;
      }

      return tabService;
    }]);

  })();
