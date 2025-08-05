document.querySelector('#search').addEventListener('submit', async (event) => {
    event.preventDefault();

    const cityName = document.querySelector('#city_name').value;

    if (!cityName) {
        document.querySelector("#weather").classList.remove('show');
        showAlert('Você precisa digitar uma cidade...');
        return;
    }

    const openWeatherApiKey = '8a60b2de14f7a17c7a11706b2cfcd87c';
    const openWeatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURI(cityName)}&appid=${openWeatherApiKey}&units=metric&lang=pt_br`

    const results = await fetch(openWeatherApiUrl);
    const json = await results.json();

    if (json.cod === 200) {
        showInfo({
            city: json.name,
            country: json.sys.country,
            temp: json.main.temp,
            tempMax: json.main.temp_max,
            tempMin: json.main.temp_min,
            description: json.weather[0].description,
            tempIcon: json.weather[0].icon,
            windSpeed: json.wind.speed,
            humidity: json.main.humidity,
            coord: json.coord,
            visibility: json.visibility
        });

        fetchCityImage(cityName);
    } else {
        document.querySelector("#weather").classList.remove('show');
        showAlert(`
            Não foi possível localizar...

            <img src="src/images/404.svg"/>
        `);

        document.body.style.backgroundImage = 'none';
    }
});

function showAlert(msg) {
    document.querySelector('#alert').innerHTML = msg;
}



async function fetchAirQualityData(lat, lon) {
    const openWeatherApiKey = '8a60b2de14f7a17c7a11706b2cfcd87c';
    const airPollutionApiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}`;

    try {
        const response = await fetch(airPollutionApiUrl);
        const data = await response.json();

        if (data.list && data.list.length > 0) {
            const aqi = data.list[0].main.aqi;
            const pm2_5 = data.list[0].components.pm2_5;
            const o3 = data.list[0].components.o3;
            const co = data.list[0].components.co;

            let aqiDescription = '';
            switch (aqi) {
                case 1: aqiDescription = 'Boa'; break;
                case 2: aqiDescription = 'Razoável'; break;
                case 3: aqiDescription = 'Moderada'; break;
                case 4: aqiDescription = 'Ruim'; break;
                case 5: aqiDescription = 'Muito Ruim'; break;
                default: aqiDescription = 'Desconhecida';
            }

            return {
                aqi: aqi,
                aqiDescription: aqiDescription,
                pm2_5: pm2_5,
                o3: o3,
                co: co,
            };
        }
        return null;
    } catch (error) {
        console.error('Erro ao buscar dados de qualidade do ar:', error);
        return null;
    }
}


