package org.shopnest.app.controllers;

import jakarta.servlet.http.HttpServletRequest;
import org.shopnest.app.entities.Role;
import org.shopnest.app.entities.User;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/api/admin")
public class AdminViewController {

    private boolean isAdmin(User user) {
        return user != null && user.getRole() == Role.ADMIN;
    }

    @GetMapping("/dashboard")
    public String dashboard(HttpServletRequest request, Model model) {
        User user = (User) request.getAttribute("authenticatedUser");
        if (!isAdmin(user)) return "redirect:/api/auth/login";
        model.addAttribute("username", user.getUsername());
        return "admin-dashboard";
    }

    @GetMapping("/products")
    public String products(HttpServletRequest request, Model model) {
        User user = (User) request.getAttribute("authenticatedUser");
        if (!isAdmin(user)) return "redirect:/api/auth/login";
        model.addAttribute("username", user.getUsername());
        return "admin-products";
    }

    @GetMapping("/users")
    public String users(HttpServletRequest request, Model model) {
        User user = (User) request.getAttribute("authenticatedUser");
        if (!isAdmin(user)) return "redirect:/api/auth/login";
        model.addAttribute("username", user.getUsername());
        return "admin-users";
    }

    @GetMapping("/analytics")
    public String analytics(HttpServletRequest request, Model model) {
        User user = (User) request.getAttribute("authenticatedUser");
        if (!isAdmin(user)) return "redirect:/api/auth/login";
        model.addAttribute("username", user.getUsername());
        return "admin-analytics";
    }
}
