import express from 'express';
const router = express.Router();
import { addOrderItems, getOrderById, updateOrderToPaid, getAuthUserOrders } from '../controllers/orderController.js'
import { protect } from '../middleware/auth.js'


router.route('/').post(protect, addOrderItems)
router.route('/myorders').get(protect, getAuthUserOrders)
router.route('/:id').get(protect, getOrderById)
router.route('/:id/pay').put(protect, updateOrderToPaid)


//router.route('/:id').get(getProductById)


export default router;