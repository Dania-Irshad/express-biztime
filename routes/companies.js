const express = require("express");
const ExpressError = require("../expressError");
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
        `SELECT * 
         FROM companies 
         WHERE code = $1`, [code]);
    const invResult = await db.query(
        `SELECT id 
         FROM invoices 
         WHERE comp_code = $1`, [code]);
    if (compResult.rows.length === 0) {
        throw new ExpressError('Company not found', 404)
    }
    const company = compResult.rows[0];
    const invoices = invResult.rows;
    company.invoices = invoices.map(inv => inv.id);
    return res.json({"company": company});
});

router.post('/', async (req, res, next) => {
    const { code, name, description } = req.body;
    const result = await db.query(
        `INSERT INTO companies (code, name, description) 
         VALUES ($1, $2, $3) 
         RETURNING *`, [code, name, description]);
    return res.json({ "company": result.rows[0] });
});

router.put('/:code', async (req, res, next) => {
    const code = req.params.code;
    const { name, description } = req.body;
    const result = await db.query(
        `UPDATE companies 
         SET name = $1, description = $2 
         WHERE code = $3 
         RETURNING *`, [name, description, code]);
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