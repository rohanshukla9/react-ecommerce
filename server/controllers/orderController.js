import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';


//@desc Create new order
//@route POST /api/orders
//@access Private

const addOrderItems = asyncHandler(async(req, res) => {

  const { orderItems, shippingAddress, paymentMethod, itemsPrice, shippingPrice, totalPrice } = req.body;

  if(orderItems && orderItems.length === 0) {
    res.status(400)

    throw new Error('No order items')
    return
  } else {
    const order = new Order({
      orderItems, 
      user: req.user._id,
      shippingAddress, 
      paymentMethod, 
      itemsPrice, 
      shippingPrice, 
      totalPrice
    })

    const createdOrder = await order.save()

    if(createdOrder)
    {
      res.status(201).json(createdOrder) 
    } else {
      throw new Error('I give up')
    }

  }
})

//@desc Get ORder by Id
//@route Get /api/orders/:id
//@access Private

const getOrderById = asyncHandler(async(req, res) => {

  const order = await Order.findById(req.params.id).populate('user', 'name email phone_number')

  if(order) {
    res.json(order)
  } else {
    res.status(404);
    throw new Error('Order not found!')
  }
})

//@desc Update order to paid
//@route Get /api/orders/:id/pay
//@access Private

const updateOrderToPaid = asyncHandler(async(req, res) => {

  const order = await Order.findById(req.params.id)

  if(order) {
    order.isPaid = true
    order.paidAt = Date.now()

    order.paymentResult = {
      razorpay_payment_id: req.body.razorpay_payment_id,
      razorpay_order_id: req.body.razorpay_order_id,
      razorpay_signature: req.body.razorpay_signature,
    }
    
    //order.transactionamount = req.body.amount

    const updatedOrder = await order.save()
  } else {
    res.status(404);
    throw new Error('Order not found!')
  }
})


export {
  addOrderItems,
  getOrderById,
  updateOrderToPaid
}