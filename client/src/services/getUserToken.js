function getUserToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload; // must contain `ID` field
  } catch (err) {
    console.error("Failed to decode token:", err);
    return null;
  }
}

export default getUserToken