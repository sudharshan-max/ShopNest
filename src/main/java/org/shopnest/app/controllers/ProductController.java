package org.shopnest.app.controllers;



import org.shopnest.app.entities.Category;
import org.shopnest.app.entities.Product;
import org.shopnest.app.entities.User;
import org.shopnest.app.services.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;
    
    @GetMapping("/home")
    public String home(HttpServletRequest request, Model model) {

        User authenticatedUser = (User) request.getAttribute("authenticatedUser");
        if (authenticatedUser != null) {
            model.addAttribute("username", authenticatedUser.getUsername());
        }

        List<Category> categories = productService.getCategories();
        model.addAttribute("categories", categories);

        return "homepage";
    }

    @GetMapping
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getProducts(
            @RequestParam(required = false) String category,
            HttpServletRequest request) {

        try {

            // Retrieve authenticated user from the request attribute set by the filter
            User authenticatedUser = (User) request.getAttribute("authenticatedUser");

            if (authenticatedUser == null) {
                return ResponseEntity.status(401)
                        .body(Map.of("error", "Unauthorized access"));
            }

            // Fetch products based on category filter
            List<Product> products = productService.getProductsByCategory(category);

            // Build response
            Map<String, Object> response = new HashMap<>();

            // Add user info
            Map<String, String> userInfo = new HashMap<>();
            userInfo.put("name", authenticatedUser.getUsername());
            userInfo.put("role", authenticatedUser.getRole().name());

            response.put("user", userInfo);

            // Add product details
            List<Map<String, Object>> productList = new ArrayList<>();

            for (Product product : products) {

                Map<String, Object> productDetails = new HashMap<>();

                productDetails.put("product_id", product.getProductId());
                productDetails.put("name", product.getName());
                productDetails.put("description", product.getDescription());
                productDetails.put("price", product.getPrice());
                productDetails.put("stock", product.getStock());

                // Fetch product images
                List<String> images =
                        productService.getProductImages(product.getProductId());

                productDetails.put("images", images);

                productList.add(productDetails);
            }

            response.put("products", productList);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {

            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
    
}