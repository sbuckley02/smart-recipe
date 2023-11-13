import SRNavbar from './partials/SRNavbar';
import { Link } from "react-router-dom";

function Home() {
	return (
		<div>
			<SRNavbar />
			<div className="main">
				<h1>overview</h1>
				<p>Welcome to <i>smart-recipe</i>, a web application aimed to help you make
				small, but powerful improvements to your diet! First, you input your typical diet and define
				your nutritional needs and goals. Then, we recommend new recipes and changes to your existing recipes to help you reach
				your nutritional goals.
				</p>

				<h1>about us</h1>
				<p>This website was created by Stephen Buckley and Dylan Yost, students at Georgia Tech who created this application
				for our enterprise computing class. We can be contacted
				at <Link to="mailto:sbuckley@gatech.edu">sbuckley@gatech.edu</Link> and <Link to="mailto:dyost6@gatech.edu">dyost6@gatech.edu</Link> respectively.
				</p>

				<h1>using smart-recipe</h1>
				Check out the <Link to="/diet-tracker">Diet Tracker</Link> page to input your diet. Then, check out
				the <Link to="/recommendations">Recommendations</Link> page to get recommendations
				for your diet.
			</div>

		</div>
	);
}

export default Home;