package Com.ShopNest.App.Services;

import java.time.LocalDateTime;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailSender;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import Com.ShopNest.App.Dtos.UserOtpReq;
import Com.ShopNest.App.Entities.User;
import Com.ShopNest.App.Entities.UserOtp;
import Com.ShopNest.App.Repositories.UserOtpRepository;
import Com.ShopNest.App.Repositories.UserRepository;

@Service
public class UserOtpService {

    @Autowired
    private UserOtpRepository userotprepo;

    @Autowired
    private MailSender mailSender;

    @Autowired
    private UserRepository userrepo;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();


    public User getUserWithEmail(String email) {

        User user = userrepo.findByemail(email)
                .orElseThrow(() -> new RuntimeException("No account found with this email."));

        int otp = new Random().nextInt(100000, 999999);

        LocalDateTime expiry_time = LocalDateTime.now().plusMinutes(10);

        UserOtp user_otp = new UserOtp();
        user_otp.setUser_id(user.getUserId());
        user_otp.setExpiry_time(expiry_time);
        user_otp.setOtp(otp);
        userotprepo.save(user_otp);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("OTP from ShopNest");
        message.setText(
            "Hello " + user.getUsername() + ",\n\n" +
            "Your OTP to reset your password is: " + otp + "\n\n" +
            "This OTP is valid for 10 minutes only.\n" +
            "Do not share this with anyone.\n\n" +
            "— ShopNest Team"
        );
        mailSender.send(message);

        return user;
    }


    public void otpVerification(UserOtpReq userOtpReq) {

        UserOtp userOtp = userotprepo.findByotp(userOtpReq.getOtp())
                .orElseThrow(() -> new RuntimeException("Invalid OTP. Please try again."));

        if (LocalDateTime.now().isAfter(userOtp.getExpiry_time())) {
            throw new RuntimeException("OTP has expired. Please request a new one.");
        }
    }


    public void resetPassword(String email, String newPassword) {

        User user = userrepo.findByemail(email)
                .orElseThrow(() -> new RuntimeException("User not found."));

        user.setPassword(passwordEncoder.encode(newPassword));

        userrepo.save(user);
    }
}