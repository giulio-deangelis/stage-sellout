require('./ext/Number')
const cds = require('@sap/cds')

// I avoid using cds.entities because it doesn't work with joins
const SelloutHeader = 'training.listreport.entities.SelloutHeader'
const SelloutItem = 'training.listreport.entities.SelloutItem'

module.exports = cds.server

cds.on('bootstrap', app => {
  const express = require('express')

  app.use(express.urlencoded())
  app.use(express.json())

  app.get('/sellout/itemRow', GET_itemRow)
  app.post('/sellout/itemRow', POST_itemRow)
})

async function GET_itemRow(req, res) {
  const {id} = req.query

  if (!id) {
    res.send(400)
    return
  }

  try {
    const headers = await cds.read(
      SELECT(
        'name', 'description', 'daysCEDI', 'daysPOS',
        'stdCal', 'createdAt', 'createdBy'
      ).from(SelloutHeader)
        .where('id =', id)
    )

    const items = await cds.read(
      SELECT('i.day', 'i.value')
        .from(`${SelloutItem} as i`)
        .join(`${SelloutHeader} as h`)
        .on('h.id = i.header_id')
        .where('header_id =', id)
    )

    const row = {...headers[0], headerId: id}

    for (const item of items)
      row[`day${item.day}`] = item.value

    res.send(row)
  }
  catch (err) {
    res.send(400)
  }
}

async function POST_itemRow(req, res) {
  const data = req.body
  const tx = cds.transaction()

  try {
    if (!data) {
      res.send(400)
      return
    }

    const id = parseInt(data.headerId, 10)
    let newProfile

    if (typeof data.newProfile === 'string')
      newProfile = data.newProfile === 'true' ? true : false
    else newProfile = data.newProfile

    if (!id && !data.newProfile) {
      res.send(400, 'Header ID is missing')
      return
    }

    const keyRegex = /day[\d]{1,2}/
    const dayRegex = /[^\d]/g
    const days = Object.entries(data)
      .filter(([key]) => keyRegex.test(key))
      .map(([key, value]) => {
        return {
          header_id: id,
          day: parseInt(key.replace(dayRegex, ''), 10),
          value: parseFloat(value).roundDecimals()
        }
      })

    if (days.length < 1 || days.length > 90) {
      res.status(400)
        .send('Day count must be between 1 and 90')
      return
    }

    const daysSum = days.reduce((sum, day) => sum + day.value, 0).roundDecimals()

    if (daysSum > 100) {
      res.status(400)
        .send(`The sum of day values must not be greater than 100% (given: ${daysSum})`)
      return
    }

    let header
    // eslint-disable-next-line no-with
    with (data) {
      header = {
        header_id: id,
        name,
        description,
        daysCEDI,
        daysPOS,
        createdAt: new Date(createdAt).setHours(0, 0, 0, 0),
        createdBy,
        stdCal
      }
    }

    if (newProfile)
      await insert(tx, header, days)
    else await update(tx, header, days)

    res.sendStatus(200)

  }
  catch (err) {
    console.error(err)
    res.sendStatus(500)
    tx.rollback()
  }
}

async function insert(tx, header, days) {

  // TODO autogenerate new IDs
  
  await tx.run(
    INSERT
      .into(SelloutHeader)
      .entries(header)
  )

  await tx.run(
    INSERT
      .into(SelloutItem)
      .entries(days)
  )

  await tx.commit()
}

async function update(tx, header, days) {
  await tx.run(
    DELETE
      .from(SelloutItem)
      .where({header_id: header.id, day: {'>': days.length}})
  )

  await tx.run(
    UPDATE(SelloutHeader)
      .set({daysCEDI: header.daysCEDI, daysPOS: header.daysPOS})
      .where({id: header.header_id})
  )

  for (const day of days) {
    const rowsUpdated = await tx.run(
      UPDATE(SelloutItem)
        .set({value: day.value})
        .where({day: day.day, header_id: header.header_id})
    )
    if (!rowsUpdated)
      await tx.run(INSERT.into(SelloutItem).entries(day))
  }
  await tx.commit()
}