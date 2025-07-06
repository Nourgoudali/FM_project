const Stock = require('../models/Stock');
const mongoose = require('mongoose');

const stockController = {
  // Récupérer les catégories PDR uniques
  getPdrCategories: async (req, res) => {
    try {
      const categories = await Stock.distinct('pdrCategory');
      res.json(categories);
    } catch (err) {
      console.error("Erreur lors de la récupération des catégories PDR:", err);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },

  create: async (req, res) => {
    const { name, pdrCategory, prixUnitaire, stockActuel, stockMin, stockMax, stockSecurite, prixEuro, lieuStockage } = req.body;
    try {
      // La référence sera générée automatiquement par le hook pre-save
      const stock = new Stock({
        name,
        pdrCategory,
        prixUnitaire,
        stockActuel,
        stockMin,
        stockMax,
        stockSecurite,
        lieuStockage,
        prixEuro: prixEuro || 0
      });
      
      const savedStock = await stock.save();
      res.status(201).json(savedStock);
    } catch (err) {
      console.error("Erreur lors de l'ajout de l'article:", err);
      res.status(400).json({ message: err.message });
    }
  },

  getAll: async (req, res) => {
    try {
      const stocks = await Stock.find();
      res.json(stocks);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getById: async (req, res) => {
    const { id } = req.params;
    try {
      const stock = await Stock.findById(id);
      if (!stock) return res.status(404).json({ message: 'Stock not found' });
      res.json(stock);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  update: async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
      const stock = await Stock.findByIdAndUpdate(id, updates, { new: true });
      if (!stock) return res.status(404).json({ message: 'Stock not found' });
      res.json(stock);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  delete: async (req, res) => {
    const { id } = req.params;
    try {
      const stock = await Stock.findByIdAndDelete(id);
      if (!stock) return res.status(404).json({ message: 'Stock not found' });
      res.json({ message: 'Stock deleted' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  addMovement: async (req, res) => {
    const { id } = req.params;
    const { type, quantity, comment } = req.body;
    try {
      const stock = await Stock.findById(id);
      if (!stock) return res.status(404).json({ message: 'Stock not found' });
      
      // Mise à jour du stock actuel en fonction du type de mouvement
      if (type === 'entry') {
        stock.stockActuel += quantity;
      } else if (type === 'exit') {
        if (stock.stockActuel < quantity) {
          return res.status(400).json({ message: 'Stock insuffisant' });
        }
        stock.stockActuel -= quantity;
      }
      
      await stock.save();
      res.json(stock);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  getLowStock: async (req, res) => {
    try {
      // Trouver les articles dont le stock actuel est inférieur ou égal au stock minimum
      const lowStocks = await Stock.find({ $expr: { $lte: ["$stockActuel", "$stockMin"] } });
      res.json(lowStocks);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = stockController;