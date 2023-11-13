import { useState } from 'react';

function useToken() {

	function getToken() {
		const userToken = localStorage.getItem('token');
		return userToken && userToken;
	}

	const [token, setToken] = useState(getToken());

	function saveToken(userToken, email) {
		localStorage.setItem('token', userToken);
		localStorage.setItem('email', email);
		setToken(userToken);
	}

	function removeToken() {
		localStorage.removeItem("token");
		localStorage.removeItem("email");
		setToken(null);
	}

	return {
		setToken: saveToken,
		token,
		removeToken
	}
}

export default useToken;