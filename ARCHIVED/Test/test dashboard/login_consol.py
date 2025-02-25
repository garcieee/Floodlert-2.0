from db_manager import DBManager


class LoginConsole:
    def __init__(self):
        self.db_manager = DBManager()
        self.logged_in_admin = None

    def show_login_prompt(self):
        print("\nWelcome to the Admin Login Console")
        print("Please enter your credentials.")

    def handle_login(self):
        while True:
            username_input = input("Username: ")
            password_input = input("Password: ")

            admin = self.db_manager.verify_admin_credentials(username_input, password_input)
            if admin:
                print("\nLogin successful!")
                self.logged_in_admin = admin
                self.open_dashboard()
                break
            else:
                print("\nInvalid username or password. Please try again.")
                
if __name__ == "__main__":
    login_console = LoginConsole()
    login_console.show_login_prompt()
    login_console.handle_login()
