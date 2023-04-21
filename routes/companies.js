/** Routes for companies of biztime. */

const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");

router.get('/companies', async (req, res, next) => {
  try { 
    const result = await db.query('SELECT code, name FROM companies') 
    return res.send({ companies: result.rows })
  } catch (e) {
    return next(e)
  }
})

router.get('/companies/:code', async (req, res, next) => {
  try { 
    const code = req.params.code;
    const result = await db.query('SELECT code, name, description FROM companies WHERE code=$1', [code]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Can't find company with code of ${code}, 404` });
    }
    return res.send({ company: result.rows[0] });
  } catch (e) {
    return next(e);
  }
}); 

router.post('/companies', async (req, res, next) => {
  try {
    const { code, name, description } = req.body;
    const results = await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description', [code, name, description]);
    return res.status(201).json({ companies: results.rows[0] })
  } catch (e) {
    return next(e)
  }
})

router.patch('/companies/:code', async (req, res, next) => {
  try { 
    const { code } = req.params;
    const { name, description, newCode } = req.body;
    const result = await db.query(
      'UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description',
      [ name, description, code ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Can't find company with code of ${code}, 404` });
    }
    return res.json({ company: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.put('/companies/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const { name, description, newCode } = req.body;
    const result = await db.query(
      'UPDATE companies SET code=$1, name=$2, description=$3 WHERE code=$4 RETURNING code, name, description',
      [newCode, name, description, code]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Can't find company with code of ${code}, 404` });
    }
    return res.json({ company: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.delete('/companies/:code', async (req, res, next) => {
  const { code } = req.params;
  try {
    const result = await db.query('DELETE FROM companies WHERE code = $1', [code])
    if (result.rowCount === 0) {
      return res.status(404).json({ error: `Can't find company with code of ${code}, 404` });
    }
    return res.send({ msg: "DELETED!" })
  } catch (e) {
    return next(e)
  }
})

module.exports = router;

// GET /companies
// curl --location --request GET 'http://localhost:3000/companies'

// GET /companies/id
// curl --location --request GET 'http://localhost:3000/companies/<id>'

// POST /companies
// curl --location --request POST 'http://localhost:3000/companies' \
// --header 'Content-Type: application/json' \
// --data-raw '{
//     "code": "<code>",
//     "name": "<name>",
//     "description": "<description>"
// }'

// PATCH
// curl --location --request PATCH 'http://localhost:3000/companies/<code>' \
// --header 'Content-Type: application/json' \
// --data-raw '{
//     "name": "<name>",
//     "description": ""
// }'

// PUT
// curl --location --request PUT 'http://localhost:3000/companies/<code>' \
// --header 'Content-Type: application/json' \
// --data-raw '{
//     "name": "<name>",
//     "description": "<description>",
//     "newCode": "<newCode>"
// }'


// DELETE
// curl --location --request DELETE 'http://localhost:3000/companies/<code>'
