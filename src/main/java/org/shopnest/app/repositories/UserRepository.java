package org.shopnest.app.repositories;

import java.util.Optional;

import org.shopnest.app.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;



public interface UserRepository extends JpaRepository<User, Integer>{
	Optional<User> findByemail(String email);
	
	Optional<User> findByusername(String username);
}
