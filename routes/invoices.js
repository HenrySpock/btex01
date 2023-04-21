/** Routes for invoices of biztime. */

const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");

router.get('/invoices', async (req, res, next) => {
  try { 
    const result = await db.query('SELECT id, comp_code FROM invoices') 
    return res.send({ invoices: result.rows })
  } catch (e) {
    return next(e)
  }
})

router.get('/invoices/:id', async (req, res, next) => {
  const { id } = req.params;
  try { 
    const result = await db.query('SELECT id, comp_code FROM invoices where id = $1', [id]) 
    return res.send({ invoices: result.rows })
  } catch (e) {
    return next(e)
  }
})

router.post('/invoices', async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;
    const results = await db.query(
      'INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date) \
      VALUES ($1, $2, $3, $4, $5) \
      RETURNING comp_code, amt, paid, add_date, paid_date',
      [comp_code, amt, req.body.paid, req.body.add_date, req.body.paid_date]);
    return res.status(201).json({ invoices: results.rows[0] })
  } catch (e) {
    return next(e)
  }
})

router.patch('/invoices/:id', async (req, res, next) => {
  try { 
    const { id } = req.params;
    const { amt } = req.body;
    const result = await db.query(
      'UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING amt, id',
      [ amt, id ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Can't find invoice with id of ${id}, 404` });
    }
    return res.json({ invoice: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.delete('/invoices/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM invoices WHERE id = $1', [id])
    if (result.rowCount === 0) {
      return res.status(404).json({ error: `Can't find invoice with id of ${id}, 404` });
    }
    return res.send({ msg: "DELETED!" })
  } catch (e) {
    return next(e)
  }
})

module.exports = router; 

// GET /invoices
// curl --location --request GET 'http://localhost:3000/invoices'

// GET /invoices/id
// curl --location --request GET 'http://localhost:3000/invoices/<id>'

// POST /invoices
// curl --location --request POST 'http://localhost:3000/invoices' \
// --header 'Content-Type: application/json' \
// --data-raw '{
//     "comp_code": "ACME",
//     "amt": 1000,
//     "paid": false,
//     "add_date": "2022-04-01",
//     "paid_date": null
// }'

// PATCH invoices/id
// curl --location --request PATCH 'http://localhost:3000/invoices/<id>' \
// --header 'Content-Type: application/json' \
// --data-raw '{
//     "amt": 800
// }'

// DELETE invoices/id
// curl --location --request DELETE 'http://localhost:3000/invoices/<id>' 