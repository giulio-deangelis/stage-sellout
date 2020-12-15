Number.prototype.coerceAtLeast = function (min) {
  return this >= min ? this : min
}

Number.prototype.coerceAtMost = function (max) {
  return this <= max ? this : max
}

Number.prototype.coerceBetween = function (min, max) {
  return this >= min ? this <= max ? this : max : min
}

Number.prototype.roundDecimals = function () {
  return Math.round(this * 10) / 10
}