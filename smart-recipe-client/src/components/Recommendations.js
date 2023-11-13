import SRNavbar from './partials/SRNavbar';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import { useState, useEffect} from 'react';
import axios from "axios";

function Recommendations() {
	const [newRecs, setNewRecs] = useState([]);
	const [badMeal, setBadMeal] = useState(null);

	function makeNewRec() {
		let email = localStorage.getItem('email');
		axios({
			method: "GET",
			url:`http://127.0.0.1:5000/api/new-recipe-rec?email=${email}`
		}).then((response) => {
			let replacedMeal = response.data['replace-meal'];
			setBadMeal(replacedMeal);
			let filteredHits = response.data.data.hits;
			filteredHits = filteredHits.slice(0,Math.min(filteredHits.length,25))
			setNewRecs(response.data.data.hits);

		}).catch((error) => {
			if (error.response) {
				console.log(error.response)
				console.log(error.response.status)
				console.log(error.response.headers)
			}
		})
	}

	function makeNewRecIngredient() {
		let email = localStorage.getItem('email');
		axios({
			method: "GET",
			url:`http://127.0.0.1:5000/api/new-recipe-rec-ingredient?email=${email}`
		}).then((response) => {
			let replacedMeal = response.data['replace-meal'];
			setBadMeal(replacedMeal);
			let filteredHits = response.data.data.hits;
			filteredHits = filteredHits.slice(0,Math.min(filteredHits.length,25))
			setNewRecs(response.data.data.hits);

		}).catch((error) => {
			if (error.response) {
				console.log(error.response)
				console.log(error.response.status)
				console.log(error.response.headers)
			}
		})
	}

	return (
		<div>
			<SRNavbar />
			<div className="main">
				<h1>description</h1>
				<p>
					In the below, you'll be able to get intelligently-generated recommendations to
					improve your diet. There are two kinds of recommendations: new recipes and changes
					to recipes you already have. To be able to get these recommendations, you'll first need
					to input your diet on the <a href="/diet-tracker"> diet tracker</a> page. Then, you can use
					the interface below to receive recommendations. Every time you generate a new recommendation,
					you can choose to save it and be able to access it forever.
				</p>

				<h1>recommendations</h1>
				<Button variant="primary" className="pad-right" onClick={makeNewRec}>
					Generate New Recommendation (Optimized For Nutrition)
				</Button>  <br /> <br />
				<Button variant="primary" className="pad-right" onClick={makeNewRecIngredient}>
					Generate New Recommendation (Optimized For Ingredient Similarity)
				</Button> <br /> <br />

				{(badMeal) ? <div>You should replace your <b>{badMeal}</b> meal with one of the following:</div>
				: <div></div>
				}
				

				{(newRecs.length > 0) ? <div>
					<Table striped bordered hover className="centered">
						<thead>
							<tr>
								<th className="green-bg">Recipe Name</th>
								<th className="green-bg">Recipe URL</th>
								<th className="green-bg">Characteristics</th>
								<th className="green-bg">Cuisine</th>
							</tr>
						</thead>
						<tbody>
							{newRecs.map((rec) => {
								return (
									<tr>
										<td>{rec.recipe.label}</td>
										<td><a href={rec.recipe.url}>{rec.recipe.url}</a></td>
										<td>{rec.recipe.dietLabels.join(", ")}</td>
										<td>{rec.recipe.cuisineType.join(", ")}</td>
									</tr>
								);
							})}
						</tbody>
						</Table>
				</div>:null}

				<br />

				{/* <h1>saved recommendations</h1>
				<p>When you have saved a recommendation, you will be able to see it here.</p> */}
			</div>
		</div>
	);
}

export default Recommendations;