import tkinter as tk
from tkinter import messagebox
from db import DBManager
from dashboard_gui import Dashboard

class LoginWindow(tk.Tk):
    def __init__(self):
        super().__init__()

        print("Initializing LoginWindow...")

        self.title('Login')
        self.geometry('800x600')
        self.center_window()

        try:
            print("Initializing DBManager...")
            self.db_manager = DBManager()  # Initialize the DBManager
            print("DBManager initialized.")
        except Exception as e:
            print(f"Failed to initialize DBManager: {e}")
            messagebox.showerror('Error', f"Failed to initialize DBManager: {e}")
            self.quit()

        print("Setting up layout...")
        self.main_frame = tk.Frame(self, bg='#1e1e2f')
        self.main_frame.pack(fill='both', expand=True)

        # Create center frame with similar styles to your CSS
        self.center_frame = tk.Frame(self.main_frame, bg='#2d2d3c', bd=1, relief='solid')
        self.center_frame.pack(padx=20, pady=20, fill='both', expand=True)

        self.center_frame.config(
            bg='#2d2d3c', 
            borderwidth=2, 
            relief="solid", 
            bd=2
        )

        # Login Form
        self.username_input = tk.Entry(self.center_frame, font=('Segoe UI', 14), fg='white', bg='#3e4451', bd=1, relief='solid', insertbackground='white')
        self.username_input.insert(0, 'Username')
        self.username_input.bind("<FocusIn>", self.clear_placeholder)
        self.username_input.config(
            fg='white',
            bg='#3e4451',
            font=('Segoe UI', 14),
            bd=1,
            relief='solid',
            insertbackground='white',
            highlightthickness=0
        )
        self.username_input.pack(pady=10, ipadx=10, fill='x', padx=10)

        self.password_input = tk.Entry(self.center_frame, font=('Segoe UI', 14), fg='white', bg='#3e4451', bd=1, relief='solid', show='*', insertbackground='white')
        self.password_input.insert(0, 'Password')
        self.password_input.bind("<FocusIn>", self.clear_placeholder)
        self.password_input.config(
            fg='white',
            bg='#3e4451',
            font=('Segoe UI', 14),
            bd=1,
            relief='solid',
            insertbackground='white',
            highlightthickness=0
        )
        self.password_input.pack(pady=10, ipadx=10, fill='x', padx=10)

        self.login_button = tk.Button(self.center_frame, text='Login', command=self.handle_login, font=('Segoe UI', 12), bg='#4d78cc', fg='white', bd=0, relief='solid', width=20)
        self.login_button.config(
            bg='#4d78cc',
            fg='white',
            font=('Segoe UI', 12),
            relief='solid',
            bd=0,
            width=20
        )
        self.login_button.pack(pady=20)

        self.login_button.bind('<Enter>', lambda event: self.on_hover(self.login_button, hover=True))
        self.login_button.bind('<Leave>', lambda event: self.on_hover(self.login_button, hover=False))

        print("LoginWindow initialized.")

    def clear_placeholder(self, event):
        if event.widget.get() in ('Username', 'Password'):
            event.widget.delete(0, tk.END)
        event.widget.config(show='*' if event.widget.get() == 'Password' else '')

    def handle_login(self):
        username = self.username_input.get()
        password = self.password_input.get()

        print("Verifying admin credentials...")
        try:
            admin = self.db_manager.verify_admin_credentials(username, password)
            if admin:
                self.username_input.delete(0, tk.END)
                self.password_input.delete(0, tk.END)
                self.open_dashboard()
            else:
                messagebox.showwarning('Error', 'Invalid username or password.')
                self.password_input.delete(0, tk.END)
        except Exception as e:
            print(f"Error during login: {e}")
            messagebox.showerror('Error', f"An error occurred: {str(e)}")

    def open_dashboard(self):
        print("Opening dashboard...")
        self.destroy()  # Close the login window
        dashboard = Dashboard()
        dashboard.mainloop()  # Start the main loop for the dashboard

    def center_window(self):
        self.update_idletasks()
        width = self.winfo_width()
        height = self.winfo_height()
        x = (self.winfo_screenwidth() // 2) - (width // 2)
        y = (self.winfo_screenheight() // 2) - (height // 2)
        self.geometry('{}x{}+{}+{}'.format(width, height, x, y))

    def on_hover(self, widget, hover):
        if hover:
            widget.config(bg='#5a9bd5')
        else:
            widget.config(bg='#4d78cc')

if __name__ == '__main__':
    print("Starting application...")
    app = LoginWindow()
    app.mainloop()
    print("Login window closed, opening dashboard...")