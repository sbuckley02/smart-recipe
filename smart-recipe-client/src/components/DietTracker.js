import SRNavbar from './partials/SRNavbar';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { useState, useEffect} from 'react';
import axios from "axios";

function DietTracker() {
	// one of: "main", "setDiet"
	const [mode, setMode] = useState('main');
	const [dietInfo, setDietInfo] = useState([
		{"dayNumber": 1, "meals": {}, "otherFood": []},
		{"dayNumber": 2, "meals": {}, "otherFood": []},
		{"dayNumber": 3, "meals": {}, "otherFood": []},
		{"dayNumber": 4, "meals": {}, "otherFood": []},
		{"dayNumber": 5, "meals": {}, "otherFood": []},
		{"dayNumber": 6, "meals": {}, "otherFood": []},
		{"dayNumber": 7, "meals": {}, "otherFood": []},
	]);
	const [searchTerm, setSearchTerm] = useState('');
	const [searchInfo, setSearchInfo] = useState([]);
	const [popShow, setPopShow] = useState(false);
	const [selectedFoodInd, setSelectedFoodInd] = useState(null);
	const [addFoodData, setAddFoodData] = useState({
		"quantity": 1,
		"unitInd": 0,
		"mealName": "",
		"days": [false, false, false, false, false, false, false]
	});
	const [nutrInfo, setNutrInfo] = useState(null);

	function getDiet() {
		// /api/get-user-diet
		let email = localStorage.getItem('email');

		axios({
			method: "GET",
			url:`http://127.0.0.1:5000/api/get-user-diet?email=${email}`
		}).then((response) => {
			if (response.data.success) {
				setNutrInfo(response.data.nutrition);
				setDietInfo(response.data.data);
			} else {
				console.log('Something went wrong');
			}
		}).catch((error) => {
			if (error.response) {
				console.log(error.response)
				console.log(error.response.status)
				console.log(error.response.headers)
			}
		})
	}

	useEffect(() => {
		getDiet();
	}, []);

	function handlePopClose() {
		setPopShow(false);
		setSelectedFoodInd(null);
		setAddFoodData({
			"quantity": 1,
			"unitInd": 0,
			"mealName": "",
			"days": [false, false, false, false, false, false, false]
		});
	}

	function handlePopShow() {
		setPopShow(true);
	}

	function switchToSetDiet() {
		setMode('setDiet');
	}

	function switchToMain() {
		setMode('main');
	}

	function handleSearchChange(event) {
		const {value, name} = event.target;
		setSearchTerm(value);
	}

	function searchFood() {
		axios({
			method: "GET",
			url:`http://127.0.0.1:5000/api/get-foods?search_term=${searchTerm}`
		}).then((response) => {
			if (response.data.success) {
				handlePopShow(true);
				setSearchInfo(response.data.data);
			} else {
				console.log('Something went wrong');
			}
		}).catch((error) => {
			if (error.response) {
				console.log(error.response)
				console.log(error.response.status)
				console.log(error.response.headers)
			}
		})
	}

	function selectFood(foodInd) {
		setSelectedFoodInd(foodInd);
	}

	function addFood() {
		let foodID = searchInfo[selectedFoodInd].food.foodId;
		let measureURI = searchInfo[selectedFoodInd].measures[addFoodData.unitInd].uri;
		measureURI = measureURI.replaceAll('/', '%2F');
		measureURI = measureURI.replaceAll('#', '%23');
		let quant = addFoodData['quantity'];
		let URL = `http://127.0.0.1:5000/api/get-nutrition-data?food_id=${foodID}&measure_uri=${measureURI}&quantity=${quant}`;
		axios({
			method: "GET",
			url: URL
		}).then((response) => {
			if (response.data.success) {
				console.log(`NEW FOOD DATA: ${JSON.stringify(response.data.data)}`);
				const dietData = response.data.data
				const newFood = {
					"foodId": foodID, "label": searchInfo[selectedFoodInd].food.label,
					"knownAs": searchInfo[selectedFoodInd].food.knownAs,
					"category": searchInfo[selectedFoodInd].food.category,
					"image": searchInfo[selectedFoodInd].food.image,
					"calories": dietData.calories,
					"totalWeight": dietData.totalWeight,
					"quantity": quant,
					"heathLabels": dietData.healthLabels,
					"measure": searchInfo[selectedFoodInd].measures[addFoodData.unitInd].label,
					"measureURI": measureURI,
					"measures": searchInfo[selectedFoodInd].measures,
					"nutrients": dietData.totalNutrients
				};
				console.log(`NEW FORMATTED FOOD: ${JSON.stringify(newFood)}`);
				let newDietInfo = dietInfo;
				let mealName = addFoodData.mealName;
				for (let dayInd = 0; dayInd < 7; dayInd++) {
					if (addFoodData.days[dayInd]) {
						if (!(mealName in newDietInfo[dayInd].meals)) {
							newDietInfo[dayInd].meals[mealName] = [];
						}
						newDietInfo[dayInd].meals[mealName].push(newFood)
					}
				}
				setDietInfo(newDietInfo);
				handlePopClose();
			} else {
				console.log('Something went wrong');
			}
		}).catch((error) => {
			if (error.response) {
				console.log(error.response)
				console.log(error.response.status)
				console.log(error.response.headers)
			}
		})
	}

	function confirmDietInfo() {
		let postURL = 'http://127.0.0.1:5000/api/set-user-diet';
		let email = localStorage.getItem('email');
		let postData = {
			'email': email,
			'mealList': dietInfo
		}

		axios.post(postURL, postData)
			.then(postResp => {
				console.log("Post request of diet completed");
				switchToMain();
		});
	}

	function removeMeal(mealKey,foodInd,dayNum) {
		let newDietInfo = {};
		Object.assign(newDietInfo, dietInfo);
		newDietInfo[dayNum].meals[mealKey].splice(foodInd, 1);
		setDietInfo(newDietInfo);
	}

	return (
		<div>
			<SRNavbar />
			{mode == 'setDiet' &&
				<SetDiet switchToMain={switchToMain} dietInfo={dietInfo} setDietInfo={setDietInfo} handleSearchChange={handleSearchChange} searchFood={searchFood} popShow={popShow} handlePopClose={handlePopClose} searchInfo={searchInfo} selectedFoodInd={selectedFoodInd} selectFood={selectFood} addFoodData={addFoodData} setAddFoodData={setAddFoodData} addFood={addFood} confirmDietInfo={confirmDietInfo} removeMeal={removeMeal} />
			}
			{mode == 'main' &&
				<ProfileMain switchToSetDiet={switchToSetDiet} nutrInfo={nutrInfo} />
			}
		</div>
	);
}

