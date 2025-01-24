import tkinter as tk
from tkinter import ttk

class Dashboard(tk.Tk):
    def __init__(self):
        super().__init__()
        self.initUI()
        self.center_window()

    def initUI(self):
        self.title("Dashboard")
        self.geometry("800x600")
        self.minsize(800, 600)
        self.maxsize(1200, 800)

        # Main Layout
        self.main_frame = ttk.Frame(self)
        self.main_frame.pack(fill=tk.BOTH, expand=True)

        # Top Layout (Weather, Time, City, Temperature)
        self.top_frame = ttk.Frame(self.main_frame)
        self.top_frame.pack(fill=tk.X, pady=10)

        # Background Frame for Time of Day
        self.time_of_day_frame = ttk.Frame(self.top_frame)
        self.time_of_day_frame.pack(fill=tk.X)

        # Weather Section
        self.weather_frame = ttk.Frame(self.time_of_day_frame)
        self.weather_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        self.weather_label = ttk.Label(self.weather_frame, text="Weather (Static for now)", anchor="center")
        self.weather_label.pack(padx=20, pady=10)

        # Time, City, Temp Section
        self.info_frame = ttk.Frame(self.time_of_day_frame)
        self.info_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        self.time_label = ttk.Label(self.info_frame, text="1:00 PM")
        self.city_label = ttk.Label(self.info_frame, text="Tokyo")
        self.temp_label = ttk.Label(self.info_frame, text="30°C")

        self.time_label.pack(padx=20, pady=5)
        self.city_label.pack(padx=20, pady=5)
        self.temp_label.pack(padx=20, pady=5)

        # Stacked Widget Section (Using a notebook for page switching)
        self.notebook = ttk.Notebook(self.main_frame)
        self.notebook.pack(fill=tk.BOTH, expand=True)

        self.flood_page = ttk.Frame(self.notebook)
        self.flood_label = ttk.Label(self.flood_page, text="Flood Information", anchor="center")
        self.flood_label.pack(fill=tk.BOTH, expand=True)
        self.notebook.add(self.flood_page, text="Flood")

        self.typhoon_page = ttk.Frame(self.notebook)
        self.typhoon_label = ttk.Label(self.typhoon_page, text="Typhoon Information", anchor="center")
        self.typhoon_label.pack(fill=tk.BOTH, expand=True)
        self.notebook.add(self.typhoon_page, text="Typhoon")

        # Bottom Layout (Buttons)
        self.bottom_frame = ttk.Frame(self.main_frame)
        self.bottom_frame.pack(fill=tk.X, pady=10)

        # Buttons at the Bottom
        self.flood_button = ttk.Button(self.bottom_frame, text="Flood", command=self.show_flood_page)
        self.flood_button.pack(side=tk.LEFT, padx=20)

        self.typhoon_button = ttk.Button(self.bottom_frame, text="Typhoon", command=self.show_typhoon_page)
        self.typhoon_button.pack(side=tk.LEFT, padx=20)

        self.settings_button = ttk.Button(self.bottom_frame, text="Settings", command=self.show_settings)
        self.settings_button.pack(side=tk.LEFT, padx=20)

    def show_flood_page(self):
        self.notebook.select(self.flood_page)

    def show_typhoon_page(self):
        self.notebook.select(self.typhoon_page)

    def show_settings(self):
        print("Settings button pressed!")

    def center_window(self):
        window_width = 800
        window_height = 600
        screen_width = self.winfo_screenwidth()
        screen_height = self.winfo_screenheight()

        # Calculate position to center the window
        position_top = int(screen_height / 2 - window_height / 2)
        position_left = int(screen_width / 2 - window_width / 2)

        # Set the window position
        self.geometry(f'{window_width}x{window_height}+{position_left}+{position_top}')

if __name__ == '__main__':
    dashboard = Dashboard()
    dashboard.mainloop()
