package org.shopnest.app.repositories;

import java.util.List;

import org.shopnest.app.entities.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;



@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {

    List<Product> findByCategory_CategoryId(Integer categoryId);
    
    @Query("SELECT p.category.categoryName FROM Product  p WHERE p.productId  = :productId")
    String findCategoryNameByProductId(int productId);
}