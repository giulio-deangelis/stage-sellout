sap.ui.define([
    'sap/ui/core/mvc/Controller',
    '../util/MessageHelper'
	],
	function (Controller, MessageHelper) {
		'use strict';

		return Controller.extend('training.listreport.client.app.controller.Main', {

			onInit() {
        this.getOwnerComponent().getRouter().navTo('Headers')
        MessageHelper.setI18nModel(this.getView().getModel('i18n'))
			}
		});
	});
