sap.ui.define([
  'sap/ui/core/mvc/Controller',
  'sap/ui/model/json/JSONModel',
  'sap/m/Label',
  'sap/m/Input',
  'sap/m/Column',
  'sap/m/ColumnListItem',
  '../util/MessageHelper',
  '../model/Formatter'
], (
  Controller,
  JSONModel,
  Label,
  Input,
  Column,
  ColumnListItem,
  msg,
  Formatter
) => {
  'use strict';

  var model, profileModel, newProfile
  const modified = new Set()

  return Controller.extend('training.listreport.client.app.controller.Item', {

    formatter: Formatter,

    onInit() {
      model = this.getOwnerComponent().getModel()

      this.getOwnerComponent()
        .getRouter()
        .getRoute('Item')
        .attachPatternMatched(this.onEnter, this)
    },

    async onEnter(ev) {
      const id = ev.getParameter('arguments').id
      var data = {}
      newProfile = !id

      modified.clear()

      if (newProfile) {
        data.createdAt = new Date()
      }
      else {
        const url = model.url('itemRow')
        data = await $.get(url, {id})
      }

      this.byId('createdByInput')
        .setEditable(newProfile)
        .setRequired(newProfile)

      profileModel = new JSONModel(data)
      this.getView().setModel(profileModel, 'Profile')

      if (newProfile)
        this.initialize()
      else this.bindAll()
    },

    onBack() {
      this.getOwnerComponent().getRouter().navTo('Headers')
    },

    onDaysChange() {
      this.spreadValues()
      this.bindAll()
    },

    async onSave() {
      const url = model.url('itemRow')
      try {
        profileModel.setProperty('/newProfile', !!newProfile)
        await $.post(url, profileModel.getData())
        msg.toast('ItemSaveSuccess')
      }
      catch (err) {
        msg.error('ItemSaveError')
        console.error(err)
      }
    },

    initialize() {
      profileModel.setProperty('/daysCEDI', 10)
      profileModel.setProperty('/daysPOS', 5)
      this.spreadValues()
      this.bindChart()
    },

    bindAll() {
      const that = this
      const table = this.byId('itemTable').destroyRows()
      const daysCEDI = profileModel.getProperty('/daysCEDI')
      const daysPOS = profileModel.getProperty('/daysPOS')
      const daysSum = daysCEDI + daysPOS
      const days = {}
      const chartData = []
      const cells = []
      let i = 0

      // discard days that are not visible on the row
      const dayRegex = /[^\d]/g
      const keyRegex = /day[\d]{1,2}/
      Object.entries(profileModel.getData()).forEach(([key]) => {
        if (keyRegex.test(key)) {
          const day = parseInt(key.replace(dayRegex, ''), 10)
          if (day > daysSum) {
            profileModel.setProperty('/' + key)
            modified.delete(day)
          }
        }
      })

      function add(styleClass) {
        const day = i + 1
        const dayKey = 'day' + day
        const value = profileModel.getProperty('/' + dayKey) || 0

        const input = new Input({
          value: `{${dayKey}}`,
          textAlign: sap.ui.core.TextAlign.Center,
          valueState: modified.has(day) ? sap.ui.core.ValueState.Warning : sap.ui.core.ValueState.None,
          valueStateText: ' '
        })

        days[dayKey] = value

        // day number is passed to the event so that we can easily know which input was modified
        input.attachLiveChange({day}, that.onDayValueChange, that)

        input.setValueLiveUpdate(true)
        input.addStyleClass(styleClass)

        cells.push(input)

        table.addColumn(
          new Column({hAlign: sap.ui.core.TextAlign.Center})
            .setHeader(new Label({text: i + 1}))
        )

        chartData.push({day, value})
      }

      for (; i < daysCEDI; ++i)
        add('daysCEDI')

      for (; i < daysCEDI + daysPOS; ++i)
        add('daysPOS')

      const daysModel = new JSONModel({
        days: [days],
        chart: chartData
      })

      table.setModel(daysModel)

      table.bindItems({
        path: '/days',
        template: new ColumnListItem({cells})
      })

      this.byId('chartDataSet')
        .setModel(daysModel)
        .bindData('/chart')
    },

    bindChart() {
      this.byId('chartDataSet')
        .getModel()
        .setProperty('/chart', this.getDays().all)
    },

    onDayValueChange(ev, params, day = params.day) {
      const input = ev.getParameter('value')

      this.updateDayValue(day, input, true)
      this.spreadValues()

      // mark the input as modified with a state
      ev.getSource().setValueState(sap.ui.core.ValueState.Warning)

      this.bindChart()
    },

    updateDayValue(day, input, markModified = false) {
      const tableModel = this.byId('itemTable').getModel()

      if (markModified)
        modified.add(day)

      const decimalString = input.toDecimalString(1)
      let floatValue = parseFloat(decimalString).roundDecimals()
      let displayValue = floatValue > 100 ? '100' : decimalString

      if (floatValue > 100)
        floatValue = 100

      this.updateDayModels(day, floatValue, displayValue)

      const days = this.getDays()

      if (days.modifiedTotal > 100) {
        floatValue = (Math.abs(floatValue - (days.modifiedTotal - 100))).roundDecimals()
        displayValue = floatValue.toString()
      }

      this.updateDayModels(day, floatValue, displayValue)

      return floatValue
    },

    spreadValues() {
      const days = this.getDays()

      const spread = ((100 - days.modifiedTotal) / days.unmodifiedCount).roundDecimals()
      let remaining = (100 - ((spread * days.unmodifiedCount) + days.modifiedTotal)).roundDecimals()

      for (const day of days.unmodified) {
        if (remaining !== 0) {
          day.value = (spread + remaining).roundDecimals()

          if (day.value < 0) {
            remaining += day.value
            day.value = 0
          }
          else {
            remaining = 0
          }
        }
        else {
          day.value = spread
        }

        this.updateDayModels(day.day, day.value)
      }
    },

    getDays() {
      const daysCEDI = profileModel.getProperty('/daysCEDI')
      const daysPOS = profileModel.getProperty('/daysPOS')
      const days = []
      const modifiedDays = []
      const unmodifiedDays = []
      let total = 0
      let modifiedTotal = 0
      let unmodifiedTotal = 0

      for (let i = 0; i < daysCEDI + daysPOS; ++i) {
        const day = i + 1
        const value = profileModel.getProperty(`/day${i + 1}`) || 0.0
        const dayObj = {day, value}

        total += value
        days.push(dayObj)

        if (modified.has(day)) {
          modifiedDays.push(dayObj)
          modifiedTotal += value
        }
        else {
          unmodifiedDays.push(dayObj)
          unmodifiedTotal += value
        }
      }

      return {
        all: days,
        modified: modifiedDays,
        unmodified: unmodifiedDays,
        total,
        modifiedTotal,
        unmodifiedTotal,
        count: days.length,
        modifiedCount: modifiedDays.length,
        unmodifiedCount: unmodifiedDays.length
      }
    },

    updateDayModels(day, floatValue, displayValue = floatValue) {
      this.byId('itemTable').getModel().setProperty('/days/0/day' + day, displayValue)
      profileModel.setProperty('/day' + day, floatValue)
    }
  });
});
