package org.shopnest.app.controllers;

import org.shopnest.app.dtos.LoginRequest;
import org.shopnest.app.entities.User;
import org.shopnest.app.services.AuthService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;


import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;



@Controller
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public String login(@ModelAttribute LoginRequest loginRequest,
                                   HttpServletResponse response, RedirectAttributes redirectAttributes, Model model) {

        try {
            User user = authService.authenticate(
                    loginRequest.getUsername(),
                    loginRequest.getPassword()
            );

            String token = authService.generateToken(user);

            Cookie cookie = new Cookie("authToken", token);
            cookie.setHttpOnly(true);
            cookie.setSecure(false); // Set to true if using HTTPS
            cookie.setPath("/");
            cookie.setMaxAge(3600); // 1 hour
            cookie.setDomain("localhost");

            response.addCookie(cookie);

            // Optional but useful for SameSite=None
            response.addHeader("Set-Cookie",
                    String.format("authToken=%s; HttpOnly; Path=/; Max-Age=3600; SameSite=None", token));
            redirectAttributes.addFlashAttribute("success", "Logged in successfully! Welcome back.");
            return "redirect:/api/auth/home";

        } catch (RuntimeException e) {
        	model.addAttribute("error", e.getMessage());
        	return "login"; 
        }
    }
    
    @GetMapping("/home")
    public String home() {
    	return "homepage";
    }
    
}