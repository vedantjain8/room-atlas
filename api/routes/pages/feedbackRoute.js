const express = require("express");
const pool = require("../../config/db");
const { authenticateToken } = require("../../middleware/jwtMiddleware");

const router = express.Router();

// pages/api/feedback.js
import pool from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
      const query = 'INSERT INTO feedback(name, email, message) VALUES($1, $2, $3) RETURNING *';
      const values = [name, email, message];
      const result = await pool.query(query, values);
      res.status(200).json({ success: true, feedback: result.rows[0] });
    } catch (error) {
      console.error('Error saving feedback:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
