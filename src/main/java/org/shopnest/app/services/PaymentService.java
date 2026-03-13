package org.shopnest.app.services;



import org.json.JSONObject;
import org.shopnest.app.entities.CartItem;
import org.shopnest.app.entities.Order;
import org.shopnest.app.entities.OrderItem;
import org.shopnest.app.entities.OrderStatus;
import org.shopnest.app.repositories.CartRepository;
import org.shopnest.app.repositories.OrderItemRepository;
import org.shopnest.app.repositories.OrderRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PaymentService {

    @Value("${razorpay.key_id}")
    private String razorpayKeyId;

    @Value("${razorpay.key_secret}")
    private String razorpayKeySecret;

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;

    public PaymentService(OrderRepository orderRepository,
                          OrderItemRepository orderItemRepository,
                          CartRepository cartRepository) {

        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartRepository = cartRepository;
    }

    /**
     * Create Razorpay Order
     */
    @Transactional
    public String createOrder(int userId,
                              BigDecimal totalAmount,
                              List<OrderItem> cartItems) throws RazorpayException {

        // Create Razorpay client
        RazorpayClient razorpayClient =
                new RazorpayClient(razorpayKeyId, razorpayKeySecret);

        // Prepare Razorpay order request
        JSONObject orderRequest = new JSONObject();

        // Amount must be in paise
        orderRequest.put(
                "amount",
                totalAmount.multiply(BigDecimal.valueOf(100)).intValue()
        );

        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "txn_" + System.currentTimeMillis());

        // Create Razorpay order
        com.razorpay.Order razorpayOrder =
                razorpayClient.orders.create(orderRequest);

        // Save order in database
        Order order = new Order();

        order.setOrderId(razorpayOrder.get("id"));
        order.setUserId(userId);
        order.setTotalAmount(totalAmount);
        order.setStatus(OrderStatus.PENDING);
        order.setCreatedAt(LocalDateTime.now());

        orderRepository.save(order);

        return razorpayOrder.get("id");
    }

    /**
     * Verify Razorpay Payment
     */
    @Transactional
    public boolean verifyPayment(String razorpayOrderId,
                                 String razorpayPaymentId,
                                 String razorpaySignature,
                                 int userId) {

        try {

            // Prepare attributes for signature verification
            JSONObject attributes = new JSONObject();

            attributes.put("razorpay_order_id", razorpayOrderId);
            attributes.put("razorpay_payment_id", razorpayPaymentId);
            attributes.put("razorpay_signature", razorpaySignature);

            // Verify Razorpay signature
            boolean isSignatureValid =
                    Utils.verifyPaymentSignature(attributes, razorpayKeySecret);

            if (isSignatureValid) {

                // Update order status
                Order order = orderRepository.findById(razorpayOrderId)
                        .orElseThrow(() ->
                                new RuntimeException("Order not found"));

                order.setStatus(OrderStatus.SUCCESS);
                order.setUpdatedAt(LocalDateTime.now());

                orderRepository.save(order);

                // Fetch cart items
                List<CartItem> cartItems =
                        cartRepository.findCartItemsWithProductDetails(userId);

                // Save order items
                for (CartItem cartItem : cartItems) {

                    OrderItem orderItem = new OrderItem();

                    orderItem.setOrder(order);

                    orderItem.setProductId(
                            cartItem.getProduct().getProductId()
                    );

                    orderItem.setQuantity(cartItem.getQuantity());

                    orderItem.setPricePerUnit(
                            cartItem.getProduct().getPrice()
                    );

                    orderItem.setTotalPrice(
                            cartItem.getProduct()
                                    .getPrice()
                                    .multiply(
                                            BigDecimal.valueOf(
                                                    cartItem.getQuantity()
                                            )
                                    )
                    );

                    orderItemRepository.save(orderItem);
                }

                // Clear cart
                cartRepository.deleteAllByUserId(userId);

                return true;

            } else {
                return false;
            }

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Save order items manually
     */
    @Transactional
    public void saveOrderItems(String orderId,
                               List<OrderItem> items) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        for (OrderItem item : items) {

            item.setOrder(order);

            orderItemRepository.save(item);
        }
    }
}