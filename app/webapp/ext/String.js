/** Kotlin-like String extension methods */
sap.ui.define([], function () {
  'use strict';
  
  const bufRegex = /[^\d.]/g

	$.extend(String, {
		isBlank: function (...strings) {
			for (const string of strings)
				if (!string || string.isBlank()) return true;
			return false;
		}
	});

	$.extend(String.prototype, {

		isBlank: function () {
			for (const c of this)
				if (c !== ' ') return false;
			return true;
		},

		isNotBlank: function () {
			return !this.isBlank();
		},

		capitalize: function () {
			return this.substring(0, 1).toUpperCase() + this.substring(1);
		},

		decapitalize: function () {
			return this.substring(0, 1).toLowerCase() + this.substring(1);
		},

		substringBefore: function (delimiter, startPos) {
			const start = this.indexOf(delimiter, startPos || 0);
			if (start < 0) return this;
			return this.substring(0, start);
		},

		substringAfter: function (delimiter, startPos) {
			const start = this.indexOf(delimiter, startPos || 0) + delimiter.length;
			if (start < 0) return this;
			return this.substring(start);
		},

		substringBeforeLast: function (delimiter, startPos) {
			const end = this.lastIndexOf(delimiter, startPos);
			if (end < 0) return this;
			return this.substring(0, end);
		},

		substringAfterLast: function (delimiter, startPos) {
			const start = this.lastIndexOf(delimiter, startPos) + (delimiter.length - 1);
			if (start < 0) return this;
			return this.substring(start + 1, this.length);
		},

		first: function (count) {
			return this.substring(0, count || 1);
		},

		last: function (count) {
			return this.substring(this.length - (count || 1), this.length);
		},

		matches: function (regex) {
			return regex.test(this);
    },

    prefixedOnceWith(prefix) {
      const str = this.split(prefix)
      if (str[0] === prefix) {
        while (str[1] === prefix)
          str.splice(1, 1)
      }
      else {
        str.unshift(prefix)
      }
      return str.join('')
    },

    suffixedOnceWith(suffix) {
      const str = this.split(suffix)
      if (str[str.length - 1] === suffix) {
        while (str[str.length - 1 === suffix])
          str.splice(str.length - 1, str.length)
      }
      else {
        str.push(suffix)
      }
      return str.join('')
    },

    toDecimalString(decimalPlaces = Infinity) {
      let buf = []
      let hasDot = false
      let decimalCount = 0

      for (const c of this) {
        if (c >= '0' && c <= '9') {
          if (hasDot) {
            if (decimalCount >= decimalPlaces)
              continue
            decimalCount += 1
          }
          buf.push(c)
        }
        else if (!hasDot && c === '.') {
          buf.push(c)
          hasDot = true
        }
      }

      return buf.join('')
    }
	});
});