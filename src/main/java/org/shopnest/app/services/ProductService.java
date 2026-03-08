package org.shopnest.app.services;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.shopnest.app.entities.Category;
import org.shopnest.app.entities.Product;
import org.shopnest.app.entities.ProductImage;
import org.shopnest.app.repositories.CategoryRepository;
import org.shopnest.app.repositories.ProductImageRepository;
import org.shopnest.app.repositories.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductImageRepository productImageRepository;

    @Autowired
    private CategoryRepository categoryRepository;
    
    public ProductService() {
    	
    }

    public List<Product> getProductsByCategory(String categoryName) {

        if (categoryName != null && !categoryName.isEmpty()) {

            Optional<Category> categoryOpt = categoryRepository.findByCategoryName(categoryName);

            if (categoryOpt.isPresent()) {

                Category category = categoryOpt.get();
                return productRepository.findByCategory_CategoryId(category.getCategoryId());

            } else {
                throw new RuntimeException("Category not found");
            }

        } else {
            return productRepository.findAll();
        }
    }

    public List<String> getProductImages(Integer productId) {

        List<ProductImage> productImages =
                productImageRepository.findByProduct_ProductId(productId);

        List<String> imageUrls = new ArrayList<>();

        for (ProductImage image : productImages) {
            imageUrls.add(image.getImageUrl());
        }

        return imageUrls;
    }
    
    public List<Category> getCategories() {
        return categoryRepository.findAll();
    }
}