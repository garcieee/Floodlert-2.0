import sys
from PyQt5.QtWidgets import (
    QApplication, QWidget, QVBoxLayout, QHBoxLayout,
    QStackedWidget, QLabel, QPushButton, QFrame, QComboBox
)
from PyQt5.QtCore import Qt


class Dashboard(QWidget):
    def __init__(self):
        super().__init__()
        self.initUI()
        
        # Apply the updated CSS to the dashboard
        with open('Dashboard\\css\\dashboard.css', 'r') as f:
            self.setStyleSheet(f.read())

    def initUI(self):
        self.setWindowTitle("Dashboard")
        self.setGeometry(100, 100, 800, 600)

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

        # Bottom Layout (Page Widget and Buttons)
        self.bottom_layout = QVBoxLayout()  # Changed to QVBoxLayout

        # Page Widget (QStackedWidget)
        self.page_box = QFrame()
        self.page_box.setFrameShape(QFrame.StyledPanel)
        self.page_box.setObjectName("page_box")  # For styling
        self.page_box_layout = QVBoxLayout()

        self.toggle_widget = QStackedWidget()

        # Default Pages (Page 1 to Page 5)
        for i in range(1, 6):
            page = QLabel(f"Page {i}", self)
            page.setAlignment(Qt.AlignCenter)
            self.toggle_widget.addWidget(page)

        self.page_box_layout.addWidget(self.toggle_widget)

        # Add the Page Selector (ComboBox) inside the page box layout
        self.page_selector_layout = QHBoxLayout()
        self.page_selector_label = QLabel("Select Page:")
        self.page_selector = QComboBox()
        for i in range(1, 6):  # Five pages: Page 1 to Page 5
            self.page_selector.addItem(f"Page {i}")
        self.page_selector.currentIndexChanged.connect(self.change_page)

        self.page_selector_layout.addWidget(self.page_selector_label)
        self.page_selector_layout.addWidget(self.page_selector)

        self.page_box_layout.addLayout(self.page_selector_layout)
        self.page_box.setLayout(self.page_box_layout)

        # Buttons on the Right (Flood and Typhoon)
        self.buttons_frame = QFrame()
        self.buttons_frame.setFrameShape(QFrame.StyledPanel)
        self.buttons_frame.setObjectName("buttons_frame")  # For styling
        self.buttons_layout = QVBoxLayout()

        self.flood_button = QPushButton("Flood")
        self.flood_button.setObjectName("flood_button")  # For styling
        self.flood_button.clicked.connect(self.show_flood_widget)

        self.typhoon_button = QPushButton("Typhoon")
        self.typhoon_button.setObjectName("typhoon_button")  # For styling
        self.typhoon_button.clicked.connect(self.show_typhoon_widget)

        # Add buttons to the layout
        self.buttons_layout.addStretch()
        self.buttons_layout.addWidget(self.flood_button, alignment=Qt.AlignCenter)
        self.buttons_layout.addWidget(self.typhoon_button, alignment=Qt.AlignCenter)
        self.buttons_layout.addStretch()
        self.buttons_frame.setLayout(self.buttons_layout)

        # Add Page Box and Buttons to Bottom Layout
        self.bottom_layout.addWidget(self.page_box, 3)
        self.bottom_layout.addWidget(self.buttons_frame, 1)

        # Add Top and Bottom Layouts to Main Layout
        self.main_layout.addLayout(self.top_layout)
        self.main_layout.addLayout(self.bottom_layout)

        # Set Main Layout
        self.setLayout(self.main_layout)

    def show_flood_widget(self):
        # Show the default page (Page 1) when Flood is pressed
        self.toggle_widget.setCurrentIndex(0)
        self.page_selector.setCurrentIndex(0)  # Reset ComboBox to Page 1

    def show_typhoon_widget(self):
        # Only add Typhoon Tracker page if it doesn't already exist
        if self.toggle_widget.count() == 5:  # 5 pages exist, meaning Typhoon Tracker hasn't been added
            typhoon_label = QLabel("World Typhoon Map Tracker", self)
            typhoon_label.setAlignment(Qt.AlignCenter)  # Center the text
            
            # Add the new page to the stacked widget
            self.toggle_widget.addWidget(typhoon_label)
            
            # Add the page to the combo box dynamically (after checking it's not already added)
            self.page_selector.addItem("Typhoon Tracker")
            self.page_selector.setCurrentIndex(self.page_selector.count() - 1)

    def change_page(self, index):
        # Change the page based on ComboBox selection
        self.toggle_widget.setCurrentIndex(index)


if __name__ == '__main__':
    app = QApplication(sys.argv)
    dashboard = Dashboard()
    dashboard.show()
    sys.exit(app.exec_())