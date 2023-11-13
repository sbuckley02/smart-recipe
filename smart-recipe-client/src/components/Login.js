import { useState } from 'react';
import axios from "axios";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import SRNavbar from './partials/SRNavbar';

function Login(props) {
	const [loginForm, setLoginForm] = useState({
		email: null,
		password: null
	});

	const [errorText, setErrorText] = useState('');

	function logMeIn(event) {
		
		axios({
			method: "POST",
			url:"http://127.0.0.1:5000/api/login",
			data: {
				email: loginForm.email,
				password: loginForm.password
			}
		}).then((response) => {
			if (response.data.loginSuccessful) {
				props.setEmail(loginForm.email);
				props.setToken(response.data.access_token, loginForm.email);
				setLoginForm(({email: "", password: ""}));
				setErrorText('');
			} else {
				setErrorText('Either username or password incorrect');
			}
		}).catch((error) => {
			if (error.response) {
				console.log(error.response)
				console.log(error.response.status)
				console.log(error.response.headers)
			}
		})

		
		event.preventDefault();
	}

	function handleChange(event) {
		const {value, name} = event.target;
		setLoginForm(prevNote => ({
			...prevNote, [name]: value})
		)
	}

	return (
		<div>
			<SRNavbar isLoggedIn={false}/> <br />
			<h1>Login</h1>
			<Form>
				<Form.Group className="mb-3" controlId="formBasicEmail">
        			<Form.Label>Email Address</Form.Label>
        			<Form.Control type="email" placeholder="Enter email" name="email" onChange={handleChange} />
      			</Form.Group>
      			<Form.Group className="mb-3" controlId="formBasicPassword">
        			<Form.Label>Password</Form.Label>
        			<Form.Control type="password" placeholder="Password" name="password" onChange={handleChange} />
      			</Form.Group>
      			<Button variant="primary" onClick={logMeIn}>
        			Submit
      			</Button> <br />
				{ errorText }
			</Form>
		</div>
	);
}

export default Login;