const API_KEY = "6FOcMGU6dj8l8ZUvZUK3IWJpjO6KpfABUxjpZNpL";

function getRandomDate(){
	const today = new Date();
	const lastYear = new Date(today);
	lastYear.setFullYear(today.getFullYear() - 1);
	
	const randomTime = lastYear.getTime() + Math.random() * (today.getTime() - lastYear.getTime());
	return new Date(randomTime).toISOString().split("T")[0];
}

async function setRandomBackground(){
	try{
		const randomDate = getRandomDate();
		const res = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&date=${randomDate}`);
		const selected = await res.json();
	
		if(selected.media_type == "image"){
			document.querySelector(".background").style.backgroundImage = `url(${selected.url})`;
		}
		else{
			setRandomBackground();
		}	
	}
	
	catch(err){
		alert("fail to load image");
	}
}

let data;
let sols;
const url = `https://api.nasa.gov/insight_weather/?api_key=${API_KEY}&feedtype=json&ver=1.0`;
async function getMarsWeather(){
	try{
		const res = await fetch(url);
		data = await res.json();
		
		const todayDiv = document.getElementsByClassName("today")[0];
		const day = new Date().toLocaleDateString();
		
		sols = data.sol_keys.slice(-7);
		
		sols.forEach((sol, i) => {
			const weather = data[sol];
			const card = document.getElementById(`card${i+1}`);
			
			card.innerHTML = `
			<h3>Sol ${sol}</h3>
			<p>Temp: ${weather.AT?.av}˚F</p>
			<p>Pressure: ${weather.PRE?.av}</p>
			<p>Season: ${weather.Season}</p>`;
			
			if(i == 6){
				todayDiv.innerHTML = `
					<h2 class="sol-row">
    					<span class="sol-text">Sol ${sol}</span>
    					<span class="high">high: ${weather.AT?.mx}˚F</span>
  					</h2>
  					<h2 class="date-row">
    					<span class="date">${day}</span>
    					<span class="low">low: ${weather.AT?.mn}˚F</span>
  					</h2>`;
			}
		});
		
		cardClickEvent();
	}
	
	catch(err){
		alert("API error");
	}
}


async function getPredictedTemp(){
    try{
        const res = await fetch("/predict");
        const data = await res.json();
        const todayDiv = document.getElementsByClassName("todayDiv")[0];
        
        todayDiv.appendChild = (`
            <h2 class = "pred-row">
                Predicted Sol ${data.sol} Temp: ${data.pred_temp.toFixed(2)}˚F
            </h2>`);
    } catch(err){
        console.error("Prediction API error", err);
    }
}

function getDetailInfo(sol){
	const weather = data[sol]
	const detail = document.getElementsByClassName("detail-info")[0];
	
	detail.innerHTML = `
	<h2>Detail for Sol ${sol}</h2>
	<p>Max Temperature: ${weather.AT?.mx}</p>
	<p>Min Temperature: ${weather.AT?.mn}</p>
	<p>Average Pressure: ${weather.PRE?.av}</p>
	<p>Wind Direction: ${weather.WD?.most_common?.compass_point}</p>
	<p>Season: ${weather.Season}</p>`;
}

function cardClickEvent(){
	sols.forEach((sol, i) => {
		const card = document.getElementById(`card${i + 1}`);
		card.addEventListener("click", () => getDetailInfo(sol));
	});
}

getPredictedTemp();
setRandomBackground();
getMarsWeather();

fetch(`https://api.nasa.gov/insight_weather/?api_key=${API_KEY}&feedtype=json&ver=1.0`)
	.then(res => res.json())
  	.then(data => {
    	const sols = Object.keys(data).slice(0, -2);
		const ctx = document.getElementById('weatherChart').getContext('2d');
    	new Chart(ctx, {
      		type: 'line',
      		data: {
        		labels: sols,
        		datasets: [{
          			label: 'Temperature',
          			data: sols.map(sol => data[sol]?.AT?.av ?? null),
          			borderColor: 'rgba(255, 255, 255, 0.9)',
					backgroundColor: 'rgba(255, 255, 255, 0.4)',	
          			borderWidth: 2
        		}]
      		},
      		options: {
        		responsive: true,
				plugins: {
					legend: {
					display: false
					}	
				}
				,
        		scales: {
					x: {
						ticks: {
							color: 'white'
						}
					},
					y: { 
						ticks: {
							color: 'white'
						},
						beginAtZero: false 
					}
				}
      	}
    });
});