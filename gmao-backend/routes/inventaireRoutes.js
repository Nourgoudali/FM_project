const express = require('express');
const router = express.Router();
const inventaireController = require('../controllers/inventaireController');
const {verifyToken} = require('../middleware/authMiddleware');

router.use(verifyToken);
router.get('/', inventaireController.getAllInventaires);
router.get('/ecarts', inventaireController.getInventairesAvecEcart);
router.get('/raisons-ecart', inventaireController.getRaisonsEcart);
router.get('/traitements-pour-inventaire', inventaireController.getTraitementsPourInventaire);
router.get('/:id', inventaireController.getInventaireById);

router.post('/', inventaireController.createInventaire);
router.put('/:id', inventaireController.updateInventaire);
router.delete('/:id', inventaireController.deleteInventaire);

module.exports = router;
