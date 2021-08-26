//evento en el formulario
$('#formulario-ingreso').submit(async (e) => {
    e.preventDefault();
    $('#modal-login small').text(' ');
    const email = document.getElementById("input-email").value;
    const pass = document.getElementById("input-pass").value;
    const token = await getlTokken(email, pass);
    if (token) {
        localStorage.setItem("token", token)
        $('#modal-login small').text('success');
        $('#modal-login').modal('hide');
        $('#nav-login').fadeToggle(1000,
            $('#nav-chile').fadeToggle())
    } else {
        $('#modal-login small').text('Error');
    }



});

//funcion que genera todo el contenido
const generarContenido = async (token) => {
    const total = await getTotal(token);
    const actives = getActivesFromTotal(total);
    console.log(actives);
    drawChart('grafico1', actives, "paises con mas de 10.000 casos activos")
    fillTable('table-data', total)

    $('#home-wrapper').fadeToggle(2000);
    console.log();

}



//funciones para obtener cosas
const getlTokken = async (email, pass) => {
    try {
        const response = await fetch("http://localhost:3000/api/login", {
            method: 'POST',
            body: JSON.stringify({ email: email, password: pass })
        });

        const { token } = await response.json();
        return token;

    } catch (e) {
        console.log(`Error:${e}`);
    }
}

const getTotal = async (token) => {
    try {
        const response = await fetch("http://localhost:3000/api/total", {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        const { data } = await response.json();
        return data;
    } catch (e) {
        console.log(`Error: ${e}`);
    }

}

const getActivesFromTotal = (total) => {
    const countries = [];
    const actives = [];

    total.filter((elementFilter) => elementFilter.active > 10000)
        .sort((a, b) => {
            return b.active - a.active
        })
        .map((elementMap) => {
            countries.push(elementMap.location)
            actives.push(elementMap.active)
        })

    return {
        "countries": countries,
        "active": actives
    }
}

const getDeathsFromTotal = (total) => {


    const countries = [];
    const deaths = [];
    total.filter((elementFilter) => elementFilter.deaths > 50000)
        .sort((a, b) => {
            return b.deaths - a.deaths
        })
        .map((elementMap) => {
            countries.push(elementMap.location)
            deaths.push(elementMap.deaths)
        })

    return {
        "countries": countries,
        "deaths": deaths
    }
}

const getCountrieDetail = async (token, countrie) => {
    try {
        const response = await fetch(`http://localhost:3000/api/countries/${countrie}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        const { data } = await response.json();
        return data;
    } catch (e) {
        console.log(`Error: ${e}`);
    }
}

const getLocalToken = () => {
    return localStorage.getItem("token")
}

//funciones que rellenan cosas del DOM
const drawChart = (chart, data, title) => {
    const config = {
        type: 'bar',
        data: {
            labels: data[0],
            datasets: [{
                label: title,
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                data: data[1],
            }],
        },
        options: {}
    }
    const mychart = new Chart($(`#${chart}`), config)
}

const fillTable = (table, data) => {
    let rows = "";
    console.log(data);
    data.forEach((x) => {
        rows += `<tr>
        <th scope="row">${x.location}</th>
        <td>${x.confirmed}</td>
        <td>${x.deaths}</td>
        <td>${x.recovered}</td>
        <td>${x.active}</td>
        <td>
        <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modal-pais" onclick="modalCountrieDetails('${x.location}','modal-pais')" title="Lo mismo pero un modal">
           Detalles
        </button>
        
    </tr>`
    })


    $(`#${table} tbody`).append(rows)
}

//funciones para llenar y iniciar modals
const modalCountrieDetails = async (location, modal) => {


    $(`#${modal} .modal-body table`)
    const token = getLocalToken();
    const data = await getCountrieDetail(token, location)
    $(`#${modal} #pais`).text(data.location)
    $(`#${modal} #confirmados`).text(data.confirmed)
    $(`#${modal} #muertos`).text(data.deaths)
    $(`#${modal} #recuperados`).text(data.recovered)
    $(`#${modal} #activos`).text(data.active)

}

//Funciones esteticas
const toggleFormAndGraficos = (form, graficos) => {
    $(`#${form}`).toggle();
    $(`#${graficos}`).toggle();
}

//funcion inicial
const init = () => {
    const token = localStorage.getItem("token")
    if (token) {
        $('#nav-chile').fadeToggle()
    }else{
        $('#nav-login').fadeToggle()
    }

        generarContenido(token)
    
}
init();

