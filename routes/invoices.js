const express = require("express");
const ExpressError = require("../expressError");
const db = require("../db");
const router = new express.Router();

router.get('/', async (req, res, next) => {
    try {
        const result = await db.query(
            `SELECT id, comp_code 
             FROM invoices`);
        return res.json({ "invoices": result.rows });
    }
    catch (err) {
        return next(err);
    }
});

router.get('/:id', async (req, res, next) => {
    const id = req.params.id;
    const result = await db.query(
        `SELECT invoices.id,
                invoices.comp_code, 
                invoices.amt, 
                invoices.paid, 
                invoices.add_date, 
                invoices.paid_date, 
                companies.name, 
                companies.description  
         FROM invoices
         INNER JOIN COMPANIES ON (invoices.comp_code = companies.code) 
         WHERE id = $1`, [id]);
    if (result.rows.length === 0) {
        throw new ExpressError('Invoice not found', 404)
    }
    const data = result.rows[0];
    const invoice = {
        id: data.id,
        amt: data.amt,
        paid: data.paid,
        add_date: data.add_date,
        paid_date: data.paid_date,
        company: {
            code: data.comp_code,
            name: data.name,
            description: data.description,
        },
    };
    return res.json({ "invoice": invoice });
});

router.post('/', async (req, res, next) => {
    const { comp_code, amt } = req.body;
    const result = await db.query(
        `INSERT INTO invoices (comp_code, amt) 
         VALUES ($1, $2) 
         RETURNING *`, [comp_code, amt]);
    return res.json({ "invoice": result.rows[0] });
});

router.put('/:id', async (req, res, next) => {
    const id = req.params.id;
    const { amt } = req.body;
    const result = await db.query(
        `UPDATE invoices
         SET amt = $1
         WHERE id = $2 
         RETURNING *`, [amt, id]);
    if (result.rows.length === 0) {
        throw new ExpressError('Company not found', 404)
    }
    return res.json({ "invoice": result.rows[0] });
});

router.delete('/:id', async (req, res, next) => {
    const id = req.params.id;
    const result = await db.query(
        `DELETE FROM invoices 
        WHERE id = $1`, [id]);
    if (result === 0) {
        throw new ExpressError('Company not found', 404)
    }
    else {
        return res.json({ 'status': 'deleted' });
    }
});

module.exports = router;