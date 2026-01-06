import { Router } from 'express';
import { itemsController } from '../controllers/itemsController';
import { itemsStorage } from '../storage/itemsStorage';

const router = Router();

router.get('/items', (req, res) => {
  return itemsController.getItems(req, res);
});

router.get('/items/selected', (req, res) => {
  return itemsController.getSelectedItems(req, res);
});

router.post('/items', (req, res) => {
  itemsController.addItem(req, res);
});

router.put('/items/selected', (req, res) => {
  itemsController.updateSelected(req, res);
});

router.get('/state', (req, res) => {
  itemsController.getState(req, res);
});

router.get('/test', (req, res) => {
  res.json({ message: 'API работает', timestamp: new Date().toISOString() });
});


export default router;

