import { useState } from 'react';
import axios from "axios";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import SRNavbar from './partials/SRNavbar';

function CreateAccount(props) {
	const [createForm, setCreateForm] = useState({
		email: null,
		password: null,
		firstName: null,
		lastName: null
	});

	const [errorText, setErrorText] = useState('');

	function createUser(event) {
		axios({
			method: "POST",
			url:"http://127.0.0.1:5000/api/create-user",
			data: {
				email: createForm.email,
				password: createForm.password,
				firstName: createForm.firstName,
				lastName: createForm.lastName
			}
		}).then((response) => {
			if (response.data.creationSuccessful) {
				props.setEmail(createForm.email);
				props.setToken(response.data.accessToken, createForm.email);
				setCreateForm(({email: "", password: "", firstName: "", lastName: ""}));
				setErrorText('');
			} else {
				setErrorText('Please fill out all fields correctly');
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
		setCreateForm(prevNote => ({
			...prevNote, [name]: value})
		)
	}

	return (
		<div>
			<SRNavbar isLoggedIn={false}/> <br />
			<h1>Create Account</h1>
			<Form>
				<Form.Group className="mb-3" controlId="formBasicEmail">
        			<Form.Label>Email Address</Form.Label>
        			<Form.Control type="email" placeholder="Enter email" name="email" onChange={handleChange} />
      			</Form.Group>
      			<Form.Group className="mb-3" controlId="formBasicPassword">
        			<Form.Label>Password</Form.Label>
        			<Form.Control type="password" placeholder="Password" name="password" onChange={handleChange} />
      			</Form.Group>
				<Form.Group className="mb-3" controlId="formFirstName">
        			<Form.Label>First Name</Form.Label>
        			<Form.Control type="text" placeholder="Enter first name" name="firstName" onChange={handleChange} />
      			</Form.Group>
				<Form.Group className="mb-3" controlId="formLastName">
        			<Form.Label>Last Name</Form.Label>
        			<Form.Control type="text" placeholder="Enter last name" name="lastName" onChange={handleChange} />
      			</Form.Group>
      			<Button variant="primary" onClick={createUser}>
        			Submit
      			</Button>
			</Form> <br />
			{ errorText }
		</div>
	)
}

export default CreateAccount;