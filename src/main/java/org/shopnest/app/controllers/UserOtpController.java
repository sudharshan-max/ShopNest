package org.shopnest.app.controllers;

import org.shopnest.app.dtos.UserOtpReq;
import org.shopnest.app.dtos.UserPasswordChangeReq;
import org.shopnest.app.entities.User;
import org.shopnest.app.services.UserOtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;



import jakarta.servlet.http.HttpSession;

@Controller
@RequestMapping("/api/password-reset")
public class UserOtpController {

    @Autowired
    private UserOtpService userOtpServ;


    @GetMapping
    public String showEmailPage() {
        return "email-verification";
    }
    
    @GetMapping("/otp")
    public String showOtpPage() {
        return "otp";
    }


    @PostMapping("/email")
    public String emailVerification(@ModelAttribute UserOtpReq userOtpReq,
                                    HttpSession session,
                                    RedirectAttributes redirectAttributes, Model model) {
        try {
            User user = userOtpServ.getUserWithEmail(userOtpReq.getEmail());

            session.setAttribute("reset_email", user.getEmail());
            redirectAttributes.addFlashAttribute("success", "Email verified! Please enter the OTP sent to your inbox.");
            return "redirect:/api/password-reset/otp"; 

        } catch (Exception e) {
            model.addAttribute("error",e.getMessage());
            return "email-verification";
        }
    }


    @PostMapping("/otp")
    public String checkOtp(@ModelAttribute UserOtpReq userOtpReq,
                           HttpSession session,
                           RedirectAttributes redirectAttributes, Model model) {
        try {
            String email = (String) session.getAttribute("reset_email");

            if (email == null) {
                redirectAttributes.addFlashAttribute("error", "Session expired. Please start again.");
                return "redirect:/user/verification/user-auth";
            }

            userOtpServ.otpVerification(userOtpReq);

            session.setAttribute("otp_verified", true);
            redirectAttributes.addFlashAttribute("success", "otp verified successfuly");

            return "redirect:/api/password-reset/new";

        } catch (Exception e) {
            model.addAttribute("error",e.getMessage());
            return "otp";  
        }
    }


    @PostMapping
    public String resetPassword(@ModelAttribute UserPasswordChangeReq userPasschange,
                                HttpSession session,
                                RedirectAttributes redirectAttributes,Model model) {
        try {
            String email = (String) session.getAttribute("reset_email");
            System.out.println("=== RESEND OTP ===");
            System.out.println("Email from session: " + email); 

            if (email == null) {
                redirectAttributes.addFlashAttribute("error", "Session expired. Please start again.");
                return "redirect:/user/verification/user-auth";
            }

            userOtpServ.resetPassword(email, userPasschange.getNewPassword());
            System.out.println("=== OTP SENT SUCCESSFULLY ===");  // ← add this

            session.removeAttribute("reset_email");
            session.removeAttribute("otp_verified");

            redirectAttributes.addFlashAttribute("success", "Password reset successful! Please log in.");
            return "redirect:/api/auth/login";

        } catch (Exception e) {
            model.addAttribute("error",e.getMessage());
            return "reset-password";
        }
    }
    
    @PostMapping("otp/resend")
    public String resendOtp(HttpSession session,
                            RedirectAttributes redirectAttributes, Model model) {
        try {
            String email = (String) session.getAttribute("reset_email");

            if (email == null) {
                redirectAttributes.addFlashAttribute("error", "Session expired. Please start again.");
                return "redirect:/user/verification/user-auth";
            }

            // Reuse your existing service method — sends new OTP email
            userOtpServ.getUserWithEmail(email);

            redirectAttributes.addFlashAttribute("success", "New OTP sent to your email!");
            return "redirect:/api/password-reset/otp";

        } catch (Exception e) {
            System.out.println("=== RESEND ERROR: " + e.getMessage()); 
            model.addAttribute("error", e.getMessage());
            return "otp";
        }
    }
    
    @GetMapping("/new")
    public String showResetPage() {
        return "reset-password";
    }
}