function ProfileMain(props) {
	return (
		<div className="main">
			<h1>diet tracker</h1>
			<p>Below are your diet nutritional totals, as compared to the standard recommendations for each week. Click the "Set Diet Information" button to input or edit any entries in your weekly diet.</p>
			
			{ (props.nutrInfo != null) ? <div>
			<h3>Protein</h3>
			<div>Expected Protein Per Week: <b>350</b> grams</div>
			<div>Your Protein Per Week: <b>{Math.round(100*props.nutrInfo[2])/100}</b> grams</div> <br />

			<h3>Fat</h3>
			<div>Expected Fat Per Week: <b>546</b> grams</div>
			<div>Your Fat Per Week: <b>{Math.round(100*props.nutrInfo[1])/100}</b> grams</div> <br />

			<h3>Carbohydrates</h3>
			<div>Expected Carbohydrates Per Week: <b>1925</b> grams</div>
			<div>Your Carbohydrates Per Week: <b>{Math.round(100*props.nutrInfo[0])/100}</b> grams</div>
			</div> :
			<div>Please start inputting entries into your diet!</div>
			}
			<br />

			<Button variant="dark" onClick={props.switchToSetDiet}>
				Set Diet Information
			</Button>
		</div>
	);
}

function SetDiet(props) {
	function submitHandler(e) {
		e.preventDefault();
		props.searchFood();
	}
	return (
		<div className="main">

			<DietPopup popShow={props.popShow} handlePopClose={props.handlePopClose} searchInfo={props.searchInfo} selectFood={props.selectFood} selectedFoodInd={props.selectedFoodInd} addFoodData={props.addFoodData} setAddFoodData={props.setAddFoodData} addFood={props.addFood} />

			<Form onSubmit={submitHandler}>
				<Form.Group className="mb-3" controlId={`dietForm`}>
					<Form.Label>Food Input</Form.Label>
					<div className="input-group">
						<Form.Control type="text" placeholder="Search food" name='food-search' onChange={props.handleSearchChange} /> <br />
						<Button variant="dark" className="pad-right" onClick={props.searchFood}>
							Search Food
						</Button>
					</div>
				</Form.Group>
			</Form>
			

			<Form>
				{['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, num) => { return (
					<div>
						<h2>Day {num+1} ({day})</h2>
						<ListGroup>
							{Object.keys(props.dietInfo[num].meals).map((mealKey, mealInd) => { return (
								<div>
								{props.dietInfo[num].meals[mealKey].map((food, foodInd) => { return (
									<ListGroup.Item className="diet-list">
										<div class="mealFlex">
											<div id="mealText">
												<b>{`${mealKey}`}</b> {`- ${food.label} (${food.quantity} ${food.measure})`}
											</div>
											<Button variant="dark" className="onRight" onClick={() => {props.removeMeal(mealKey,foodInd,num)}}>Remove</Button>
										</div>
									</ListGroup.Item>
								)})}
								</div>
							)})}
						</ListGroup> <br />
					</div>);
				})}

				<Button variant="dark" className="pad-right" onClick={props.switchToMain}>
					Back
				</Button>
				<Button variant="dark" onClick={props.confirmDietInfo}>
					Confirm Diet Information
				</Button>
			</Form> <br />
		</div>
	);
}

