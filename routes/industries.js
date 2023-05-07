const express = require("express");
const ExpressError = require("../expressError");
const slugify = require("slugify");
const db = require("../db");
const router = new express.Router();

router.get('/', async (req, res, next) => {
    try {
        const result = await db.query(
            `SELECT code, name 
             FROM industries`);
        return res.json({ "industries": result.rows });
    }
    catch (err) {
        return next(err);
    }
});

router.get('/:code', async (req, res, next) => {
    const result = await db.query(
        `SELECT i.code, i.name, c.code AS company
         FROM industries AS i
         LEFT JOIN companies_industries AS ci
         ON i.code = ci.industry_code
         LEFT JOIN companies AS c
         ON ci.company_code = c.code
         WHERE i.code = $1`, [req.params.code]);
    if (result.rows.length === 0) {
        throw new ExpressError('Industry not found', 404)
    }
    let { code, name } = result.rows[0];
    let companies = result.rows.map(r => r.company);
    return res.json({ "industry": code, name, companies });
});

router.post('/', async (req, res, next) => {
    const { name } = req.body;
    let code = slugify(name, { lower: true });
    const result = await db.query(
        `INSERT INTO industries (code, name) 
         VALUES ($1, $2) 
         RETURNING code, name`, [code, name]);
    return res.json({ "industry": result.rows[0] });
});

router.put("/:code", async function (req, res, next) {

    const result = await db.query(
        `UPDATE companies_industries SET company_code=$1 WHERE industry_code = $2
             RETURNING company_code, industry_code`,
        [req.body.company_code, req.params.code]);
    return res.json(result.rows[0]);

});

module.exports = router;