package org.shopnest.app.services;



import org.shopnest.app.entities.Role;
import org.shopnest.app.entities.User;
import org.shopnest.app.repositories.JWTTokenRepository;
import org.shopnest.app.repositories.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AdminUserService {
	
	private final UserRepository userRepository;
	private final JWTTokenRepository jwtTokenRepository;
	
	public AdminUserService(UserRepository userRepository,
	                        JWTTokenRepository jwtTokenRepository) {
	    this.userRepository = userRepository;
	    this.jwtTokenRepository = jwtTokenRepository;
	}
	
	@Transactional
	public User modifyUser(Integer userId,
	                       String username,
	                       String email,
	                       String role) {
	
	    // Check if user exists
	    Optional<User> userOptional = userRepository.findById(userId);
	
	    if (userOptional.isEmpty()) {
	        throw new IllegalArgumentException("User not found");
	    }
	
	    User existingUser = userOptional.get();
	
	    // Update username
	    if (username != null && !username.isEmpty()) {
	        existingUser.setUsername(username);
	    }
	
	    // Update email
	    if (email != null && !email.isEmpty()) {
	        existingUser.setEmail(email);
	    }
	
	    // Update role
	    if (role != null && !role.isEmpty()) {
	        try {
	            existingUser.setRole(Role.valueOf(role));
	        } catch (IllegalArgumentException e) {
	            throw new IllegalArgumentException("Invalid role: " + role);
	        }
	    }
	
	    // Delete existing JWT tokens (force re-login after role change)
	    jwtTokenRepository.deleteByUserId(userId);
	
	    // Save updated user
	    return userRepository.save(existingUser);
	}
	
	public User getUserById(Integer userId) {
	
	    return userRepository.findById(userId)
	            .orElseThrow(() -> new IllegalArgumentException("User not found"));
	}

}
