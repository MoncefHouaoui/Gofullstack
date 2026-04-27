const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

const multer = require('../middleware/multer-config');
const bookCtrl = require('../controllers/book');

router.get('/', bookCtrl.getAllThing);
router.get('/bestrating', bookCtrl.getBestRatedThings);
router.get('/:id', bookCtrl.getOneThing);

router.post('/', auth, multer, bookCtrl.createThing);
router.post('/:id/rating', auth, bookCtrl.rateThing);
router.put('/:id', auth, multer, bookCtrl.modifyThing);
router.delete('/:id', auth, bookCtrl.deleteThing);

module.exports = router;