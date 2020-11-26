import express from 'express';
const router = express.Router();
import { addOrderItems, getOrderById, updateOrderToPaid, getAuthUserOrders, getAllOrders, updateOrderToDelivered } from '../controllers/orderController.js'
import { admin, protect } from '../middleware/auth.js'


router.route('/').post(protect, addOrderItems).get(protect, admin, getAllOrders)
router.route('/myorders').get(protect, getAuthUserOrders)
router.route('/:id').get(protect, getOrderById)
router.route('/:id/pay').put(protect, updateOrderToPaid)
router.route('/:id/deliver').put(protect, admin,updateOrderToDelivered)


//router.route('/:id').get(getProductById)


export default router;