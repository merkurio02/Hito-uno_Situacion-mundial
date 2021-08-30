/* *****
Event listener
***** */

//Submit en el formularion de login/ingreso
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
        $('#home-wrapper').fadeToggle(()=> generarContenidoChile())

    } else {
        $('#modal-login small').text('Error de credenciales');
    }
});


/* *****
funciones que consumen api y retornan data
***** */

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
const getConfirmedChile = async (token) => {
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
const getDeathsChile = async (token) => {
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
const getRecoveredChile = async (token) => {
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

/*
New Chart dibuja un grafico en el canvas especificado: 
Recive : el ID del canvas en el DOM
titulo/s de los conjuntos de datos a graficar,
un objeto con los datos a graficar: 
{
    labels:[labels de los puntos del eje X],
    data: [[datos],[datos 2 opcional],[ datos n opcional]]
}
*/
const newChart = (canvas, data, titles, type = 'bar') => {

    if (data.labels.length == 0)
        data['labels'] = [""];
    if (data.data.length == 0)
        data['data'] = [0];

    let datasets = [];

    data['data'].forEach((x) => {
        datasets.push({
            label: titles.pop(),
            data: x,
            // borderColor: 
            //     'rgb(255, 99, 132)',
            tension: 0.2
        })
    })

    const config = {
        type: type,
        data: {
            labels: data['labels'],
            datasets: datasets,
        },
        options: {}
    }
    const mychart = new Chart($(`#${canvas}`), config)
}


/* *****
funciones que consumen api mediante funciones y transforman los datos a un formato utilizable con newChart()
***** */

/*
regresa un objeto con 2 propiedades, labels: tiene un arreglo con nombres de los paises
data: un arreglo con los casos activos, ordenados correlacionalmente con labels
 */
const getActivesFromTotalToChart = (total) => {

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
        "labels": countries,
        "data": actives
    }
}
/*
regresa un objeto con 2 propiedades, labels: tiene un arreglo de texto con las fechas
 data: un arreglo compuesto por un arreglo con los casos confirmados, un arreglo con los datos de muertes, y un arreglo con el numero de recuperados, todos ordenados correlacionalmente con las fechas en labels
*/
const getConfirmedDeathsRecoveredToChart = async (token) => {

    const confirmed = await getConfirmedChile(token);
    const deaths = await getDeathsChile(token);
    const recovered = await getRecoveredChile(token)

    const labels = confirmed.map((x) => x.date);
    const data = [confirmed.map((x) => x.total),
    deaths.map((x) => x.total),
    recovered.map((x) => x.total)]

    return {
        "labels": labels,
        "data": data
    }

}


/* *****
Funciones que modifican directamente el DOM
***** */

const fillTable = (table, data) => {
    let rows = "";
    $(`#${table} tbody`).html("");
    data.forEach((x) => {
        rows += `<tr>
        <th scope="row">${x.location}</th>
        <td>${x.confirmed}</td>
        <td>${x.deaths}</td>
        <td>${x.recovered}</td>
        <td>${x.active}</td>
        <td>
        <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modal-pais" onclick="setModalCountrieDetails('${x.location}','modal-pais')" title="Lo mismo pero un modal">
           Detalles
        </button>
        
    </tr>`
    })


    $(`#${table} tbody`).append(rows)
}

const setModalCountrieDetails = async (location, modal) => {


    $(`#${modal} .modal-body table`)
    const token = getLocalToken();
    const data = await getCountrieDetail(token, location)

    $(`#${modal} #pais`).text(data.location)
    $(`#${modal} #confirmados`).text(data.confirmed)
    $(`#${modal} #muertos`).text(data.deaths)
    $(`#${modal} #recuperados`).text(data.recovered)
    $(`#${modal} #activos`).text(data.active)

}

//despliege de contenido en HOME
const generarContenidoHome = async () => {
    $('#loading-ico').slideDown();
    const total = await getTotal();
    const actives = getActivesFromTotalToChart(total);

    
    $('#canvas-home').html("");
    $('#canvas-home').html('<canvas id="grafico-muertes-mundo"></canvas>');
    $('#loading-ico').slideUp();
    newChart('grafico-muertes-mundo', actives, ["paises con mas de 10.000 casos activos"])
    fillTable('table-data', total)
    $('#home-wrapper').fadeIn(() => {
        $('#table-wrapper').slideDown(3000)
    });

}

//despliege de contenido de CHILE
const generarContenidoChile = async () => {
    $('#loading-ico').slideDown();

    const token=getLocalToken();

    const cdr = await getConfirmedDeathsRecoveredToChart(token);
    $('#loading-ico').slideUp();
    $('#canvas-chile').html("");
    $('#canvas-chile').html('<canvas id="grafico-chile"></canvas>');
    newChart('grafico-chile', cdr, ['Confirmados', 'Muertos', 'Recuperados'], 'line')

    $('#chile-wrapper').fadeIn()
    

}

/* *****
Funciones que modifican directamente el token local
***** */

//obtener el token local
const getLocalToken = () => {
    return localStorage.getItem("token")
}
//eliminar token local; cerrar sesion
const logout = () => {
    localStorage.removeItem("token");
    callHome();
    $('#nav-chile').fadeToggle(() => $('#nav-login').fadeToggle())
    $('#log-out').fadeToggle();
}


/* *****
Links del lavbar
***** */

//home

const callHome=()=>{
    $('#chile-wrapper').fadeOut();
    generarContenidoHome();
}
//chile
const callChile=()=>{
    $('#home-wrapper').fadeOut();
    generarContenidoChile();
}

/* *****
Funciones inicial
***** */
const init = async () => {
    const token = localStorage.getItem("token")
    let x;
    if (token) {
        $('#nav-chile').fadeIn()
        $('#log-out').fadeIn()

    } else {
        $('#nav-login').fadeIn()
    }

    generarContenidoHome()

}
init();




