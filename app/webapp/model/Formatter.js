sap.ui.define(['sap/ui/core/format/DateFormat', '../ext/String'], (DateFormat) => {

  const dateFormatter = DateFormat.getDateInstance({pattern: 'dd/MM/yyyy'})

  return {

    formatEpochDate(epochDate) {
      var date

      if (!epochDate)
        return null
      else if (typeof epochDate === 'string')
        date = new Date(parseInt(epochDate.replaceAll(',', ''), 10))
      else
        date = new Date(epochDate)

      return dateFormatter.format(date)
    },

    formatDate(date, utc = false) {
      const parsedDate = (typeof date === 'string')
        ? dateFormatter.parse(date)
        : (typeof date === 'number') ? new Date(date) : date
      return dateFormatter.format(parsedDate, utc)
    },

    parseDate(dateStr, utc = false) {
      return dateFormatter.parse(dateStr, utc)
    }
  }
})