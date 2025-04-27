import axios from 'axios';

const BASE_URL = 'http://localhost:8080'; // Adjust the base URL as needed

export const startContainer = async (serviceName: string) => {
    try {
        const response = await axios.post(`${BASE_URL}/start`, { service: serviceName });
        return response.data;
    } catch (error) {
        console.error(`Error starting ${serviceName}:`, error);
        throw error;
    }
};

export const stopContainer = async (serviceName: string) => {
    try {
        const response = await axios.post(`${BASE_URL}/stop`, { service: serviceName });
        return response.data;
    } catch (error) {
        console.error(`Error stopping ${serviceName}:`, error);
        throw error;
    }
};

export const getContainerStatus = async (serviceName: string) => {
    try {
        const response = await axios.get(`${BASE_URL}/status/${serviceName}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching status for ${serviceName}:`, error);
        throw error;
    }
};