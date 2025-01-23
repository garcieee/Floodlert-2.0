import sys
from PyQt5.QtWidgets import (QApplication, QWidget, QVBoxLayout, QLabel, QLineEdit, QPushButton, QMessageBox, QFrame)
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QGuiApplication
from dashboard_gui import Dashboard

from db import DBManager

class LoginWindow(QWidget):
    def __init__(self):
        super().__init__()

        # Apply the updated CSS to the login window
        with open('Dashboard\\css\\login.css', 'r') as f:
            self.setStyleSheet(f.read())

        # Initialize the database manager
        self.db_manager = DBManager()

        self.initUI()

    def initUI(self):
        self.setWindowTitle('Login')
        self.setGeometry(100, 100, 800, 600)
        self.setMinimumSize(800, 600)
        self.setMaximumSize(1200, 800)
        self.center_window()

        # Create a main layout
        self.main_layout = QVBoxLayout()

        # Center Frame
        self.center_frame = QFrame()
        self.center_frame.setObjectName("center_frame")
        self.center_frame.setStyleSheet(
            "QFrame#center_frame { background-color: #f0f0f0; border-radius: 10px; padding: 20px; }"
        )
        self.center_frame_layout = QVBoxLayout()

        # Username Label and Input
        self.username_label = QLabel('Username:')
        self.username_input = QLineEdit()
        self.center_frame_layout.addWidget(self.username_label)
        self.center_frame_layout.addWidget(self.username_input)

        # Password Label and Input
        self.password_label = QLabel('Password:')
        self.password_input = QLineEdit()
        self.password_input.setEchoMode(QLineEdit.Password)
        self.center_frame_layout.addWidget(self.password_label)
        self.center_frame_layout.addWidget(self.password_input)

        # Login Button
        self.login_button = QPushButton('Login')
        self.login_button.clicked.connect(self.handle_login)
        self.center_frame_layout.addWidget(self.login_button, alignment=Qt.AlignCenter)

        # Set layout to center frame and add it to main layout
        self.center_frame.setLayout(self.center_frame_layout)
        self.main_layout.addWidget(self.center_frame, alignment=Qt.AlignCenter)

        # Set main layout to the window
        self.setLayout(self.main_layout)

    def handle_login(self):
        username = self.username_input.text()
        password = self.password_input.text()

        try:
            # Verify credentials using the DBManager
            admin = self.db_manager.verify_admin_credentials(username, password)
            if admin:
                QMessageBox.information(self, 'Success', 'Login successful!')
                self.username_input.clear()
                self.password_input.clear()
                self.open_dashboard()  # Open the dashboard when login is successful
            else:
                QMessageBox.warning(self, 'Error', 'Invalid username or password.')
                self.password_input.clear()
        except Exception as e:
            QMessageBox.critical(self, 'Error', f"An error occurred: {str(e)}")

    def open_dashboard(self):
        # Create an instance of the Dashboard window and show it
        self.dashboard = Dashboard()
        self.dashboard.show()
        self.close()  # Close the login window

    def center_window(self):
        qr = self.frameGeometry()
        cp = QGuiApplication.primaryScreen().availableGeometry().center()
        qr.moveCenter(cp)
        self.move(qr.topLeft())


if __name__ == '__main__':
    app = QApplication(sys.argv)
    window = LoginWindow()
    window.show()
    sys.exit(app.exec_())