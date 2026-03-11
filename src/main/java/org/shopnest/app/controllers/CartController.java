

package org.shopnest.app.controllers;


import jakarta.servlet.http.HttpServletRequest;

import org.shopnest.app.entities.User;
import org.shopnest.app.services.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Controller
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;
    
    @GetMapping
    public String cartPage(HttpServletRequest request, Model model) {

        // Get authenticated user set by AuthenticationFilter
        User user = (User) request.getAttribute("authenticatedUser");
        if (user != null) {
            model.addAttribute("username", user.getUsername());
        }


        return "cart"; 
    }

 
    // Fetch all cart items for the user (based on username)
    @GetMapping("/items")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getCartItems(HttpServletRequest request) {

        // Fetch user by username to get the userId
        User user = (User) request.getAttribute("authenticatedUser");

        // Call the service to get cart items for the user
        Map<String, Object> cartItems = cartService.getCartItems(user.getUserId());

        return ResponseEntity.ok(cartItems);
    }
    
    @PostMapping("/add")
    @ResponseBody
	public ResponseEntity<Void> addToCart(@RequestBody Map<String, Object> requestBody, HttpServletRequest request) {

	    String username = (String) requestBody.get("username");
	    int productId = (int) requestBody.get("productId");

	    // Handle quantity: Default to 1 if not provided
	    int quantity = requestBody.containsKey("quantity") ? (int) requestBody.get("quantity") : 1;

	    
	    User user = (User) request.getAttribute("authenticatedUser");

	    // Add the product to the cart
	    cartService.addToCart(user.getUserId(), productId, quantity);

	    return ResponseEntity.status(HttpStatus.CREATED).build();
	}
    
    @PutMapping("/update")
    @ResponseBody
    public ResponseEntity<Void> updateCartItemQuantity(@RequestBody Map<String, Object> requestBody, HttpServletRequest request) {

        String username = (String) requestBody.get("username");
        int productId = (int) requestBody.get("productId");
        int quantity = (int) requestBody.get("quantity");

        // Fetch the user using username
        User user = (User) request.getAttribute("authenticatedUser");

        // Update the cart item quantity
        cartService.updateCartItemQuantity(user.getUserId(), productId, quantity);

        return ResponseEntity.status(HttpStatus.OK).build();
    }
    
    @DeleteMapping("/delete")
    @ResponseBody
    public ResponseEntity<Void> deleteCartItem(@RequestBody Map<String, Object> requestBody, HttpServletRequest request) {

        String username = (String) requestBody.get("username");
        int productId = (int) requestBody.get("productId");

        // Fetch the user using username
        User user = (User) request.getAttribute("authenticatedUser");

        // Delete the cart item
        cartService.deleteCartItem(user.getUserId(), productId);

        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
