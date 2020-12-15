sap.ui.define([], () => {

  $.extend(Number.prototype, {

    coerceAtLeast(min) {
      return this >= min ? this : min
    },

    coerceAtMost(max) {
      return this <= max ? this : max
    },

    coerceBetween(min, max) {
      return this >= min ? this <= max ? this : max : min
    },

    roundDecimals() {
      return Math.round(this * 10) / 10
    }
  })
})