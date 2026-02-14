import mockData from '../data/mockData.json';

/**
 * Calculate profit for all available mandis based on user's trip data
 */
export const calculateProfitability = (tripData) => {
  const { crop, quantity, unit, vehicle, location } = tripData;

  // Find selected location
  const selectedLocation = mockData.locations.find(loc => loc.id === location);
  if (!selectedLocation) {
    throw new Error('Invalid location selected');
  }

  // Find selected vehicle
  const selectedVehicle = mockData.vehicles.find(v => v.type === vehicle);
  if (!selectedVehicle) {
    throw new Error('Invalid vehicle selected');
  }

  // Find selected crop
  const selectedCrop = mockData.crops.find(c => c.type === crop);
  if (!selectedCrop) {
    throw new Error('Invalid crop selected');
  }

  // Convert quantity to quintals for standardization
  let quantityInQuintals = parseFloat(quantity);
  if (unit === 'ton') {
    quantityInQuintals = quantityInQuintals * 10; // 1 ton = 10 quintals
  } else if (unit === 'kg') {
    quantityInQuintals = quantityInQuintals / 100; // 100 kg = 1 quintal
  }

  // Get all mandis and calculate profitability for each
  const mandiResults = mockData.mandis.map(mandi => {
    // Get distance from location to mandi
    const distanceKey = `${location}_${mandi.id}`;
    const distance = mockData.distances[distanceKey];

    if (!distance) {
      console.warn(`No distance data for ${selectedLocation.name} to ${mandi.name}`);
      return null;
    }

    // Get market price for the crop
    const marketPrice = mandi.prices[crop];
    if (!marketPrice) {
      console.warn(`No price data for ${crop} at ${mandi.name}`);
      return null;
    }

    // Calculate revenue (price per quintal * quantity)
    const revenue = marketPrice * quantityInQuintals;

    // Calculate transport cost (distance * rate per km)
    const transportCost = distance * selectedVehicle.ratePerKm;

    // Handling charges
    const handlingCost = mandi.handlingCharges;

    // Other costs (can be extended later)
    const otherCosts = 0;

    // Total costs
    const totalCosts = transportCost + handlingCost + otherCosts;

    // Net profit
    const netProfit = revenue - totalCosts;

    // Profit per km (efficiency metric)
    const profitPerKm = netProfit / distance;

    // Profit margin percentage
    const profitMargin = (netProfit / revenue) * 100;

    // Check for price alerts
    let priceAlert = null;
    if (mandi.historicalTrends && mandi.historicalTrends[crop]) {
      priceAlert = mandi.historicalTrends[crop];
    }

    // Check for perishability warnings
    let perishabilityWarning = null;
    if (selectedCrop.perishable && distance > 100) {
      const estimatedTravelTime = distance / 40; // Assuming 40 km/hr average
      perishabilityWarning = {
        message: `Long journey (~${estimatedTravelTime.toFixed(1)} hours). Ensure proper storage for ${selectedCrop.name}.`,
        travelTime: estimatedTravelTime,
        shelfLife: selectedCrop.shelfLife
      };
    }

    return {
      id: mandi.id,
      name: mandi.name,
      location: mandi.location,
      district: mandi.district,
      coordinates: mandi.coordinates,
      distance: distance,
      marketPrice: marketPrice,
      revenue: revenue,
      costs: {
        transport: transportCost,
        handling: handlingCost,
        other: otherCosts,
        total: totalCosts
      },
      netProfit: netProfit,
      profitPerKm: profitPerKm,
      profitMargin: profitMargin,
      priceAlert: priceAlert,
      perishabilityWarning: perishabilityWarning,
      historicalInsight: mandi.insights,
      priceUpdatedAt: mandi.priceUpdatedAt
    };
  }).filter(result => result !== null); // Remove any nulls

  // Sort by net profit (descending)
  mandiResults.sort((a, b) => b.netProfit - a.netProfit);

  // Identify best mandi
  const bestMandi = mandiResults.length > 0 ? {
    id: mandiResults[0].id,
    name: mandiResults[0].name,
    netProfit: mandiResults[0].netProfit,
    distance: mandiResults[0].distance
  } : null;

  // Find nearest mandi for comparison
  const nearestMandi = [...mandiResults].sort((a, b) => a.distance - b.distance)[0];

  // Calculate potential savings (best vs nearest)
  const potentialSavings = bestMandi && nearestMandi && bestMandi.id !== nearestMandi.id
    ? bestMandi.netProfit - nearestMandi.netProfit
    : 0;

  return {
    mandis: mandiResults,
    bestMandi: bestMandi,
    nearestMandi: nearestMandi,
    potentialSavings: potentialSavings,
    totalMarketsCompared: mandiResults.length,
    cropDetails: selectedCrop,
    locationDetails: selectedLocation,
    vehicleDetails: selectedVehicle,
    quantityInQuintals: quantityInQuintals
  };
};

/**
 * Get distance between two locations
 */
export const getDistance = (locationId, mandiId) => {
  const distanceKey = `${locationId}_${mandiId}`;
  return mockData.distances[distanceKey] || null;
};

/**
 * Get all available locations
 */
export const getLocations = () => {
  return mockData.locations;
};

/**
 * Get all available crops
 */
export const getCrops = () => {
  return mockData.crops;
};

/**
 * Get all available vehicles
 */
export const getVehicles = () => {
  return mockData.vehicles;
};

/**
 * Get mandis for a specific location
 */
export const getMandisForLocation = (locationId) => {
  return mockData.mandis.filter(mandi => {
    const distanceKey = `${locationId}_${mandi.id}`;
    return mockData.distances[distanceKey] !== undefined;
  });
};