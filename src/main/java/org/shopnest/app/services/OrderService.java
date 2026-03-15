package org.shopnest.app.services;



import org.shopnest.app.entities.OrderItem;
import org.shopnest.app.entities.Product;
import org.shopnest.app.entities.ProductImage;
import org.shopnest.app.entities.User;
import org.shopnest.app.repositories.OrderItemRepository;
import org.shopnest.app.repositories.ProductImageRepository;
import org.shopnest.app.repositories.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class OrderService {

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductImageRepository productImageRepository;

    /**
     * Fetches all successful orders for a user
     */
    public Map<String, Object> getOrdersForUser(User user) {

        // Fetch successful order items
        List<OrderItem> orderItems =
                orderItemRepository.findSuccessfulOrderItemsByUserId(user.getUserId());

        // Prepare response
        Map<String, Object> response = new HashMap<>();
        response.put("username", user.getUsername());
        response.put("role", user.getRole());

        List<Map<String, Object>> products = new ArrayList<>();

        for (OrderItem item : orderItems) {

            Product product =
                    productRepository.findById(item.getProductId()).orElse(null);

            if (product == null) {
                continue; // Skip if product not found
            }

            // Fetch product images
            List<ProductImage> images =
                    productImageRepository.findByProduct_ProductId(product.getProductId());

            String imageUrl =
                    images.isEmpty() ? null : images.get(0).getImageUrl();

            // Create product response
            Map<String, Object> productDetails = new HashMap<>();

            productDetails.put("order_id", item.getOrder().getOrderId());
            productDetails.put("quantity", item.getQuantity());
            productDetails.put("total_price", item.getTotalPrice());
            productDetails.put("image_url", imageUrl);
            productDetails.put("product_id", product.getProductId());
            productDetails.put("name", product.getName());
            productDetails.put("description", product.getDescription());
            productDetails.put("price_per_unit", item.getPricePerUnit());

            products.add(productDetails);
        }

        response.put("products", products);

        return response;
    }
}