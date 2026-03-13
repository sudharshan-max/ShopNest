package org.shopnest.app.controllers;

import jakarta.servlet.http.HttpServletRequest;
import org.shopnest.app.entities.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class CheckoutViewController {

    // ✅ Inject Razorpay KEY ID (NOT secret — this is safe to send to frontend)
    @Value("${razorpay.key_id}")
    private String razorpayKeyId;

    @GetMapping("/checkout")
    public String checkoutPage(HttpServletRequest request, Model model) {

        User user = (User) request.getAttribute("authenticatedUser");

        if (user == null) {
            return "redirect:/api/users/login";
        }

        model.addAttribute("username", user.getUsername());

        // ✅ Pass KEY ID to frontend — Razorpay JS SDK needs this to open popup
        model.addAttribute("razorpayKeyId", razorpayKeyId);

        return "checkout";
    }
}