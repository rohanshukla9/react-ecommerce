import React, { useState, useEffect} from 'react'
import { Link } from 'react-router-dom'
import { Button, Row, Col, ListGroup, Image, Card } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import Message from '../components/Message'
import Loader from '../components/Loader'
//import axios from 'axios'
import { getOrderDetails, payOrder } from '../actions/orderActions'
import CryptoJS from 'crypto-js'
import { ORDER_PAY_RESET, ORDER_PAY_FAIL } from '../constants/orderConstants'



const OrderScreen = ({ match }) => {

  const orderId = match.params.id

  //const [scriptReady, setScriptReady] = useState(false)

  const dispatch = useDispatch();


  const orderDetails = useSelector(state => state.orderDetails)
  const { order, loading, error } = orderDetails

  const orderPay = useSelector(state => state.orderPay)
  const { loading:loadingPay, success:successPay } = orderPay

  if(!loading){
    const addDecimals = (num) => {
      return (Math.round(num * 100) / 100).toFixed(2)
    }
    //calculate prices
    order.itemsPrice = addDecimals(order.orderItems.reduce((acc, item) => acc + item.price * item.qty, 0))

    
  }

  useEffect(() => {

    //dispatch(getOrderDetails(orderId))

    if(!order || successPay){
      dispatch({ type: ORDER_PAY_RESET })
      dispatch(getOrderDetails(orderId))
    }
    //dispatch(getOrderDetails(orderId))
  }, [dispatch, orderId, order, successPay])

  const openRazorWindow = () => {
    let options = {
      "key": "rzp_test_B2ql0wBYO5J9tH", 
      "amount": order.totalPrice * 100, 
      "currency": "INR",
      "name": "Bharuch Kirana",
      "description": "Test Transaction",
      "image": "ssss",
      "order_id": order.razorpay_order, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
      "handler": function (response){
         // alert(response.razorpay_payment_id);
          //alert(response.razorpay_order_id);
          //alert(response.razorpay_signature)
          let generatedSignature = response.razorpay_signature

          let dbSignature = CryptoJS.HmacSHA256(order.razorpay_order + "|" + response.razorpay_payment_id, "WFm47pKBtO8Ccg6B3Rul2jxU")

          const paymentResult = {
            razorpay_order_id:response.razorpay_order_id, 
            razorpay_payment_id:response.razorpay_payment_id, 
            razorpay_signature:response.razorpay_signature
            
          }

          if(generatedSignature == dbSignature){
            updateOrderToDb(paymentResult)
            //successPay === true
          }
      },
      "prefill": {
          "name": order.user.name,
          "email": order.user.email,
          "contact": order.user.phone_number
      },
      "notes": {
          "address": "Bharuch Corporate Office"
      },
      "theme": {
          "color": "#3399cc"
      }
    }

    let razor1 = new window.Razorpay(options);
    razor1.on('payment.failed', function (response){
      // alert(response.error.code);
      // alert(response.error.description);
      // alert(response.error.source);
      // alert(response.error.step);
      // alert(response.error.reason);
      // alert(response.error.metadata.order_id);
      // alert(response.error.metadata.payment_id);
      dispatch({ type: ORDER_PAY_FAIL })
      });
     
    razor1.open();
  }

  const updateOrderToDb = (paymentResult) => {
    dispatch(payOrder(
      orderId,
      paymentResult
    ));
    dispatch({ type: ORDER_PAY_RESET })
   // dispatch(getOrderDetails(orderId))
  }




return loading ? (<Loader />) : error ? (<Message variant='danger'>{error}</Message>) : (<> 
<h1> Order { order._id }</h1>
<Row>
      <Col md={8}>
        <ListGroup variant='flush'>
          <ListGroup.Item>
            <h2>Shipping</h2>
            <p>
            <strong>Name: </strong> {order.user.name} 
            </p>
            <p>
            <strong>Phone Number: </strong> {order.user.phone_number} </p>
            <p>
            <strong>Email: </strong> {order.user.email}
            </p>  

            <p>
              <strong> Address: </strong>
              {order.shippingAddress.address}, {order.shippingAddress.city} 
              {order.shippingAddress.postalcode}, { '' } {order.shippingAddress.country}
            </p>

            {order.isDelivered ? <Message variant='success'>Delivered on {order.deliveredAt} </Message> : 
            <Message variant='danger'>Not Delivered</Message>}
          </ListGroup.Item>

          <ListGroup.Item>
            <h2>Payment Method</h2>
            <p>
            <strong>Method: </strong>
            {order.paymentMethod}
            </p>



            {order.isPaid ? <Message variant='success'>Paid on {order.paidAt}</Message> : 
            <Message variant='danger'>Not Paid</Message>}
          </ListGroup.Item>

          <ListGroup.Item>
            <h2>Order Items</h2>
            {order.orderItems.length === 0 ? <Message>
              Your Order is empty!
            </Message> : (
              <ListGroup variant='flush'>
                {order.orderItems.map((item, index) => (
                  <ListGroup.Item key={index}>
                    <Row>
                      <Col md={1}>
                        <Image src={item.image} alt={item.name} fluid rounded />
                      </Col>

                      <Col>
                      <Link to={`/product/${item.product}`}>
                        {item.name}
                      </Link>
                      </Col>

                      <Col md={4}>
                        {item.qty} x ₹{item.price} = { (item.qty * item.price).toFixed()}
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </ListGroup.Item>


        </ListGroup>
      </Col>

      <Col md={4}>
        <Card>
          <ListGroup variant='flush'>
            <ListGroup.Item>
              <h2>Order Summary</h2>
            </ListGroup.Item>

            <ListGroup.Item>
              <Row>
                <Col>Items</Col>
                <Col>₹{order.itemsPrice}</Col>
              </Row>
            </ListGroup.Item>

            
            <ListGroup.Item>
              <Row>
                <Col>Shipping</Col>
                <Col>₹{order.shippingPrice}</Col>
              </Row>
            </ListGroup.Item>

            <ListGroup.Item>
              <Row>
                <Col>Total</Col>
                <Col>₹{order.totalPrice}</Col>
              </Row>
            </ListGroup.Item>
            {!order.isPaid ? (
              <ListGroup.Item>
              <Button type='button' variant='primary' id='rzp-button1' onClick={openRazorWindow}>Pay with Razorpay</Button>
           
              </ListGroup.Item>

            ) : <ListGroup.Item>
              <Button type='button' variant='flush' disabled>Paid</Button>
              </ListGroup.Item>}

            
          </ListGroup>
        </Card>
      </Col>
    </Row>
      
</>)
}

export default OrderScreen
