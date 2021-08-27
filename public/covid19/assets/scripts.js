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
        $('#nav-login').fadeToggle(() => $('#nav-chile').fadeToggle())
        $('#log-out').fadeToggle();

    } else {
        $('#modal-login small').text('Error');
    }



});




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

const getTotal = async () => {
    try {
        const response = await fetch("http://localhost:3000/api/total", {
            method: 'GET',
            headers: {
            }
        })
        const { data } = await response.json();
        return data;
    } catch (e) {
        console.log(`Error: ${e}`);
    }

}

getConfirmedChile = async (token) => {
    try {
        const response = await fetch("http://localhost:3000/api/confirmed", {
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
getDeathsChile = async (token) => {
    try {
        const response = await fetch("http://localhost:3000/api/deaths", {
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
getRecoveredChile = async (token) => {
    try {
        const response = await fetch("http://localhost:3000/api/recovered", {
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

//regresa un arreglo de 2 espacios, el primero tiene un arreglo con los paises, el segundo un arreglo con los casos activos, ordenados correlacionalmente
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
// confirmed deaths recovered
const getConfirmedDeathsRecovered = async (token) => {

    
    

    
    const labels = (await getConfirmedChile(token)).map((x) => x.date);
    
    const data = [(await getConfirmedChile(token)).map((x) => x.total),
        (await getDeathsChile(token)).map((x) => x.total),
        (await getRecoveredChile(token)).map((x) => x.total)]

    return {
        "labels": labels,
        "data": data
    }

}
// const getDeathsFromTotal = (total) => {


//     const countries = [];
//     const deaths = [];
//     total.filter((elementFilter) => elementFilter.deaths > 50000)
//         .sort((a, b) => {
//             return b.deaths - a.deaths
//         })
//         .map((elementMap) => {
//             countries.push(elementMap.location)
//             deaths.push(elementMap.deaths)
//         })

//     return {
//         "countries": countries,
//         "deaths": deaths
//     }
// }

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



//funciones que rellenan cosas del DOM
const newChart = (chart, data, titles, type = 'bar') => {

    if (data[0] == undefined)
        data[0] = [""];
    if (data[1] == undefined)
        data[1] = [0];

    let datasets = [];
    data[1].forEach((x) => {
        datasets.push({
            label: titles.pop(),
            data: x,
        })
    })

    const config = {
        type: type,
        data: {
            labels: data[0],
            datasets: datasets,
        },
        options: {}
    }
    const mychart = new Chart($(`#${chart}`), config)
}

const fillTable = (table, data) => {
    let rows = "";
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

//funciones para llenar modals
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


//funcion que genera contenido por pagina
const generarContenidoHome = async (token) => {
    const total = await getTotal();
    const actives = getActivesFromTotal(total);
    newChart('grafico-muertes-mundo', actives, ["paises con mas de 10.000 casos activos"])
    fillTable('table-data', total)

    $('#home-wrapper').fadeToggle(2000);

}

const generarContenidoChile = async (token) => {
    const total = await getTotal();
    const actives = getActivesFromTotal(total);
    newChart('grafico-muertes-mundo', actives, ["paises con mas de 10.000 casos activos"])
    fillTable('table-data', total)

    $('#home-wrapper').fadeToggle(2000);

}
// funcion para cerrar sesion

const logout = () => {
    localStorage.removeItem("token");
    $('#nav-chile').fadeToggle(() => $('#nav-login').fadeToggle())
    $('#log-out').fadeToggle();
}

// funcion para obtener el token local
const getLocalToken = () => {
    return localStorage.getItem("token")
}

// funcion inicial
const init = async () => {
    const token = localStorage.getItem("token")
    let x;
    if (token) {
        $('#nav-chile').fadeToggle()
        $('#log-out').fadeToggle()
         getConfirmedDeathsRecovered(token).then(x=>console.log(x))
    } else {
        $('#nav-login').fadeToggle()
    }

    generarContenidoHome(token)

}
init();




