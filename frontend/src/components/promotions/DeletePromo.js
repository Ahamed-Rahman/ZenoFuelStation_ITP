import axios from 'axios';

const deletePromo = async (promoId, onSuccess, onError) => {
  try {
    const token = localStorage.getItem("token"); // Ensure you have stored the token in localStorage
    await axios.delete(`http://localhost:5000/Promotions/deletePromo/${promoId}`, {
      headers: { // Updated to include headers
        Authorization: `Bearer ${token}`, // Add the authorization token
      },
    });
    onSuccess(); 
  } catch (error) {
    console.error("Error deleting promo:", error);
    onError(error);
  }
};

export default deletePromo;
