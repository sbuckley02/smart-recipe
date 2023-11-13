import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

function SRNavbar(props) {
	return (
		<Navbar className="green-bg" expand="lg">
			<Container>
				<Navbar.Brand href="/">smart-recipe</Navbar.Brand>
				<Navbar.Toggle aria-controls="basic-navbar-nav" />
				
					{
						(props.isLoggedIn == null || props.isLoggedIn == true) ?
						(<Navbar.Collapse id="basic-navbar-nav">
						<Nav className="me-auto">
							<Nav.Link className="light-link" href="/">home</Nav.Link>
							<Nav.Link className="light-link" href="/diet-tracker">diet tracker</Nav.Link>
							<Nav.Link className="light-link" href="/recommendations">recommendations</Nav.Link>
						</Nav>
						<Nav className="ms-auto">
							<Nav.Link className="light-link" href="/profile">profile</Nav.Link>
							<Nav.Link className="light-link" href="/logout">log out</Nav.Link>
						</Nav>
						</Navbar.Collapse>) :
						(
						<Navbar.Collapse id="basic-navbar-nav">
						<Nav className="me-auto">
							<Nav.Link className="light-link" href="/create-account">create account</Nav.Link>
						</Nav>
						<Nav className="ms-auto">
							<Nav.Link className="light-link" href="/">log in</Nav.Link>
						</Nav></Navbar.Collapse>
						)
					}
			</Container>
		</Navbar>
	);
}

export default SRNavbar;