import sys
from PyQt5.QtWidgets import (
    QApplication, QWidget, QVBoxLayout, QLabel, QLineEdit, QPushButton, QMessageBox
)
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QGuiApplication
from dashboard_gui import Dashboard

class LoginWindow(QWidget):
    def __init__(self):
        super().__init__()
        self.initUI()

        # Apply the updated CSS to the login window
        self.apply_stylesheet()

    def initUI(self):
        self.setWindowTitle('Login')

        # Create a main layout
        self.main_layout = QVBoxLayout()

        # Username Label and Input
        self.username_label = QLabel('Username:')
        self.username_input = QLineEdit()
        self.main_layout.addWidget(self.username_label)
        self.main_layout.addWidget(self.username_input)

        # Password Label and Input
        self.password_label = QLabel('Password:')
        self.password_input = QLineEdit()
        self.password_input.setEchoMode(QLineEdit.Password)
        self.main_layout.addWidget(self.password_label)
        self.main_layout.addWidget(self.password_input)

        # Login Button
        self.login_button = QPushButton('Login')
        self.login_button.clicked.connect(self.handle_login)
        self.main_layout.addWidget(self.login_button)

        # Set main layout to the window
        self.setLayout(self.main_layout)

        # Center the window on the screen
        self.center_window()

    def handle_login(self):
        username = self.username_input.text()
        password = self.password_input.text()

        # Example validation (replace with your own logic)
        if username == 'admin' and password == 'password':
            self.username_input.clear()
            self.password_input.clear()
            self.open_dashboard()  # Open the dashboard when login is successful
        else:
            QMessageBox.warning(self, 'Error', 'Invalid username or password.')
            self.password_input.clear()

    def open_dashboard(self):
        # Create an instance of the Dashboard window and show it
        self.dashboard = Dashboard()
        self.dashboard.show()
        self.close()  # Close the login window

    def center_window(self):
        # Get the screen's geometry
        screen_geometry = QGuiApplication.primaryScreen().geometry()
        window_geometry = self.frameGeometry()

        # Calculate the position to center the window
        x = (screen_geometry.width() - window_geometry.width()) // 2
        y = (screen_geometry.height() - window_geometry.height()) // 2

        # Move the window to the calculated position
        self.move(x, y)

    def apply_stylesheet(self):
        """Load and apply the stylesheet."""
        stylesheet_path = 'Dashboard\\css\\login.css'
        try:
            with open(stylesheet_path, 'r') as f:
                self.setStyleSheet(f.read())
        except FileNotFoundError:
            QMessageBox.warning(
                self, 
                'Error', 
                f"Stylesheet not found: {stylesheet_path}"
            )

if __name__ == '__main__':
    app = QApplication(sys.argv)
    window = LoginWindow()
    window.show()
    sys.exit(app.exec_())