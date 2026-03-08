package org.shopnest.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.server.servlet.context.ServletComponentScan;

@SpringBootApplication
@ServletComponentScan
public class ShopNestApplication {

	public static void main(String[] args) {
		SpringApplication.run(ShopNestApplication.class, args);
	}

}
