import tkinter as tk
from tkinter import messagebox
from db import DBManager
from dashboard_gui import Dashboard

class LoginWindow:
    def __init__(self, root):
        self.root = root
        self.root.title('Login')
        self.root.geometry('800x600')
        self.center_window()

        try:
            print("Initializing DBManager...")
            self.db_manager = DBManager()  # Initialize the DBManager
            print("DBManager initialized.")
        except Exception as e:
            print(f"Failed to initialize DBManager: {e}")
            messagebox.showerror('Error', f"Failed to initialize DBManager: {e}")
            root.destroy()

        # Create and pack widgets
        self.main_frame = tk.Frame(self.root)
        self.main_frame.pack(expand=True)

        self.username_label = tk.Label(self.main_frame, text="Username")
        self.username_label.pack(pady=5)
        self.username_input = tk.Entry(self.main_frame)
        self.username_input.pack(pady=5)

        self.password_label = tk.Label(self.main_frame, text="Password")
        self.password_label.pack(pady=5)
        self.password_input = tk.Entry(self.main_frame, show="*")
        self.password_input.pack(pady=5)

        self.login_button = tk.Button(self.main_frame, text="Login", command=self.handle_login)
        self.login_button.pack(pady=20)

        print("LoginWindow initialized.")

    def handle_login(self):
        username = self.username_input.get()
        password = self.password_input.get()

        print("Verifying admin credentials...")
        try:
            admin = self.db_manager.verify_admin_credentials(username, password)
            if admin:
                print("Login successful!")
                self.username_input.delete(0, tk.END)
                self.password_input.delete(0, tk.END)
                
                # Open the dashboard
                self.open_dashboard()
            else:
                messagebox.showwarning('Error', 'Invalid username or password.')
                self.password_input.delete(0, tk.END)
        except Exception as e:
            print(f"Error during login: {e}")
            messagebox.showerror('Error', f"An error occurred: {str(e)}")

    def open_dashboard(self):
        print("Opening dashboard...")
        self.root.destroy()  # Close the login window
        dashboard = Dashboard()  # No arguments needed
        dashboard.mainloop()

    def center_window(self):
        self.root.update_idletasks()
        width = self.root.winfo_width()
        height = self.root.winfo_height()
        x = (self.root.winfo_screenwidth() // 2) - (width // 2)
        y = (self.root.winfo_screenheight() // 2) - (height // 2)
        self.root.geometry(f"{width}x{height}+{x}+{y}")

if __name__ == '__main__':
    print("Starting application...")
    root = tk.Tk()
    app = LoginWindow(root)
    root.mainloop()