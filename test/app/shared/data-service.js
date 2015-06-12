/** This is the main service for retrieving data at regular intervals.
 *
 */

(function() {
	angular.module('main').factory('Data', ['$rootScope', '$http', '$log', 'net',
	function($rootScope, $http, $log, net) {

		function updateTime(t) {
			/* The reference for LabVIEW time is 1 Jan 1904.  JS days
			 * are zero based so set the value to the correct date for
			 * reference.
			 */
			var lvDate = new Date(1904, 0, 1);
			lvDate.setSeconds(t);
			// var strTime = lvDate.getHours() + ':' + (lvDate.getMinutes() < 10 ? "0" : "") + lvDate.getMinutes() + ':' + (lvDate.getSeconds() < 10 ? "0" : "") + lvDate.getSeconds() + '.' + lvDate.getMilliseconds();
			return lvDate;
		}

		/* Contains data specific to the PAS */
		function pasData() {
			this.f0 = [];
			this.IA = [];
			this.Q = [];
			this.p = [];
			this.abs = [];
			this.micf = [];
			this.mict = [];
			this.pd = [];
		};

		function crdObject() {
			this.tau = [];
			this.tau0 = [];
			this.taucorr = [];
			this.tau0corr = [];
			this.ext = [];
			this.extcorr = [];
			this.stdvTau = [];
			this.etau = [];
			this.max = [];
			this.rd = [];
		};

		/* The full data object contains arrays of data as defined in the objects above.
		 * This object is INTENDED to be static...
		 */
		var dataObj = {
			"time" : null,
			"filter" : true,
			"save" : true,
			"o3cal" : false,
			"time" : []
		};

		// Defines array lengths - 100 == 100 seconds of data
		var maxLength = 300;

		/* Variable that indicates everyone needs to shift... */
		var shiftData = false;

		dataObj.pas = {};
		dataObj.pas.cell = [new pasData()];
		dataObj.pas.drive = true;

		dataObj.crd = {};
		dataObj.crd.cell = [new crdObject()];

		/* Call this to poll the server for data */
		dataObj.getData = function() {
			promise = $http.get('http://' + net.address() + '/xService/General/Data').success(function(data, status, headers, config) {
				$rootScope.$broadcast('dataAvailable');

				if (dataObj.time.length - 1 >= maxLength) {
					dataObj.time.pop();
					shiftData = true;
				}

				dataObj.time.unshift(updateTime(data.Time).getTime());

				// TODO: Fix this hideousness!!!  Has to be a better way...
				for (var index in data.PAS.CellData) {

					/* Make sure we have all of the cells accounted for */
					if ((dataObj.pas.cell.length - 1) < index) {
						dataObj.pas.cell.push(new pasData());
					}

					/* Pop all of the ordered arrays if the arrays are of the set length... */
					if (shiftData) {
						dataObj.pas.cell[index].f0.pop();
						dataObj.pas.cell[index].IA.pop();
						dataObj.pas.cell[index].Q.pop();
						dataObj.pas.cell[index].p.pop();
						dataObj.pas.cell[index].abs.pop();
					}

					dataObj.pas.cell[index].f0.unshift(data.PAS.CellData[index].derived.f0);
					dataObj.pas.cell[index].IA.unshift(data.PAS.CellData[index].derived.IA);
					dataObj.pas.cell[index].Q.unshift(data.PAS.CellData[index].derived.Q);
					dataObj.pas.cell[index].p.unshift(data.PAS.CellData[index].derived.noiseLim);
					dataObj.pas.cell[index].abs.unshift(data.PAS.CellData[index].derived.abs);

					/* This is one off data and is not a function of time... */
					dataObj.pas.cell[index].micf = data.PAS.CellData[index].MicFreq.Y;
					dataObj.pas.cell[index].mict = data.PAS.CellData[index].MicTime.Y;
					dataObj.pas.cell[index].pd = data.PAS.CellData[index].PhotoDiode.Y;

				}
				dataObj.pas.drive = data.PAS.Drive;
			});
		};

		return dataObj;

	}]);
})();
