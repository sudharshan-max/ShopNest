package Com.ShopNest.App.Dtos;

public class UserPasswordChangeReq {
	private String newPassword;
	
	public String getNewPassword() {
		return newPassword;
	}

	public void setNewPassword(String password) {
		this.newPassword = password;
	}

	public UserPasswordChangeReq(String password) {
		super();
		this.newPassword = password;
	}

	public UserPasswordChangeReq() {
		super();
	}
	
	

	
}
