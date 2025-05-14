const express = require('express');
const router = express.Router();
// Normalement on importerait un contrôleur, mais pour l'instant on va simuler des fonctions
// const interventionController = require('../controllers/interventionController');

// GET all interventions
router.get('/', (req, res) => {
  res.json({ message: 'GET all interventions endpoint' });
});

// GET intervention by ID
router.get('/:id', (req, res) => {
  res.json({ message: `GET intervention with ID: ${req.params.id}` });
});

// POST create new intervention
router.post('/', (req, res) => {
  res.status(201).json({ message: 'Intervention created successfully', data: req.body });
});

// PUT update intervention
router.put('/:id', (req, res) => {
  res.json({ message: `UPDATE intervention with ID: ${req.params.id}`, data: req.body });
});

// DELETE intervention
router.delete('/:id', (req, res) => {
  res.json({ message: `DELETE intervention with ID: ${req.params.id}` });
});

module.exports = router;
