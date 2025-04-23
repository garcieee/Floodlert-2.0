const generateTimeBasedAlerts = () => {
  const baseAlerts = [
    // Asia
    {
      id: 1,
      location: 'Manila, Philippines',
      coordinates: [14.5995, 120.9842],
      severity: 'high',
      waterLevel: '2.5m',
      rainfall: '150mm',
      region: 'Asia',
      description: 'Heavy rainfall causing flood risks'
    },
    {
      id: 2,
      location: 'Mumbai, India',
      coordinates: [19.0760, 72.8777],
      severity: 'medium',
      rainfall: '120mm',
      region: 'Asia',
      description: 'Monsoon flooding'
    },
    {
      id: 3,
      location: 'Bangkok, Thailand',
      coordinates: [13.7563, 100.5018],
      severity: 'high',
      waterLevel: '2.8m',
      rainfall: '180mm',
      region: 'Asia',
      description: 'River overflow warning'
    },
    // North America
    {
      id: 4,
      location: 'New Orleans, USA',
      coordinates: [29.9511, -90.0715],
      severity: 'high',
      waterLevel: '3.0m',
      rainfall: '200mm',
      region: 'North America',
      description: 'Hurricane-related flooding'
    },
    {
      id: 5,
      location: 'Miami, USA',
      coordinates: [25.7617, -80.1918],
      severity: 'medium',
      waterLevel: '1.5m',
      rainfall: '150mm',
      region: 'North America',
      description: 'Coastal flooding alert'
    },
    // Europe
    {
      id: 6,
      location: 'Amsterdam, Netherlands',
      coordinates: [52.3676, 4.9041],
      severity: 'medium',
      waterLevel: '1.5m',
      rainfall: '80mm',
      region: 'Europe',
      description: 'Coastal flooding alert'
    },
    {
      id: 7,
      location: 'Venice, Italy',
      coordinates: [45.4408, 12.3155],
      severity: 'high',
      waterLevel: '2.0m',
      rainfall: '100mm',
      region: 'Europe',
      description: 'Acqua alta warning'
    },
    // South America
    {
      id: 8,
      location: 'São Paulo, Brazil',
      coordinates: [-23.5505, -46.6333],
      severity: 'medium',
      waterLevel: '1.8m',
      rainfall: '130mm',
      region: 'South America',
      description: 'Urban flooding'
    },
    // Africa
    {
      id: 9,
      location: 'Lagos, Nigeria',
      coordinates: [6.5244, 3.3792],
      severity: 'high',
      waterLevel: '2.2m',
      rainfall: '160mm',
      region: 'Africa',
      description: 'Coastal flooding'
    },
    // Australia
    {
      id: 10,
      location: 'Brisbane, Australia',
      coordinates: [-27.4698, 153.0251],
      severity: 'low',
      waterLevel: '1.2m',
      rainfall: '90mm',
      region: 'Oceania',
      description: 'River level rising'
    }
  ];

  // Add timestamps and more weather details to alerts
  return baseAlerts.map(alert => ({
    ...alert,
    timestamp: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)), // Random time within last week
    weatherDetails: {
      temperature: Math.floor(Math.random() * 30 + 10),
      humidity: Math.floor(Math.random() * 60 + 40),
      windSpeed: Math.floor(Math.random() * 30 + 5),
      pressure: Math.floor(Math.random() * 50 + 980),
      visibility: Math.floor(Math.random() * 5000 + 5000),
    },
    floodData: {
      waterLevel: alert.waterLevel,
      rainfall: alert.rainfall,
      flowRate: Math.floor(Math.random() * 500 + 100) + ' m³/s',
      riskLevel: alert.severity,
      evacuationStatus: alert.severity === 'high' ? 'Required' : 'Not Required',
    }
  }));
};

export const mockAlerts = generateTimeBasedAlerts();
