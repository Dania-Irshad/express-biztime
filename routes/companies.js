const express = require("express");
const ExpressError = require("../expressError");
const slugify = require("slugify");
const db = require("../db");
const router = new express.Router();

router.get('/', async (req, res, next) => {
    try {
        const result = await db.query(
            `SELECT code, name 
             FROM companies`);
        return res.json({ "companies": result.rows });
    }
    catch (err) {
        return next(err);
    }
});

router.get('/:code', async (req, res, next) => {
    const code = req.params.code;
    const compResult = await db.query(
        `SELECT c.code, c.name, c.description, i.name AS industry
         FROM companies AS c
         LEFT JOIN companies_industries AS ci
         ON c.code = ci.company_code
         LEFT JOIN industries AS i
         ON ci.industry_code = i.code
         WHERE c.code = $1`, [code]);
    const invResult = await db.query(
        `SELECT id 
         FROM invoices 
         WHERE comp_code = $1`, [code]);
    if (compResult.rows.length === 0) {
        throw new ExpressError('Company not found', 404)
    }
    let company = compResult.rows[0];
    let invoices = invResult.rows;
    company.invoices = invoices.map(inv => inv.id);
    return res.json({ "company": company });
});

router.post('/', async (req, res, next) => {
    const { name, description } = req.body;
    let code = slugify(name, { lower: true });
    const result = await db.query(
        `INSERT INTO companies (code, name, description) 
         VALUES ($1, $2, $3) 
         RETURNING code, name, description`, [code, name, description]);
    return res.json({ "company": result.rows[0] });
});

router.put('/:code', async (req, res, next) => {
    const code = req.params.code;
    const { name, description } = req.body;
    const result = await db.query(
        `UPDATE companies 
         SET name = $1, description = $2 
         WHERE code = $3 
         RETURNING code, name, description`, [name, description, code]);
    if (result.rows.length === 0) {
        throw new ExpressError('Company not found', 404)
    }
    return res.json({ "company": result.rows[0] });
});

router.delete('/:code', async (req, res, next) => {
    const code = req.params.code;
    const result = await db.query(
        `DELETE FROM companies 
        WHERE code = $1`, [code]);
    if (result === 0) {
        throw new ExpressError('Company not found', 404)
    }
    else {
        return res.json({ 'status': 'deleted' });
    }
});

module.exports = router;