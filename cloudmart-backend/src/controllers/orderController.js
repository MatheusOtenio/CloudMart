// controllers/orderController.js
import { 
    createOrder, 
    getAllOrders, 
    getOrderById, 
    getOrdersByUserEmail, 
    updateOrder, 
    deleteOrder 
  } from '../services/orderService.js';
  
  export const createOrderController = async (req, res) => {
    try {
      const newOrder = await createOrder(req.body);
      res.status(201).json(newOrder);
    } catch (error) {
      res.status(500).json({ error: 'Error creating order' });
    }
  };
  
  export const getAllOrdersController = async (req, res) => {
    try {
      const orders = await getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching orders' });
    }
  };
  
  export const getOrderByIdController = async (req, res) => {
    try {
      const order = await getOrderById(req.params.id);
      if (!order) return res.status(404).json({ error: 'Order not found' });
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching order' });
    }
  };
  
  export const getOrdersByUserEmailController = async (req, res) => {
    try {
      const { email } = req.query;
      if (!email) {
        return res.status(400).json({ error: 'Email query parameter is required' });
      }
      const orders = await getOrdersByUserEmail(email);
      res.json(orders);
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: 'Error fetching orders by user email' });
    }
  };
  
  export const updateOrderController = async (req, res) => {
    try {
      const updatedOrder = await updateOrder(req.params.id, req.body);
      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({ error: 'Error updating order' });
    }
  };
  
  export const deleteOrderController = async (req, res) => {
    try {
      await deleteOrder(req.params.id);
      res.json({ message: 'Order deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error deleting order' });
    }
  };
