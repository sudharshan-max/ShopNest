package org.shopnest.app.controllers;

import jakarta.servlet.http.HttpServletRequest;
import org.shopnest.app.entities.User;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/api/users")
public class ProfileController {

    @GetMapping("/profile")
    public String profilePage(HttpServletRequest request, Model model) {

        User user = (User) request.getAttribute("authenticatedUser");
        if (user == null) return "redirect:/api/auth/login";

        model.addAttribute("username", user.getUsername());
        model.addAttribute("email",    user.getEmail());
        model.addAttribute("role",     user.getRole().name()); // "CUSTOMER" or "ADMIN"

        return "profile";
    }
}