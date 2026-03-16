package org.shopnest.app.services;



import org.shopnest.app.entities.Category;
import org.shopnest.app.entities.Product;
import org.shopnest.app.entities.ProductImage;
import org.shopnest.app.repositories.CategoryRepository;
import org.shopnest.app.repositories.ProductImageRepository;
import org.shopnest.app.repositories.ProductRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AdminProductService {
	
	private final ProductRepository productRepository;
	private final ProductImageRepository productImageRepository;
	private final CategoryRepository categoryRepository;
	
	public AdminProductService(ProductRepository productRepository,
	                           ProductImageRepository productImageRepository,
	                           CategoryRepository categoryRepository) {
	
	    this.productRepository = productRepository;
	    this.productImageRepository = productImageRepository;
	    this.categoryRepository = categoryRepository;
	}
	
	public Product addProductWithImage(String name,
	                                   String description,
	                                   Double price,
	                                   Integer stock,
	                                   Integer categoryId,
	                                   String imageUrl) {
	
	    // Validate category
	    Optional<Category> category = categoryRepository.findById(categoryId);
	    if (category.isEmpty()) {
	        throw new IllegalArgumentException("Invalid category ID");
	    }
	
	    // Create product
	    Product product = new Product();
	    product.setName(name);
	    product.setDescription(description);
	    product.setPrice(BigDecimal.valueOf(price));
	    product.setStock(stock);
	    product.setCategory(category.get());
	    product.setCreatedAt(LocalDateTime.now());
	    product.setUpdatedAt(LocalDateTime.now());
	
	    Product savedProduct = productRepository.save(product);
	
	    // Create product image
	    if (imageUrl != null && !imageUrl.isEmpty()) {
	
	        ProductImage productImage = new ProductImage();
	        productImage.setProduct(savedProduct);
	        productImage.setImageUrl(imageUrl);
	
	        productImageRepository.save(productImage);
	
	    } else {
	        throw new IllegalArgumentException("Product image URL cannot be empty");
	    }
	
	    return savedProduct;
	}
	
	
	public void deleteProduct(Integer productId) {
	
	    // Check if product exists
	    if (!productRepository.existsById(productId)) {
	        throw new IllegalArgumentException("Product not found");
	    }
	
	    // Delete product images
	    productImageRepository.deleteByProductId(productId);
	
	    // Delete product
	    productRepository.deleteById(productId);
	}


}
