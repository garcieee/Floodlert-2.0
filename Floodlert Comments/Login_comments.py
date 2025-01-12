import sys  # Required to interact with the system, like reading command-line arguments or exiting the app
from PyQt5.QtWidgets import *  # Import all necessary PyQt5 widgets (e.g., buttons, labels, input fields)
from PyQt5.QtCore import QFile, QTextStream  # Used to load and read the external stylesheet

# First few changes
# **Class Definition: LoginWindow**
# This class defines the GUI for the login window and includes all functionality like input handling and login validation.
class LoginWindow(QWidget):  # Inherit from QWidget, the base class for all PyQt5 windows
    def __init__(self):
        super().__init__()  # Initialize the parent class (QWidget)
        self.initUI()  # Call a method to set up the user interface

    # **Method to Set Up the User Interface**
    def initUI(self):
        self.setWindowTitle('Login')  # Set the window title displayed at the top of the GUI

        # **Load External Stylesheet**
        self.load_stylesheet()  # Apply styles from the `style.qss` file

        # **Main Layout**
        # Use a vertical layout (V = Vertical) to arrange widgets (input fields, buttons) in a column
        self.main_layout = QVBoxLayout()

        # **Username Section**
        # Create a label for the username input
        self.username_label = QLabel('Username:')
        # Create a text input field where the user enters their username
        self.username_input = QLineEdit()
        # Add the label and input field to the layout
        self.main_layout.addWidget(self.username_label)
        self.main_layout.addWidget(self.username_input)

        # **Password Section**
        # Create a label for the password input
        self.password_label = QLabel('Password:')
        # Create a password input field (hidden text for security)
        self.password_input = QLineEdit()
        self.password_input.setEchoMode(QLineEdit.Password)  # Mask the text input with dots or asterisks
        # Add the label and input field to the layout
        self.main_layout.addWidget(self.password_label)
        self.main_layout.addWidget(self.password_input)

        # **Login Button**
        # Create a button for the user to click and attempt login
        self.login_button = QPushButton('Login')
        # Connect the button's click event to the `handle_login` method
        self.login_button.clicked.connect(self.handle_login)
        # Add the button to the layout
        self.main_layout.addWidget(self.login_button)

        # **Apply the Layout**
        # Set the layout (arrangement of widgets) for the main window
        self.setLayout(self.main_layout)

    # **Login Logic**
    # This method is called when the user clicks the "Login" button
    def handle_login(self):
        # Get the text from the username and password input fields
        username = self.username_input.text()
        password = self.password_input.text()

        # **Example Login Validation**
        # Check if the username is "admin" and the password is "password"
        if username == 'admin' and password == 'password':
            # If the login is successful, show a success message
            QMessageBox.information(self, 'Success', 'Login successful!')
            # Clear the input fields after login
            self.username_input.clear()
            self.password_input.clear()
        else:
            # If the login fails, show an error message
            QMessageBox.warning(self, 'Error', 'Invalid username or password.')
            # Clear only the password field (not the username)
            self.password_input.clear()

    # **Load Stylesheet**
    # This method reads the external `style.qss` file to style the GUI
    def load_stylesheet(self):
        try:
            # Open the stylesheet file in read-only mode
            file = QFile('style.qss')
            file.open(QFile.ReadOnly | QFile.Text)  # Ensure the file is opened as text
            stream = QTextStream(file)  # Create a stream to read the file
            self.setStyleSheet(stream.readAll())  # Apply the stylesheet content
        except Exception as e:
            # Print an error message if the stylesheet cannot be loaded
            print(f"Error loading stylesheet: {e}")

# **Main Application Entry Point**
# This block ensures the code is run only when the script is executed directly
if __name__ == '__main__':
    # Create the application object (manages app-wide settings and events)
    app = QApplication(sys.argv)
    # Create an instance of the `LoginWindow` class
    window = LoginWindow()
    # Show the login window
    window.show()
    # Start the application event loop (keeps the app running and responsive)
    sys.exit(app.exec_())  # Exit the app cleanly when the loop ends
