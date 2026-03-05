package org.shopnest.app.repositories;

import java.util.Optional;

import org.shopnest.app.entities.UserOtp;
import org.springframework.data.jpa.repository.JpaRepository;



public interface UserOtpRepository extends JpaRepository<UserOtp, Integer>{
	
	Optional<UserOtp> findByotp(Integer otp);
}
