import axios from "axios";
import SRNavbar from './partials/SRNavbar';
import Button from 'react-bootstrap/Button';

function Logout(props) {

	function logMeOut() {
		axios({
			method: 'POST',
			url: 'http://127.0.0.1:5000/logout'
		}).then((response) => {
			props.removeToken()
		}).catch((err) => {
			console.log(err.response);
			console.log(err.response.status);
			console.log(err.response.headers);
		})
	}

	return (
		<div>
			<SRNavbar/> <br />
			<Button variant="primary" onClick={logMeOut}>
        		Log Out
      		</Button>
		</div>
	)
}

export default Logout;