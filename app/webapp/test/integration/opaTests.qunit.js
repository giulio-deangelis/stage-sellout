/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"training/listreport/client/app/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});
