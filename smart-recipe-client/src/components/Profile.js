import SRNavbar from './partials/SRNavbar';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useState, useEffect} from 'react';
import axios from "axios";

function Profile(props) {
	// one of: "main", "setName", "setDem"
	const [mode, setMode] = useState('main');
	const [userData, setUserData] = useState(null);

	useEffect(() => {
		(async () => {
			const baseURL = 'http://127.0.0.1:5000/';
			let email = localStorage.getItem('email');
			let resp = await axios.get(baseURL + 'api/get-user?email=' + email);
			let newUserData = resp.data.data;
			setUserData(newUserData);
		})();
	}, []);

	function switchToName() {
		setMode('setName');
	}

	function switchToDem() {
		setMode('setDem');
	}

	function switchToMain() {
		setMode('main');
	}

	return (
		<div>
			<SRNavbar />
			{mode == 'setName' &&
				<SetName userData={userData} switchToMain={switchToMain} />
			}
			{mode == 'setDem' &&
				<SetDemographic userData={userData} switchToMain={switchToMain} />
			}
			{mode == 'main' &&
				<ProfileMain switchToName={switchToName} switchToDem={switchToDem} userData={userData}/>
			}
		</div>
	);
}

function ProfileMain(props) {
	return (
	<div className="main">
		{/* {props.userData && (<div>
			<p><b>Name</b>: {props.userData['first-name'] + ' ' + props.userData['last-name']}</p>
			<p><b>Email</b>: { props.userData.email }</p>
		</div>)} */}

		{(props.userData != null) ? <div>
			<p><b>Email</b>: {props.userData.email}</p>
			<p><b>Name</b>: {props.userData['first-name']} {props.userData['last-name']}</p>
		</div> : <div></div>}

		

		{/* <Button variant="dark" className="pad-right" onClick={props.switchToName}>
			Update Name
		</Button> */}

		{/* <Button variant="dark" onClick={props.switchToDem}>
			Input Demographic Information
		</Button> */}
	</div>
	);
}

function SetName(props) {
	return (
	<div className="main">
		<Form>
			{/* {props.userData && (<div>
				<p><b>Email</b>: { props.userData.email }</p>
				<p><b>Name</b>: {props.userData['first-name'] + ' ' + props.userData['last-name']}</p>
			</div>)} */}

			<p><b>Email</b>: email@email.com</p>
			<p><b>Name</b>: Name Jameson</p>
			
			<Form.Group className="mb-3" controlId="formFirstName">
				<Form.Label>First Name</Form.Label>
				<Form.Control type="text" placeholder="Enter first name" name="firstName" />
			</Form.Group>
			<Form.Group className="mb-3" controlId="formLastName">
				<Form.Label>Last Name</Form.Label>
				<Form.Control type="text" placeholder="Enter last name" name="lastName" />
			</Form.Group>

			<Button variant="secondary" className="pad-right" onClick={props.switchToMain}>
				Back
			</Button>

			<Button variant="primary">
				Update Name
			</Button>
		</Form>
	</div>
	);
}

function SetDemographic(props) {
	return (
	<div className="main">
		<Form>
			<Form.Group className="mb-3" controlId="formHeight">
				<Form.Label>Height</Form.Label>
				<Form.Control type="number" placeholder="Enter height (inches)" name="height" />
			</Form.Group>
			<Form.Group className="mb-3" controlId="formWeight">
				<Form.Label>Weight</Form.Label>
				<Form.Control type="number" placeholder="Enter weight (pounds)" name="weight" />
			</Form.Group>
			<Form.Group className="mb-3" controlId="formAge">
				<Form.Label>Age</Form.Label>
				<Form.Control type="number" placeholder="Enter age" name="age" />
			</Form.Group>

			<Button variant="secondary" className="pad-right" onClick={props.switchToMain}>
				Back
			</Button>

			<Button variant="primary">
				Update Information
			</Button>
		</Form>
	</div>
	);
}

export default Profile;