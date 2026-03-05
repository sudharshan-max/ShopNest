package org.shopnest.app.entities;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name="user_otp")
public class UserOtp {
	
	@Id
	private int user_id;
	
	@Column(name="otp")
	private int otp;
	
	@Column(name="expiry_time")
	private LocalDateTime expiry_time;

	public UserOtp(int otp_id, int otp, LocalDateTime expiry_time) {
		super();
		this.user_id = otp_id;
		this.otp = otp;
		this.expiry_time = expiry_time;
	}

	public UserOtp(int otp, LocalDateTime expiry_time) {
		super();
		this.otp = otp;
		this.expiry_time = expiry_time;
	}

	public UserOtp() {
		super();
	}

	public int getUser_id() {
		return user_id;
	}

	public void setUser_id(int otp_id) {
		this.user_id = otp_id;
	}

	public int getOtp() {
		return otp;
	}

	public void setOtp(int otp) {
		this.otp = otp;
	}

	public LocalDateTime getExpiry_time() {
		return expiry_time;
	}

	public void setExpiry_time(LocalDateTime expiry_time) {
		this.expiry_time = expiry_time;
	}
	
	
	
	
	
	
	
	
}
