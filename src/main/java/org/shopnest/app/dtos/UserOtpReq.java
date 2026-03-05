package org.shopnest.app.dtos;

public class UserOtpReq {
	
	private String email;
	
	private Integer otp;

	public UserOtpReq(String email, Integer otp) {
		super();
		this.email = email;
		this.otp = otp;
	}
	public UserOtpReq() {
		super();
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public Integer getOtp() {
		return otp;
	}

	public void setOtp(Integer otp) {
		this.otp = otp;
	}
	
	

	
}
