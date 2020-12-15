/** Utility class to show messages through this.i18n properties */
sap.ui.define([
  'sap/m/MessageToast',
  'sap/m/MessageBox'
], function (MessageToast, MessageBox) {

  var i18nModel

  return {

    setI18nModel(model) {
      i18nModel = model
    },

    toast(msgProp) {
      MessageToast.show(this.i18n(msgProp))
    },

    alert(msgProp, titleProp) {
      MessageBox.alert(this.i18n(msgProp), this._defaultBoxSettings(titleProp))
    },

    confirm(msgProp, titleProp, onClose) {
      const settings = this._defaultBoxSettings(titleProp || 'confirm')
      const confirm = this.i18n('confirm')
      const cancel = this.i18n('cancel')

      settings.actions = [confirm, cancel]
      settings.emphasizedAction = confirm

      settings.onClose = (action) => {
        onClose(action === confirm)
      }

      MessageBox.confirm(this.i18n(msgProp), settings)
    },

    error(msgProp, titleProp, onClose) {
      MessageBox.error(this.i18n(msgProp), this._defaultBoxSettings(titleProp || 'error', onClose))
    },

    i18n(prop) {
      const msg = i18nModel.getProperty(prop)
      return msg ? msg : prop
    },

    _defaultBoxSettings(titleProp, onClose) {
      const settings = {}
      settings.title = this.i18n(titleProp)
      settings.onClose = onClose
      return settings
    }
  }
})