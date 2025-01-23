import sys
from PyQt5.QtWidgets import (QApplication, QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton, QFrame, QStackedWidget, QDesktopWidget)
from PyQt5.QtCore import Qt

class Dashboard(QWidget):
    def __init__(self):
        super().__init__()
        self.initUI()

        # Apply the updated CSS to the dashboard (if you have it)
        with open('Dashboard\\css\\dashboard.css', 'r') as f:
            self.setStyleSheet(f.read())

    def initUI(self):
        self.setWindowTitle("Dashboard")
        self.setGeometry(100, 100, 800, 600)
        self.setMinimumSize(800, 600)
        self.setMaximumSize(1200, 800)
        self.center_window()

        # Main Layout
        self.main_layout = QVBoxLayout()

        # Top Layout (Weather, Time, City, Temperature)
        self.top_layout = QHBoxLayout()

        # Background Frame for Time of Day
        self.time_of_day_frame = QFrame()
        self.time_of_day_frame.setFrameShape(QFrame.StyledPanel)
        self.time_of_day_frame.setObjectName("time_of_day_frame")  # For styling
        self.time_of_day_layout = QHBoxLayout()

        # Weather Section
        self.weather_frame = QFrame()
        self.weather_frame.setFrameShape(QFrame.StyledPanel)
        self.weather_frame.setObjectName("weather_frame")  # For styling
        self.weather_layout = QVBoxLayout()

        self.weather_label = QLabel("Weather (Static for now)")
        self.weather_label.setAlignment(Qt.AlignCenter)
        self.weather_layout.addWidget(self.weather_label)
        self.weather_frame.setLayout(self.weather_layout)

        # Time, City, Temp Section
        self.info_frame = QFrame()
        self.info_frame.setFrameShape(QFrame.StyledPanel)
        self.info_frame.setObjectName("info_frame")  # For styling
        self.info_layout = QVBoxLayout()

        self.time_label = QLabel("1:00 PM")  # Static placeholder for time
        self.city_label = QLabel("Tokyo")    # Static placeholder for city
        self.temp_label = QLabel("30°C")     # Static placeholder for temperature

        self.time_label.setAlignment(Qt.AlignCenter)
        self.city_label.setAlignment(Qt.AlignCenter)
        self.temp_label.setAlignment(Qt.AlignCenter)

        self.info_layout.addWidget(self.time_label)
        self.info_layout.addWidget(self.city_label)
        self.info_layout.addWidget(self.temp_label)
        self.info_frame.setLayout(self.info_layout)

        # Add Weather and Info Frames to Time of Day Layout
        self.time_of_day_layout.addWidget(self.weather_frame, 1)
        self.time_of_day_layout.addWidget(self.info_frame, 1)
        self.time_of_day_frame.setLayout(self.time_of_day_layout)

        # Add to Top Layout
        self.top_layout.addWidget(self.time_of_day_frame, 1)

        # Stacked Widget Section
        self.stacked_widget = QStackedWidget()
        self.flood_page = QLabel("Flood Information")
        self.typhoon_page = QLabel("Typhoon Information")

        self.flood_page.setAlignment(Qt.AlignCenter)
        self.typhoon_page.setAlignment(Qt.AlignCenter)

        self.stacked_widget.addWidget(self.flood_page)
        self.stacked_widget.addWidget(self.typhoon_page)

        # Bottom Layout (Buttons)
        self.bottom_layout = QHBoxLayout()

        # Buttons at the Bottom
        self.flood_button = QPushButton("Flood")
        self.flood_button.setObjectName("flood_button")  # For styling
        self.flood_button.clicked.connect(self.show_flood_page)

        self.typhoon_button = QPushButton("Typhoon")
        self.typhoon_button.setObjectName("typhoon_button")  # For styling
        self.typhoon_button.clicked.connect(self.show_typhoon_page)

        self.settings_button = QPushButton("Settings")
        self.settings_button.setObjectName("settings_button")  # For styling
        self.settings_button.clicked.connect(self.show_settings)

        # Add buttons to the bottom layout
        self.bottom_layout.addWidget(self.flood_button)
        self.bottom_layout.addWidget(self.typhoon_button)
        self.bottom_layout.addWidget(self.settings_button)

        # Add everything to the Main Layout
        self.main_layout.addLayout(self.top_layout)
        self.main_layout.addWidget(self.stacked_widget)
        self.main_layout.addLayout(self.bottom_layout)  # Move buttons here

        self.setLayout(self.main_layout)

    def center_window(self):
        qr = self.frameGeometry()
        cp = QDesktopWidget().availableGeometry().center()
        qr.moveCenter(cp)
        self.move(qr.topLeft())

    def show_flood_page(self):
        self.stacked_widget.setCurrentWidget(self.flood_page)

    def show_typhoon_page(self):
        self.stacked_widget.setCurrentWidget(self.typhoon_page)

    def show_settings(self):
        print("Settings button pressed!")

if __name__ == '__main__':
    app = QApplication(sys.argv)
    dashboard = Dashboard()
    dashboard.show()
    sys.exit(app.exec_())