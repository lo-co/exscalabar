/** This controller is placed on the O3 cal page and defines what will happen
 *    when a user double clicks on a table element.
 *
 *    When the element containing this controller is first displayed, the values
 *    in the attribute table_vals will be used to populate the canned table for
 *    sequence building using the ng-repeat directive.
 *
 *    When the user double clicks on a row, the controller will call the tableService
 *    setTab method.  This in turn updates the attributes of that service with the ID
 *    of the row that was clicked.  That ID is then broadcast and picked up by the
 *    tableInput-ctlr which populates the table for the sequence with a default value
 *    for the selected element.
 */

(function() {
    angular.module('main')
        .controller('ExCalibrationCtl', cal_ctl);

    cal_ctl.$inject = ['$scope', '$rootScope', 'ExCalibrationSvc', 'cvt'];

    var cal_saved = true;

    function cal_ctl($scope, $rootScope, ExCalibrationSvc, cvt) {


        $scope.data = ExCalibrationSvc.default;
        $scope.o3_valve = cvt.ozone.valve;
        $scope.lamp_rate = ExCalibrationSvc.lamp_rate;
        $scope.updateO3Valve = function() {
            $scope.o3_valve = !$scope.o3_valve;
            cvt.ozone.updateValve($scope.o3_valve);

        };

        // Two values are ozone and pressure
        $scope.cal_type = "ozone";

        $scope.cal_type_selection = function() {
            console.log($scope.cal_type);
            build_table($scope.cal_type);
        };

        $scope.cal_active = ExCalibrationSvc.cal_state;
        $scope.runCal = function() {
            //$scope.cal_active = !$scope.cal_active;
            if (!cal_saved) {
                var r = confirm("You are about to run a calibration from the server file. The current calibration on the client is unsaved.  Do you wish to save it first?");
                console.log(r);
                if (r) {
                    $scope.save();
                } else {
                    $scope.getCurrent();
                }
            }
            ExCalibrationSvc.runCalibration();
        };
        $scope.updateLamp = function() {
            ExCalibrationSvc.update_lamp_rate($scope.lamp_rate);

        };

        $scope.save = function() {

            ExCalibrationSvc.ship_data($scope.data);
            cal_saved = true;

        };

        /* Contains the entries that will go into the canned table. */
        $scope.base_vals = [{
                "id": "Wait",
                "step": "Wait",
                "descr": "Set a wait time in the ozone cal in seconds"
            },
            {
                "id": "Filter",
                "step": "Filter",
                "descr": "Boolean that sets the filter state."
            },
            {
                "id": "Inlet",
                "step": "Inlet",
                "descr": "Boolean that sets the inlet valve state."
            },
            {
                "id": "Denuder",
                "step": "Denuder/Bypass",
                "descr": "Boolean that sets the denuder/bypass valve state."
            },
            {
                "id": "Speaker",
                "step": "Speaker",
                "descr": "Boolean that sets the speaker state."
            },
            {
                "id": "P-Ctl",
                "step": "Pressure Control",
                "descr": "Set the pressure control vale."
            }
        ];

        $scope.ozone_vals = [{
                "id": "O3-Valve",
                "step": "O3 Valve",
                "descr": "Boolean that sets the O3 valve state."
            },
            {
                "id": "O3-Generator-Power",
                "step": "O3 Generator",
                "descr": "Boolean that sets the O3 generator state"
            },
            {
                "id": "O2-Flow-Rate",
                "step": "QO2",
                "descr": "Numeric to set the oxygen flow rate"
            },

            {
                "id": "O3-Dump-Rate",
                "step": "QO3,dump",
                "descr": "Ozone dump rate in lpm"
            },
            {
                "id": "O3-Lamp-Rate",
                "step": "O3 Lamp Rate",
                "descr": "Ozone lamp rate (Hz)"
            }
        ];



        function build_table(cal_type) {
            // Initial shallow copy of the base vals...
            $scope.table_vals = $scope.base_vals.slice();
            if (cal_type === 'ozone') {
                for (var i = 0; i < $scope.ozone_vals.length; i++) {
                    $scope.table_vals.push($scope.ozone_vals[i]);
                }

            } else {

            }
        }
        build_table("ozone");

        $rootScope.$on('cvtUpdated', function() {
            $scope.o3_valve = cvt.ozone.valve;
        });


        var val = "";
        var ID = "";
        /* Handle row double clicks */
        $scope.clickRow = function(row) {
            /* tableService will broadcast the the listeners the current ID */
            //tableService.setTab(row.id.toString());
            ID = row.id.toString();
            switch (ID) {
                case "Wait":
                    val = "20";
                    break;
                case "O2-Flow-Rate":
                case "O3-Dump-Rate":
                    val = "100";
                    break;
                case "P-Ctl":
                    val = "1000";
                    break;
                case "O3-Level":
                    val = "1";
                    break;
                case "O3-Lamp-Rate":
                    val = "0";
                    break;
                default:
                    val = "FALSE";
            }

            $scope.data.push({
                "id": ID,
                "val": val
            });

            cal_saved = false;
        };

        $scope.getCurrent = function() {
            $scope.data = ExCalibrationSvc.get_o3_file();

            cal_saved = true;
        };

        $scope.removeVal = function(i) {
            $scope.data.splice(i, 1);
            cal_saved = false;
        };
    }
})();
