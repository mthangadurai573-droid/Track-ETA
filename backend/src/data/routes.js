/**
 * Demo long-distance Indian train master data.
 * Coordinates and timings are demo/simulation values for the hackathon prototype.
 * Replace with authorized railway/NTES data for production use.
 */
const ROUTES = {
  "12621": {
    name: "Tamil Nadu Express",
    from: "Chennai Central",
    to: "New Delhi",
    category: "Long Distance",
    stations: [
      { name: "Chennai Central", km: 0, scheduledMin: 0, lat: 13.0827, lng: 80.2707 },
      { name: "Vijayawada", km: 431, scheduledMin: 390, lat: 16.5062, lng: 80.6480 },
      { name: "Warangal", km: 561, scheduledMin: 500, lat: 17.9689, lng: 79.5941 },
      { name: "Nagpur", km: 1090, scheduledMin: 930, lat: 21.1458, lng: 79.0882 },
      { name: "Bhopal", km: 1500, scheduledMin: 1230, lat: 23.2599, lng: 77.4126 },
      { name: "Jhansi", km: 1750, scheduledMin: 1435, lat: 25.4484, lng: 78.5685 },
      { name: "New Delhi", km: 2180, scheduledMin: 1740, lat: 28.6139, lng: 77.2090 }
    ]
  },
  "12622": {
    name: "Tamil Nadu Express",
    from: "New Delhi",
    to: "Chennai Central",
    category: "Long Distance",
    stations: [
      { name: "New Delhi", km: 0, scheduledMin: 0, lat: 28.6139, lng: 77.2090 },
      { name: "Jhansi", km: 430, scheduledMin: 300, lat: 25.4484, lng: 78.5685 },
      { name: "Bhopal", km: 680, scheduledMin: 510, lat: 23.2599, lng: 77.4126 },
      { name: "Nagpur", km: 1090, scheduledMin: 810, lat: 21.1458, lng: 79.0882 },
      { name: "Warangal", km: 1619, scheduledMin: 1210, lat: 17.9689, lng: 79.5941 },
      { name: "Vijayawada", km: 1749, scheduledMin: 1320, lat: 16.5062, lng: 80.6480 },
      { name: "Chennai Central", km: 2180, scheduledMin: 1740, lat: 13.0827, lng: 80.2707 }
    ]
  },
  "12841": {
    name: "Coromandel Express",
    from: "Shalimar",
    to: "Chennai Central",
    category: "Long Distance",
    stations: [
      { name: "Shalimar", km: 0, scheduledMin: 0, lat: 22.5726, lng: 88.3426 },
      { name: "Kharagpur", km: 117, scheduledMin: 105, lat: 22.3460, lng: 87.2320 },
      { name: "Balasore", km: 235, scheduledMin: 210, lat: 21.4934, lng: 86.9135 },
      { name: "Bhubaneswar", km: 440, scheduledMin: 390, lat: 20.2961, lng: 85.8245 },
      { name: "Visakhapatnam", km: 790, scheduledMin: 690, lat: 17.6868, lng: 83.2185 },
      { name: "Vijayawada", km: 1140, scheduledMin: 990, lat: 16.5062, lng: 80.6480 },
      { name: "Chennai Central", km: 1660, scheduledMin: 1440, lat: 13.0827, lng: 80.2707 }
    ]
  },
  "12842": {
    name: "Coromandel Express",
    from: "Chennai Central",
    to: "Shalimar",
    category: "Long Distance",
    stations: [
      { name: "Chennai Central", km: 0, scheduledMin: 0, lat: 13.0827, lng: 80.2707 },
      { name: "Vijayawada", km: 520, scheduledMin: 450, lat: 16.5062, lng: 80.6480 },
      { name: "Visakhapatnam", km: 870, scheduledMin: 750, lat: 17.6868, lng: 83.2185 },
      { name: "Bhubaneswar", km: 1220, scheduledMin: 1050, lat: 20.2961, lng: 85.8245 },
      { name: "Balasore", km: 1425, scheduledMin: 1230, lat: 21.4934, lng: 86.9135 },
      { name: "Kharagpur", km: 1543, scheduledMin: 1335, lat: 22.3460, lng: 87.2320 },
      { name: "Shalimar", km: 1660, scheduledMin: 1440, lat: 22.5726, lng: 88.3426 }
    ]
  },
  "12301": {
    name: "Howrah Rajdhani Express",
    from: "Howrah Junction",
    to: "New Delhi",
    category: "Long Distance",
    stations: [
      { name: "Howrah Junction", km: 0, scheduledMin: 0, lat: 22.5839, lng: 88.3429 },
      { name: "Dhanbad", km: 270, scheduledMin: 180, lat: 23.7957, lng: 86.4304 },
      { name: "Gaya", km: 470, scheduledMin: 315, lat: 24.7955, lng: 84.9994 },
      { name: "Dehri-on-Sone", km: 560, scheduledMin: 390, lat: 24.9022, lng: 84.1859 },
      { name: "Kanpur Central", km: 1010, scheduledMin: 720, lat: 26.4499, lng: 80.3319 },
      { name: "New Delhi", km: 1450, scheduledMin: 960, lat: 28.6139, lng: 77.2090 }
    ]
  },
  "12302": {
    name: "Howrah Rajdhani Express",
    from: "New Delhi",
    to: "Howrah Junction",
    category: "Long Distance",
    stations: [
      { name: "New Delhi", km: 0, scheduledMin: 0, lat: 28.6139, lng: 77.2090 },
      { name: "Kanpur Central", km: 440, scheduledMin: 300, lat: 26.4499, lng: 80.3319 },
      { name: "Dehri-on-Sone", km: 890, scheduledMin: 630, lat: 24.9022, lng: 84.1859 },
      { name: "Gaya", km: 980, scheduledMin: 700, lat: 24.7955, lng: 84.9994 },
      { name: "Dhanbad", km: 1180, scheduledMin: 835, lat: 23.7957, lng: 86.4304 },
      { name: "Howrah Junction", km: 1450, scheduledMin: 960, lat: 22.5839, lng: 88.3429 }
    ]
  },
  "12951": {
    name: "Mumbai Rajdhani",
    from: "Mumbai Central",
    to: "New Delhi",
    category: "Long Distance",
    stations: [
      { name: "Mumbai Central", km: 0, scheduledMin: 0, lat: 18.9690, lng: 72.8194 },
      { name: "Surat", km: 260, scheduledMin: 180, lat: 21.1702, lng: 72.8311 },
      { name: "Vadodara", km: 390, scheduledMin: 255, lat: 22.3072, lng: 73.1812 },
      { name: "Ratlam", km: 570, scheduledMin: 390, lat: 23.3315, lng: 75.0367 },
      { name: "Kota", km: 780, scheduledMin: 540, lat: 25.2138, lng: 75.8648 },
      { name: "Sawai Madhopur", km: 900, scheduledMin: 630, lat: 26.0173, lng: 76.5026 },
      { name: "New Delhi", km: 1380, scheduledMin: 930, lat: 28.6139, lng: 77.2090 }
    ]
  },
  "12952": {
    name: "Mumbai Rajdhani",
    from: "New Delhi",
    to: "Mumbai Central",
    category: "Long Distance",
    stations: [
      { name: "New Delhi", km: 0, scheduledMin: 0, lat: 28.6139, lng: 77.2090 },
      { name: "Sawai Madhopur", km: 480, scheduledMin: 300, lat: 26.0173, lng: 76.5026 },
      { name: "Kota", km: 600, scheduledMin: 390, lat: 25.2138, lng: 75.8648 },
      { name: "Ratlam", km: 810, scheduledMin: 540, lat: 23.3315, lng: 75.0367 },
      { name: "Vadodara", km: 990, scheduledMin: 675, lat: 22.3072, lng: 73.1812 },
      { name: "Surat", km: 1120, scheduledMin: 765, lat: 21.1702, lng: 72.8311 },
      { name: "Mumbai Central", km: 1380, scheduledMin: 930, lat: 18.9690, lng: 72.8194 }
    ]
  },
  "12903": {
    name: "Golden Temple Mail",
    from: "Mumbai Central",
    to: "Amritsar Junction",
    category: "Long Distance",
    stations: [
      { name: "Mumbai Central", km: 0, scheduledMin: 0, lat: 18.9690, lng: 72.8194 },
      { name: "Surat", km: 260, scheduledMin: 210, lat: 21.1702, lng: 72.8311 },
      { name: "Ahmedabad", km: 490, scheduledMin: 390, lat: 23.0225, lng: 72.5714 },
      { name: "Ajmer", km: 820, scheduledMin: 690, lat: 26.4499, lng: 74.6399 },
      { name: "Jaipur", km: 960, scheduledMin: 795, lat: 26.9124, lng: 75.7873 },
      { name: "Delhi Cantt", km: 1320, scheduledMin: 1020, lat: 28.6472, lng: 77.1320 },
      { name: "Amritsar Junction", km: 1830, scheduledMin: 1410, lat: 31.6339, lng: 74.8723 }
    ]
  },
  "12904": {
    name: "Golden Temple Mail",
    from: "Amritsar Junction",
    to: "Mumbai Central",
    category: "Long Distance",
    stations: [
      { name: "Amritsar Junction", km: 0, scheduledMin: 0, lat: 31.6339, lng: 74.8723 },
      { name: "Delhi Cantt", km: 510, scheduledMin: 390, lat: 28.6472, lng: 77.1320 },
      { name: "Jaipur", km: 870, scheduledMin: 660, lat: 26.9124, lng: 75.7873 },
      { name: "Ajmer", km: 1010, scheduledMin: 765, lat: 26.4499, lng: 74.6399 },
      { name: "Ahmedabad", km: 1340, scheduledMin: 1050, lat: 23.0225, lng: 72.5714 },
      { name: "Surat", km: 1570, scheduledMin: 1230, lat: 21.1702, lng: 72.8311 },
      { name: "Mumbai Central", km: 1830, scheduledMin: 1410, lat: 18.9690, lng: 72.8194 }
    ]
  },
  "12001": {
    name: "Bhopal Shatabdi",
    from: "New Delhi",
    to: "Bhopal",
    category: "Short Distance",
    stations: [
      { name: "New Delhi", km: 0, scheduledMin: 0, lat: 28.6139, lng: 77.2090 },
      { name: "Agra Cantt", km: 195, scheduledMin: 115, lat: 27.1558, lng: 78.0431 },
      { name: "Gwalior", km: 315, scheduledMin: 185, lat: 26.2183, lng: 78.1828 },
      { name: "Jhansi", km: 410, scheduledMin: 245, lat: 25.4484, lng: 78.5685 },
      { name: "Bhopal", km: 700, scheduledMin: 480, lat: 23.2599, lng: 77.4126 }
    ]
  },
  "12002": {
    name: "Bhopal Shatabdi",
    from: "Bhopal",
    to: "New Delhi",
    category: "Short Distance",
    stations: [
      { name: "Bhopal", km: 0, scheduledMin: 0, lat: 23.2599, lng: 77.4126 },
      { name: "Jhansi", km: 290, scheduledMin: 235, lat: 25.4484, lng: 78.5685 },
      { name: "Gwalior", km: 385, scheduledMin: 295, lat: 26.2183, lng: 78.1828 },
      { name: "Agra Cantt", km: 505, scheduledMin: 365, lat: 27.1558, lng: 78.0431 },
      { name: "New Delhi", km: 700, scheduledMin: 480, lat: 28.6139, lng: 77.2090 }
    ]
  },
  "12009": {
    name: "Mumbai Central Shatabdi",
    from: "Mumbai Central",
    to: "Ahmedabad",
    category: "Short Distance",
    stations: [
      { name: "Mumbai Central", km: 0, scheduledMin: 0, lat: 18.9690, lng: 72.8194 },
      { name: "Borivali", km: 35, scheduledMin: 35, lat: 19.2307, lng: 72.8567 },
      { name: "Surat", km: 265, scheduledMin: 195, lat: 21.1702, lng: 72.8311 },
      { name: "Vadodara", km: 395, scheduledMin: 285, lat: 22.3072, lng: 73.1812 },
      { name: "Ahmedabad", km: 490, scheduledMin: 360, lat: 23.0225, lng: 72.5714 }
    ]
  },
  "12010": {
    name: "Ahmedabad Shatabdi",
    from: "Ahmedabad",
    to: "Mumbai Central",
    category: "Short Distance",
    stations: [
      { name: "Ahmedabad", km: 0, scheduledMin: 0, lat: 23.0225, lng: 72.5714 },
      { name: "Vadodara", km: 95, scheduledMin: 75, lat: 22.3072, lng: 73.1812 },
      { name: "Surat", km: 225, scheduledMin: 165, lat: 21.1702, lng: 72.8311 },
      { name: "Borivali", km: 455, scheduledMin: 325, lat: 19.2307, lng: 72.8567 },
      { name: "Mumbai Central", km: 490, scheduledMin: 360, lat: 18.9690, lng: 72.8194 }
    ]
  }
};

module.exports = { ROUTES };
