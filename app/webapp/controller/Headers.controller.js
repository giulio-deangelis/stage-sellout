sap.ui.define([
    'sap/ui/core/mvc/Controller',
    'sap/ui/model/json/JSONModel',
    'sap/ui/model/Filter',
    '../model/Formatter'
	],
	function (Controller, JSONModel, Filter, Formatter) {
    'use strict';
    
    var model, filterModel

		return Controller.extend('training.listreport.client.app.controller.Headers', {
      
      formatter: Formatter,

      onInit() {
        model = this.getView().getModel()
        filterModel = new JSONModel()

        this.byId('newRowForm').setModel(filterModel)
      },

      onFilter() {
        const headers = this.byId('headersList').getBinding('items')
        const inputs = filterModel.getData()
        const filters = []

        if (inputs.name)
          filters.push(new Filter('name', 'Contains', inputs.name))

        if (inputs.description)
          filters.push(new Filter('description', 'Contains', inputs.description))

        if (inputs.daysCEDI)
          filters.push(new Filter('daysCEDI', 'EQ', inputs.daysCEDI))

        if (inputs.daysPOS)
          filters.push(new Filter('daysPOS', 'EQ', inputs.daysPOS))

        if (inputs.createdBy)
          filters.push(new Filter('createdBy', 'Contains', inputs.createdBy))

        if (inputs.createdAt) {
          inputs.createdAt = new Date(inputs.createdAt).setHoursToBeginning()
          filters.push(new Filter(new Filter('createdAt', 'EQ', inputs.createdAt)))
        }

        headers.filter(new Filter({and: true, filters}))
      },
      
      onCreateNewProfile() {
        this.getOwnerComponent().getRouter().navTo('Item')
      },

      onItemPress(ev) {
        const id = ev.getSource().getBindingContext().getProperty('id')
        this.getOwnerComponent().getRouter().navTo('Item', {id})
      }
		});
	});
