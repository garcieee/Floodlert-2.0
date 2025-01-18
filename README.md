# FloodLert

FloodLert is a comprehensive dashboard application designed to track historical flood data, monitor typhoon activities, and provide real-time weather updates. It is a powerful tool for individuals, organizations, and government agencies to stay informed and prepared.

## Features

- **Historical Flood Data**
  - Records of major floods from 2000 to the present.
  - Global coverage with detailed data on flood impacts.

- **Typhoon Tracking**
  - Real-time updates on typhoon paths and intensity.
  - Historical data for past typhoons.

- **Weather Monitoring**
  - Real-time updates on time, temperature, and city-specific weather.
  - Weekly weather forecasts with key metrics like precipitation and wind speed.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/FloodLert.git
   cd FloodLert
   ```

2. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the application:
   ```bash
   python main.py
   ```

## Usage

1. Launch the application to access the login screen.
2. Enter your username and password (default credentials: `admin` / `password`).
3. Navigate through the dashboard:
   - Use the **Flood** button to view historical flood data.
   - Use the **Typhoon** button to track typhoon activities.
   - Use the weather panel for real-time updates.
4. Switch between pages using the page selector dropdown.

## Screenshots

### Login Screen
![Login Screen](screenshots/login.png)

### Dashboard
![Dashboard](screenshots/dashboard.png)

## Technologies Used

- **Frontend:** PyQt5 (Python)
- **Backend:** Python with SQLite (or alternative database)
- **APIs:** OpenWeatherMap API, Global Typhoon Tracking API
- **Styling:** Custom CSS

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Description of changes"
   ```
4. Push to the branch:
   ```bash
   git push origin feature-name
   ```
5. Create a pull request.

## Security Considerations

- All API calls are made over HTTPS.
- User authentication ensures secure access.
- Historical data is stored locally to protect user privacy.

## Future Enhancements

- Mobile application support.
- AI-driven flood risk predictions.
- Community-based flood reporting.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Contact

- **Project Lead:** Jude Joseph Garcia jr
- **Email:** judejosephgarciajr@gmail.com
- **GitHub Repository:** https://github.com/garcieee/Floodlert-2.0.git
