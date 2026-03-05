package Com.ShopNest.App.Repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import Com.ShopNest.App.Entities.User;

public interface UserRepository extends JpaRepository<User, Integer>{
	Optional<User> findByemail(String email);
	
	Optional<User> findByusername(String username);
}
