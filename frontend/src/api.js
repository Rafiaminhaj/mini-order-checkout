const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Sends cart items and mobile number to calculate subtotal, taxes, and generate an Order ID.
 * @param {Array<{id: number, quantity: number}>} items 
 * @param {string} mobileNumber 
 * @returns {Promise<Object>} Object containing orderId, total, tax, subtotal, etc.
 */
export async function checkout(items, mobileNumber) {
  try {
    const response = await fetch(`${API_BASE_URL}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ items, mobileNumber })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'An error occurred during checkout calculation.');
    }

    return data;
  } catch (error) {
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Connection failed. Please ensure the backend API server is running on port 5000.');
    }
    throw error;
  }
}

/**
 * Sends orderId to simulate a secure payment gateway transaction.
 * @param {string} orderId 
 * @returns {Promise<Object>} Object containing status and confirmation message.
 */
export async function pay(orderId) {
  try {
    const response = await fetch(`${API_BASE_URL}/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ orderId })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'An error occurred during payment processing.');
    }

    return data;
  } catch (error) {
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Connection failed. Please ensure the backend API server is running on port 5000.');
    }
    throw error;
  }
}
