const cds = require('@sap/cds')

module.exports = cds.service.impl(function () {

  // this.on('CREATE', SelloutHeader, async req => {
  //   const header = req.data
  //   const daysSum = header.daysCEDI + header.daysPOS

  //   if (daysSum < 1 || daysSum > 90) {
  //     req.reject(400, 'daysCEDI + daysPOS is not between 1 and 90')
  //     return
  //   }

  //   header.createdAt = new Date(header.createdAt).setHours(0, 0, 0, 0)

  //   await cds.run(INSERT.into(SelloutHeader).entries(header))
  // })

  // this.on('CREATE', SelloutItem, async req => {
  //   const newItem = req.data

  //   if (!newItem.header_id) {
  //     req.reject(400, 'Missing header_id')
  //     return
  //   }

  //   const items = await cds.read(
  //     SELECT('*')
  //       .from(SelloutItem)
  //       .where('header_id =', newItem.header_id)
  //   )

  //   const valueSum = items.reduce(sum, item => sum + item.value)

  //   if (valueSum + newItem.value > 100.0) {
  //     req.reject(400, 'The sum of the items\' values is greater than 100%')
  //     return
  //   }

  //   await cds.run(INSERT.into(SelloutItem).entries(newItem))
  // })
})