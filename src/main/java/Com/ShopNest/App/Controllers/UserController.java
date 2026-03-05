package Com.ShopNest.App.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import Com.ShopNest.App.Entities.Role;
import Com.ShopNest.App.Entities.User;
import Com.ShopNest.App.Services.UserServices;


@Controller
@RequestMapping("/api/users")
public class UserController {

    private final UserServices userServices;

    @Autowired
    public UserController(UserServices userServices) {
        this.userServices = userServices;
    }
    
    
    @GetMapping("/register") 
    public String showregistrationPage() {
    	return "register";
    }
    

    @PostMapping("/user-registration")
    public String registerUser(@ModelAttribute User user,Model model, RedirectAttributes redirectAttributes) {
    	user.setRole(Role.CUSTOMER);
        try {
            User registeredUser = userServices.registerUser(user);
            redirectAttributes.addFlashAttribute("success", "Account created successfully! Please log in.");
            return "redirect:/api/users/login";
            
        } catch (RuntimeException e) {
        	
        	 model.addAttribute("error", e.getMessage());
             model.addAttribute("filledUsername", user.getUsername());
             model.addAttribute("filledEmail", user.getEmail());
             return "register";
            
        }
    }

    @GetMapping("/login")
    public String showLoginPage(Model model)
    {
        return "login";
    }
}