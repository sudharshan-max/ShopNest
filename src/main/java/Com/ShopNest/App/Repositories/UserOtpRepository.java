package Com.ShopNest.App.Repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import Com.ShopNest.App.Entities.UserOtp;

public interface UserOtpRepository extends JpaRepository<UserOtp, Integer>{
	
	Optional<UserOtp> findByotp(Integer otp);
}
