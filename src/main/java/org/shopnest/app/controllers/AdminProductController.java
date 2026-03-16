package org.shopnest.app.controllers;


import org.shopnest.app.entities.Product;
import org.shopnest.app.services.AdminProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/admin/products")
public class AdminProductController {
	
	private final AdminProductService adminProductService;
	
	public AdminProductController(AdminProductService adminProductService) {
	    this.adminProductService = adminProductService;
	}
	
	// Add product
	@PostMapping("/add")
	public ResponseEntity<?> addProduct(@RequestBody Map<String, Object> productRequest) {
	
	    try {
	
	        String name = (String) productRequest.get("name");
	        String description = (String) productRequest.get("description");
	        Double price = Double.valueOf(String.valueOf(productRequest.get("price")));
	        Integer stock = (Integer) productRequest.get("stock");
	        Integer categoryId = (Integer) productRequest.get("categoryId");
	        String imageUrl = (String) productRequest.get("imageUrl");
	
	        Product addedProduct = adminProductService.addProductWithImage(
	                name,
	                description,
	                price,
	                stock,
	                categoryId,
	                imageUrl
	        );
	
	        return ResponseEntity
	                .status(HttpStatus.CREATED)
	                .body(addedProduct);
	
	    } catch (IllegalArgumentException e) {
	
	        return ResponseEntity
	                .status(HttpStatus.BAD_REQUEST)
	                .body(e.getMessage());
	
	    } catch (Exception e) {
	
	        return ResponseEntity
	                .status(HttpStatus.INTERNAL_SERVER_ERROR)
	                .body("Something went wrong");
	    }
	}
	
	
	// Delete product
	@DeleteMapping("/delete/{productId}")
	public ResponseEntity<?> deleteProduct(@PathVariable Integer productId) {
	    try {
	        adminProductService.deleteProduct(productId);
	        return ResponseEntity.status(HttpStatus.OK).body("Product deleted successfully");
	    } catch (IllegalArgumentException e) {
	        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
	    } catch (Exception e) {
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Something went wrong");
	    }
	}	
}