function DietPopup(props) {

	function updateAddFoodData(metric, value, day=-1) {
		let newFoodData = props.addFoodData;
		if (metric == 'days') {
			newFoodData[metric][day] = value;
		} else {
			newFoodData[metric] = value;
		}
		props.setAddFoodData(newFoodData);
	}

	return (
		((props.selectedFoodInd == null) ? 
			(<Modal show={props.popShow} onHide={props.handlePopClose}>
				<Modal.Header closeButton>
					<Modal.Title>Food Search Results</Modal.Title>
				</Modal.Header>
				<Modal.Body>
				<ListGroup>
					{props.searchInfo.map((food, ind) => {
						return (
							<ListGroup.Item className="diet-list" onClick={()=>props.selectFood(ind)}>{food.food.label}</ListGroup.Item>
						);
					})
					}
				</ListGroup>
				</Modal.Body>
			</Modal>) :
			(<Modal show={props.popShow} onHide={props.handlePopClose}>
				<Modal.Header closeButton>
					<Modal.Title>{props.searchInfo[props.selectedFoodInd].food.label}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<p>Category: {props.searchInfo[props.selectedFoodInd].food.category}</p>
					<Form onSubmit={props.addFood}>
						<Form.Group className="mb-3" controlId={'addFoodForm'}>
							<Form.Label>Select Amount of Food</Form.Label>
							<div className="input-group">
								<Form.Control type="number" placeholder="Quantity" name='quantity' onChange={(e) => updateAddFoodData("quantity", e.target.value)} />
								<Form.Select onChange={(e) => updateAddFoodData("unitInd", e.target.value)}>
									{props.searchInfo[props.selectedFoodInd].measures.map((measure, m_ind) => { return (
										<option value={m_ind}>{measure.label}</option>
									)})}
								</Form.Select>
							</div>
						</Form.Group>
						<Form.Group className="mb-3" controlId="mealInput">
							<Form.Label>Meal Name (Old or New)</Form.Label>
							<Form.Control type="text" placeholder="Enter meal name" onChange={(e) => updateAddFoodData("mealName", e.target.value)} />
						</Form.Group>
						<Form.Group className="mb-3" controlId={'addFoodForm2'}>
							<Form.Label>Select Days to Add Food</Form.Label>
							<Form.Check type="checkbox" id="day1Check" label="Day 1 (Monday)" onChange={(e) => updateAddFoodData("days", e.target.checked, 0)} />
							<Form.Check type="checkbox" id="day2Check" label="Day 2 (Tuesday)" onChange={(e) => updateAddFoodData("days", e.target.checked, 1)} />
							<Form.Check type="checkbox" id="day3Check" label="Day 3 (Wednesday)" onChange={(e) => updateAddFoodData("days", e.target.checked, 2)} />
							<Form.Check type="checkbox" id="day4Check" label="Day 4 (Thursday)" onChange={(e) => updateAddFoodData("days", e.target.checked, 3)} />
							<Form.Check type="checkbox" id="day5Check" label="Day 5 (Friday)" onChange={(e) => updateAddFoodData("days", e.target.checked, 4)} />
							<Form.Check type="checkbox" id="day6Check" label="Day 6 (Saturday)" onChange={(e) => updateAddFoodData("days", e.target.checked, 5)} />
							<Form.Check type="checkbox" id="day7Check" label="Day 7 (Sunday)" onChange={(e) => updateAddFoodData("days", e.target.checked, 6)}/>
						</Form.Group>
						<Button variant="dark" className="pad-right" onClick={props.addFood}>
							Add Food
						</Button>
					</Form>
				</Modal.Body>
			</Modal>)
		)
	);
}

export default DietTracker;