async function fetchUvIndexData(lat, lon) {
    const openWeatherApiKey = '8a60b2de14f7a17c7a11706b2cfcd87c';
    const oneCallApiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily,alerts&appid=${openWeatherApiKey}`;

    try {
        const response = await fetch(oneCallApiUrl);
        const data = await response.json();

        if (data.current && data.current.uvi !== undefined) {
            return data.current.uvi;
        }
        return null;
    } catch (error) {
        console.error('Erro ao buscar Índice UV:', error);
        return null;
    }
}

function generateAirQualityHealthRecommendations(airQualityData) {
    let recommendations = [];
    if (!airQualityData) {
        recommendations.push("Não foi possível obter informações sobre a qualidade do ar no momento.");
        return recommendations;
    }

    const aqi = airQualityData.aqi;
    const pm2_5 = airQualityData.pm2_5;
    const o3 = airQualityData.o3;
    const co = airQualityData.co;

    if (aqi === 5) {
        recommendations.push("A qualidade do ar está muito ruim. Evite atividades ao ar livre e feche as janelas.");
        recommendations.push("Pessoas com doenças respiratórias ou cardíacas devem permanecer em ambientes fechados.");
    } else if (aqi === 4) {
        recommendations.push("A qualidade do ar está ruim. Pessoas sensíveis (crianças, idosos, asmáticos) devem evitar atividades ao ar livre.");
        recommendations.push("Considere usar máscara se precisar sair.");
    } else if (aqi === 3) {
        recommendations.push("A qualidade do ar é moderada. Pessoas com doenças respiratórias devem ter cautela e limitar atividades ao ar livre.");
    } else {
        recommendations.push("A qualidade do ar está boa. Aproveite as atividades ao ar livre!");
    }


    if (pm2_5 > 25) {
        recommendations.push("Níveis elevados de partículas finas (PM2.5) podem afetar a respiração. Evite exercícios intensos ao ar livre.");
    }
    if (o3 > 100) {
        recommendations.push("Níveis de ozônio elevados. Pode causar irritação respiratória, especialmente em crianças, idosos e pessoas com asma.");
    }
    if (co > 10000) {
        recommendations.push("Níveis de monóxido de carbono elevados. Evite áreas com tráfego intenso e garagens fechadas.");
    }
    return recommendations;
}


function generateUvIndexHealthRecommendations(uvIndex) {
    let recommendations = [];
    if (uvIndex === null || uvIndex === undefined) {
        return recommendations;
    }

    if (uvIndex >= 8) {
        recommendations.push("Índice UV muito alto. Evite exposição solar entre 10h e 16h.");
        recommendations.push("Use protetor solar (FPS 30+), chapéu de aba larga e óculos de sol.");
        recommendations.push("Procure sombra sempre que possível.");
    } else if (uvIndex >= 6) {
        recommendations.push("Índice UV alto. Use protetor solar (FPS 30+), chapéu e óculos de sol.");
        recommendations.push("Reduza o tempo de exposição ao sol, especialmente ao meio-dia.");
    } else if (uvIndex >= 3) {
        recommendations.push("Índice UV moderado. Use protetor solar e óculos de sol ao ar livre.");
    } else {
        recommendations.push("Índice UV baixo. A proteção solar ainda é recomendada para longas exposições.");
    }
    return recommendations;
}


async function showInfo(json){
    showAlert('');

    document.querySelector("#weather").classList.add('show');

    document.querySelector('#city_name_display').innerHTML = json.city;
    const countryFlagImg = document.querySelector('#country_flag_img');
    countryFlagImg.src = `https://flagsapi.com/${json.country}/flat/32.png`;
    countryFlagImg.alt = `Bandeira de ${json.country}`;


    document.querySelector('#temp_value').innerHTML = `${json.temp.toFixed(1).toString().replace('.', ',')} <sup>C°</sup>`;
    document.querySelector('#temp_description').innerHTML = `${json.description}`;
    document.querySelector('#temp_img').setAttribute('src', `https://openweathermap.org/img/wn/${json.tempIcon}@2x.png`)

    document.querySelector('#temp_max').innerHTML = `${json.tempMax.toFixed(1).toString().replace('.', ',')} <sup>C°</sup>`;
    document.querySelector('#temp_min').innerHTML = `${json.tempMin.toFixed(1).toString().replace('.', ',')} <sup>C°</sup>`;
    document.querySelector('#humidity').innerHTML = `${json.humidity}%`;
    document.querySelector('#wind').innerHTML = `${json.windSpeed.toFixed(1)}km/h`;


    const airQualityValueElement = document.querySelector('#air_quality_value');
    const airQualityIcon = document.querySelector('#air_quality_icon');
    if (json.coord) {
        const airQualityData = await fetchAirQualityData(json.coord.lat, json.coord.lon);
        if (airQualityData) {
            airQualityValueElement.innerHTML = `${airQualityData.aqiDescription} (AQI: ${airQualityData.aqi})`;
            if (airQualityData.aqi >= 4) {
                airQualityIcon.style.color = '#dc2626';
            } else if (airQualityData.aqi === 3) {
                airQualityIcon.style.color = '#fbbf24';
            } else {
                airQualityIcon.style.color = '#22c55e';
            }
        } else {
            airQualityValueElement.innerHTML = 'N/A';
            airQualityIcon.style.color = '#6b7280';
        }
    } else {
        airQualityValueElement.innerHTML = 'N/A';
        airQualityIcon.style.color = '#6b7280';
    }

    const uvIndexValueElement = document.querySelector('#uv_index_value');
    const uvIndexIcon = document.querySelector('#uv_index_icon');
    let currentUvIndex = null;
    if (json.coord) {
        currentUvIndex = await fetchUvIndexData(json.coord.lat, json.coord.lon);
        if (currentUvIndex !== null) {
            let uvDescription = '';
            if (currentUvIndex <= 2) uvDescription = 'Baixo';
            else if (currentUvIndex <= 5) uvDescription = 'Moderado';
            else if (currentUvIndex <= 7) uvDescription = 'Alto';
            else if (currentUvIndex <= 10) uvDescription = 'Muito Alto';
            else uvDescription = 'Extremo';

            uvIndexValueElement.innerHTML = `${currentUvIndex} (${uvDescription})`;

            if (currentUvIndex >= 6) {
                uvIndexIcon.style.color = '#dc2626';
            } else if (currentUvIndex >= 3) {
                uvIndexIcon.style.color = '#fbbf24';
            } else {
                uvIndexIcon.style.color = '#22c55e';
            }
        } else {
            uvIndexValueElement.innerHTML = 'N/A';
            uvIndexIcon.style.color = '#6b7280';
        }
    } else {
        uvIndexValueElement.innerHTML = 'N/A';
        uvIndexIcon.style.color = '#6b7280';
    }


    const recommendationsList = document.querySelector('#health_recommendations ul');
    recommendationsList.innerHTML = '';
    document.querySelector('#health_recommendations').style.display = 'block';

    let currentHealthRecommendations = [];


    if (json.temp > 30) {
        currentHealthRecommendations.push("Beba bastante água para evitar desidratação.");
        currentHealthRecommendations.push("Evite exposição prolongada ao sol, especialmente entre 10h e 16h.");
        currentHealthRecommendations.push("Use roupas leves e claras.");
    } else if (json.temp < 10) {
        currentHealthRecommendations.push("Agasalhe-se bem para evitar hipotermia.");
        currentHealthRecommendations.push("Mantenha-se hidratado com bebidas quentes.");
        currentHealthRecommendations.push("Proteja extremidades como mãos, pés e cabeça.");
    } else if (json.temp >= 25 && json.temp <= 30) {
        currentHealthRecommendations.push("Mantenha-se hidratado e use protetor solar se for se expor ao sol.");
    } else if (json.temp >= 10 && json.temp < 15) {
        currentHealthRecommendations.push("Vista-se em camadas para se adaptar às variações de temperatura.");
    }


    if (json.humidity > 80) {
        currentHealthRecommendations.push("A alta umidade pode aumentar a sensação de calor e desconforto.");
        currentHealthRecommendations.push("Pode haver proliferação de mofo e ácaros; atenção para alérgicos.");
        currentHealthRecommendations.push("Mantenha ambientes ventilados para evitar umidade excessiva.");
    } else if (json.humidity < 30) {
        currentHealthRecommendations.push("A baixa umidade pode ressecar a pele, olhos e vias respiratórias.");
        currentHealthRecommendations.push("Use hidratante, colírio e beba bastante água.");
        currentHealthRecommendations.push("Considere usar um umidificador de ar em ambientes fechados.");
    }


    const descriptionLower = json.description.toLowerCase();
    if (descriptionLower.includes('chuva') || descriptionLower.includes('garoa') || descriptionLower.includes('tempestade')) {
        currentHealthRecommendations.push("Leve um guarda-chuva e use calçados impermeáveis.");
        currentHealthRecommendations.push("Cuidado com pisos escorregadios e áreas alagadas.");
        currentHealthRecommendations.push("Evite sair durante tempestades com raios.");
    } else if (descriptionLower.includes('ensolarado') || descriptionLower.includes('céu limpo')) {
        currentHealthRecommendations.push("Use protetor solar (FPS 30+) e reaplique a cada 2 horas.");
        currentHealthRecommendations.push("Óculos de sol são recomendados para proteger os olhos da radiação UV.");
        currentHealthRecommendations.push("Chapéu ou boné ajudam a proteger o rosto e o couro cabeludo.");
    } else if (descriptionLower.includes('nublado') || descriptionLower.includes('nuvens')) {
        currentHealthRecommendations.push("Mesmo com tempo nublado, a radiação UV pode ser alta. Use protetor solar.");
    } else if (descriptionLower.includes('neve')) {
        currentHealthRecommendations.push("Use roupas térmicas e impermeáveis para se proteger do frio e da umidade.");
        currentHealthRecommendations.push("Cuidado ao caminhar em superfícies escorregadias devido ao gelo.");
    }


    if (json.visibility !== undefined) {
        const visibilityKm = json.visibility / 1000;
        if (visibilityKm < 1) {
            currentHealthRecommendations.push("Visibilidade muito baixa. Tenha cautela ao dirigir ou realizar atividades ao ar livre.");
            currentHealthRecommendations.push("Se estiver dirigindo, use faróis baixos e mantenha distância de segurança.");
        } else if (visibilityKm < 5) {
            currentHealthRecommendations.push("Visibilidade reduzida. Esteja atento ao seu redor, especialmente em estradas.");
        }
    }

    if (json.coord) {
        const airQualityDataForRecs = await fetchAirQualityData(json.coord.lat, json.coord.lon);
        const airQualityRecs = generateAirQualityHealthRecommendations(airQualityDataForRecs);
        currentHealthRecommendations = currentHealthRecommendations.concat(airQualityRecs);
    } else {
        currentHealthRecommendations.push("Coordenadas não disponíveis para verificar a qualidade do ar para recomendações.");
    }


    if (currentUvIndex !== null) {
        const uvRecs = generateUvIndexHealthRecommendations(currentUvIndex);
        currentHealthRecommendations = currentHealthRecommendations.concat(uvRecs);
    } else {
        currentHealthRecommendations.push("Não foi possível obter o Índice UV para recomendações.");
    }



    if (currentHealthRecommendations.length > 0) {
        currentHealthRecommendations.forEach(rec => {
            recommendationsList.innerHTML += `<li>${rec}</li>`;
        });
    } else {
        recommendationsList.innerHTML = '<li>Nenhuma recomendação de saúde específica para as condições atuais.</li>';
    }
}
