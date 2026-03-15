package org.shopnest.app.controllers;



import jakarta.servlet.http.HttpServletRequest;

import org.shopnest.app.entities.User;
import org.shopnest.app.services.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Controller
@RequestMapping("/api")
public class OrderController {

	@Autowired
	private OrderService orderService;
	
	/**
	 * Fetch all successful orders for the authenticated user
	 */
	@GetMapping("/orders")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> getOrdersForUser(HttpServletRequest request) {
	
	    try {
	
	        // Get authenticated user from filter
	        User authenticatedUser = (User) request.getAttribute("authenticatedUser");
	
	        // If user not authenticated
	        if (authenticatedUser == null) {
	            return ResponseEntity
	                    .status(401)
	                    .body(Map.of("error", "User not authenticated"));
	        }
	
	        // Fetch orders using service
	        Map<String, Object> response =
	                orderService.getOrdersForUser(authenticatedUser);
	
	        return ResponseEntity.ok(response);
	
	    } catch (IllegalArgumentException e) {
	
	        return ResponseEntity
	                .status(400)
	                .body(Map.of("error", e.getMessage()));
	
	    } catch (Exception e) {
	
	        e.printStackTrace();
	
	        return ResponseEntity
	                .status(500)
	                .body(Map.of("error", "An unexpected error occurred"));
	    }
	}
	
	@GetMapping("/view-orders")
    public String ordersPage(HttpServletRequest request, Model model) {
        User user = (User) request.getAttribute("authenticatedUser");
        if (user == null) return "redirect:/api/users/login";
        model.addAttribute("username", user.getUsername());
        return "orders";
    }

}
