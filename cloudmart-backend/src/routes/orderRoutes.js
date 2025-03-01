// routes/orderRoutes.js
import express from 'express';
import {
  createOrderController,
  getAllOrdersController,
  getOrderByIdController,
  getOrdersByUserEmailController,
  updateOrderController,
  deleteOrderController
} from '../controllers/orderController.js';

const router = express.Router();

router.post('/', createOrderController);
router.get('/', getAllOrdersController);
router.get('/user', getOrdersByUserEmailController);
router.get('/:id', getOrderByIdController);
router.put('/:id', updateOrderController);
router.delete('/:id', deleteOrderController);

export default router;