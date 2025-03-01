// controllers/productController.js
import { 
    getAllProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct 
  } from '../services/productService.js';
  
  export const getAllProductsController = async (req, res) => {
    try {
   
      const products = await getAllProducts();
      res.json(products);
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: 'Error fetching products' });
    }
  };
  
  export const getProductByIdController = async (req, res) => {
    try {
      const product = await getProductById(req.params.id);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      res.json(product);
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: 'Error fetching product' });
    }
  };
  
  export const createProductController = async (req, res) => {
    try {
      const newProduct = await createProduct(req.body);
      res.status(201).json(newProduct);
    } catch (error) {    
      console.log(error)
      res.status(500).json({ error: 'Error creating product' });
    }
  };
  
  export const updateProductController = async (req, res) => {
    try {
      const updatedProduct = await updateProduct(req.params.id, req.body);
      res.json(updatedProduct);
    } catch (error) {
      res.status(500).json({ error: 'Error updating product' });
    }
  };
  
  export const deleteProductController = async (req, res) => {
    try {
      await deleteProduct(req.params.id);
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error deleting product' });
    }
  };