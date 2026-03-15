package org.shopnest.app.filters;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.Arrays;
import java.util.Optional;

import org.shopnest.app.entities.Role;
import org.shopnest.app.entities.User;
import org.shopnest.app.repositories.UserRepository;
import org.shopnest.app.services.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@WebFilter(urlPatterns = {"/api/*", "/admin/*", "/cart", "/checkout"})
public class AuthenticationFilter implements Filter {

    private static final Logger logger = LoggerFactory.getLogger(AuthenticationFilter.class);

    private final AuthService authService;
    private final UserRepository userRepository;

//    private static final String ALLOWED_ORIGIN = "http://localhost:5174";


    public AuthenticationFilter(AuthService authService, UserRepository userRepository) {
        System.out.println("Filter Started.");
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        try {
            executeFilterLogic(request, response, chain);
        } catch (Exception e) {
            logger.error("Unexpected error in AuthenticationFilter", e);
            sendErrorResponse((HttpServletResponse) response,
                    HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                    "Internal server error");
        }
    }

    private void executeFilterLogic(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String requestURI = httpRequest.getRequestURI();
        logger.info("Request URI: {}", requestURI);

        // ✅ Allow ALL static resources first — CSS, JS, images, fonts
        if (isStaticResource(requestURI)) {
            chain.doFilter(request, response);
            return;
        }

        // ✅ Allow public pages
        if (isPublicPath(requestURI)) {
            String token = getAuthTokenFromCookies(httpRequest);
            if (token != null && authService.validateToken(token)) {
                String username = authService.extractUsername(token);
                userRepository.findByusername(username).ifPresent(user ->
                    httpRequest.setAttribute("authenticatedUser", user)
                );
            }
            chain.doFilter(request, response); // always let through regardless
            return;
        }

        // Handle OPTIONS (preflight)
        if (httpRequest.getMethod().equalsIgnoreCase("OPTIONS")) {
            setCORSHeaders(httpResponse);
            return;
        }

        // Extract token from cookies
        String token = getAuthTokenFromCookies(httpRequest);

        if (token == null || !authService.validateToken(token)) {
            // ✅ Redirect to login instead of raw 401 text
            httpResponse.sendRedirect("/api/users/login");
            return;
        }

        // Extract username
        String username = authService.extractUsername(token);
        Optional<User> userOptional = userRepository.findByusername(username);

        if (userOptional.isEmpty()) {
            httpResponse.sendRedirect("/api/users/login");
            return;
        }

        // Authenticated user
        User authenticatedUser = userOptional.get();
        Role role = authenticatedUser.getRole();

        logger.info("Authenticated User: {}, Role: {}",
                authenticatedUser.getUsername(), role);

        // Role-based access control
        if (requestURI.startsWith("/admin/") && role != Role.ADMIN) {
            sendErrorResponse(httpResponse,
                    HttpServletResponse.SC_FORBIDDEN,
                    "Forbidden: Admin access required");
            return;
        }

        // ✅ REMOVED the broken customer block — customers CAN access /api/ routes

        // Attach user to request
        httpRequest.setAttribute("authenticatedUser", authenticatedUser);
        chain.doFilter(request, response);
    }

    // ✅ Add this new method
    private boolean isStaticResource(String uri) {
        return uri.endsWith(".css")
            || uri.endsWith(".js")
            || uri.endsWith(".png")
            || uri.endsWith(".jpg")
            || uri.endsWith(".jpeg")
            || uri.endsWith(".gif")
            || uri.endsWith(".svg")
            || uri.endsWith(".ico")
            || uri.endsWith(".woff")
            || uri.endsWith(".woff2")
            || uri.endsWith(".ttf")
            || uri.startsWith("/static/")
            || uri.startsWith("/images/")
            || uri.startsWith("/webjars/");
    }

    // ✅ Add this new method
    private boolean isPublicPath(String uri) {
        String[] publicPaths = {
            "/api/users/login",
            "/api/users/register",
            "/api/users",
            "/api/auth/login",
            "/api/password-reset",
            "/api/password-reset/email",
            "/api/password-reset/otp",
            "/api/password-reset/otp/resend",
            "/api/password-reset/new",
            "/api/products/home"
        };
        return Arrays.asList(publicPaths).contains(uri);
    }

    private void setCORSHeaders(HttpServletResponse response) {
//        response.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setStatus(HttpServletResponse.SC_OK);
    }

    private void sendErrorResponse(HttpServletResponse response, int statusCode, String message)
            throws IOException {
        response.setStatus(statusCode);
        response.getWriter().write(message);
    }

    private String getAuthTokenFromCookies(HttpServletRequest request) {

        Cookie[] cookies = request.getCookies();

        if (cookies != null) {
            return Arrays.stream(cookies)
                    .filter(cookie -> "authToken".equals(cookie.getName()))
                    .map(Cookie::getValue)
                    .findFirst()
                    .orElse(null);
        }

        return null;
    }
}