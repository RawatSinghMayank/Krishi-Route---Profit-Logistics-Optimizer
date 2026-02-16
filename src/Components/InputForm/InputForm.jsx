import { useState } from 'react';
import mockData from '../../data/mockData.json';
import './InputForm.css';

const InputForm = ({ onSubmit, loading, onReset, hasResults }) => {
  const [formData, setFormData] = useState({
    crop: '',
    quantity: '',
    unit: 'quintal',
    vehicle: '',
    location: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.crop) newErrors.crop = 'Please select a crop';
    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = 'Please enter valid quantity';
    }
    if (!formData.vehicle) newErrors.vehicle = 'Please select a vehicle';
    if (!formData.location) newErrors.location = 'Please select your location';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleFormReset = () => {
    setFormData({
      crop: '',
      quantity: '',
      unit: 'quintal',
      vehicle: '',
      location: '',
    });
    setErrors({});
    onReset();
  };

  const selectedVehicle = mockData.vehicles.find(v => v.type === formData.vehicle);
  const selectedCrop = mockData.crops.find(c => c.type === formData.crop);

  return (
    <div className="input-form-container">
      <h2 className="form-title">Trip Details</h2>
      
      <form onSubmit={handleSubmit} className="input-form">
        {/* Crop Selection - DROPDOWN */}
        <div className="form-group">
          <label htmlFor="crop" className="form-label">
            Crop Type <span className="required">*</span>
          </label>
          <select
            id="crop"
            className={`form-select ${errors.crop ? 'error' : ''}`}
            value={formData.crop}
            onChange={(e) => handleChange('crop', e.target.value)}
          >
            <option value="">-- Select Crop --</option>
            {mockData.crops.map(crop => (
              <option key={crop.id} value={crop.type}>
                {crop.icon} {crop.name} ({crop.nameHindi})
              </option>
            ))}
          </select>
          {errors.crop && <span className="error-text">{errors.crop}</span>}
          {selectedCrop && (
            <div className="field-info">
              {selectedCrop.perishable ? (
                <span className="info-badge warning"> Perishable - {selectedCrop.shelfLife} days shelf life</span>
              ) : (
                <span className="info-badge success">Non-perishable - {selectedCrop.shelfLife} days shelf life</span>
              )}
            </div>
          )}
        </div>

        {/* Quantity */}
        <div className="form-group">
          <label htmlFor="quantity" className="form-label">
            Quantity <span className="required">*</span>
          </label>
          <div className="quantity-group">
            <input
              type="number"
              id="quantity"
              className={`form-input ${errors.quantity ? 'error' : ''}`}
              placeholder="Enter quantity"
              value={formData.quantity}
              onChange={(e) => handleChange('quantity', e.target.value)}
              min="0"
              step="0.1"
            />
            <select
              className="form-select unit-select"
              value={formData.unit}
              onChange={(e) => handleChange('unit', e.target.value)}
            >
              <option value="quintal">Quintal (क्विंटल)</option>
              <option value="ton">Ton (टन)</option>
              <option value="kg">Kilogram (किलो)</option>
            </select>
          </div>
          {errors.quantity && <span className="error-text">{errors.quantity}</span>}
        </div>

        {/* Vehicle Selection - DROPDOWN */}
        <div className="form-group">
          <label htmlFor="vehicle" className="form-label">
            Vehicle Type <span className="required">*</span>
          </label>
          <select
            id="vehicle"
            className={`form-select ${errors.vehicle ? 'error' : ''}`}
            value={formData.vehicle}
            onChange={(e) => handleChange('vehicle', e.target.value)}
          >
            <option value="">-- Select Vehicle --</option>
            {mockData.vehicles.map(vehicle => (
              <option key={vehicle.id} value={vehicle.type}>
                {vehicle.name} - {vehicle.capacity} {vehicle.capacityUnit} (₹{vehicle.ratePerKm}/km)
              </option>
            ))}
          </select>
          {errors.vehicle && <span className="error-text">{errors.vehicle}</span>}
          {selectedVehicle && (
            <div className="field-info">
              <span className="info-text">{selectedVehicle.description}</span>
            </div>
          )}
        </div>

        {/* Location Selection - DROPDOWN */}
        <div className="form-group">
          <label htmlFor="location" className="form-label">
            Your Location <span className="required">*</span>
          </label>
          <select
            id="location"
            className={`form-select ${errors.location ? 'error' : ''}`}
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
          >
            <option value="">-- Select Location --</option>
            {mockData.locations.map(location => (
              <option key={location.id} value={location.id}>
                {location.name}, {location.state}
              </option>
            ))}
          </select>
          {errors.location && <span className="error-text">{errors.location}</span>}
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          {hasResults && (
            <button
              type="button"
              className="btn-secondary"
              onClick={handleFormReset}
            >
              Reset
            </button>
          )}
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-small"></span>
                Calculating...
              </>
            ) : (
              <>
                Find Best Market
              </>
            )}
          </button>
        </div>
      </form>

      {/* Summary Card */}
      {selectedVehicle && formData.quantity && (
        <div className="trip-summary">
          <h3 className="summary-title">Trip Summary</h3>
          <div className="summary-item">
            <span className="summary-label">Estimated Transport:</span>
            <span className="summary-value">
              ₹{selectedVehicle.ratePerKm}/km
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Vehicle Capacity:</span>
            <span className="summary-value">{selectedVehicle.capacity} {selectedVehicle.capacityUnit}</span>
          </div>
          {formData.quantity && (
            <div className="summary-item">
              <span className="summary-label">Load:</span>
              <span className="summary-value">
                {formData.quantity} {formData.unit}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InputForm;
