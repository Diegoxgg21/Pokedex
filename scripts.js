let modoFavoritos = false;

const contenedor = document.getElementById("contenedor");
const buscarBtn = document.getElementById("buscarBtn");
const resetBtn = document.getElementById("resetBtn");
const verFavoritosBtn = document.getElementById("verFavoritosBtn");
const inputBusqueda = document.getElementById("pokemonInput");

buscarBtn.addEventListener("click", buscarPokemon);
resetBtn.addEventListener("click", cargarPokemones);
verFavoritosBtn.addEventListener("click", mostrarFavoritos);

inputBusqueda.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        buscarPokemon();
    }
});

async function cargarPokemones() {
    modoFavoritos = false;
    contenedor.innerHTML = "<p>Cargando...</p>";

    try {
        const respuesta = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
        const data = await respuesta.json();

        const promesas = data.results.map(pokemon =>
            fetch(pokemon.url).then(res => res.json())
        );

        const pokemones = await Promise.all(promesas);

        contenedor.innerHTML = "";
        pokemones.forEach(pokemon => crearCard(pokemon));

    } catch (error) {
        contenedor.innerHTML = "<p>Error al cargar los Pokémon</p>";
    }
}

async function buscarPokemon() {
    modoFavoritos = false;

    const valor = inputBusqueda.value.toLowerCase();

    if (valor === "") {
        cargarPokemones();
        return;
    }

    contenedor.innerHTML = "<p>Buscando...</p>";

    try {
        const respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon/${valor}`);

        if (!respuesta.ok) throw new Error("No encontrado");

        const data = await respuesta.json();

        contenedor.innerHTML = "";
        crearCard(data);

    } catch {
        contenedor.innerHTML = "<p>Pokémon no encontrado</p>";
    }

    inputBusqueda.value = "";
}

function crearCard(pokemon) {
    const card = document.createElement("div");
    card.classList.add("card");

    const favoritos = obtenerFavoritos();
    const esFavorito = favoritos.includes(pokemon.id);

    if (esFavorito) {
        card.classList.add("favorito");
    }

    card.innerHTML = `
        <h3>${pokemon.name.toUpperCase()}</h3>
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        <p><strong>ID:</strong> ${pokemon.id}</p>
        <p><strong>Tipo:</strong> ${pokemon.types.map(t => t.type.name).join(", ")}</p>
        <button class="fav-btn">
            ${esFavorito ? "Quitar Favorito" : "Agregar a Favoritos"}
        </button>
    `;

    card.addEventListener("click", (e) => {
        if (e.target.classList.contains("fav-btn")) return;
        mostrarDetalle(pokemon);
    });

    const botonFav = card.querySelector(".fav-btn");

    botonFav.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleFavorito(pokemon.id);

        const favoritosActualizados = obtenerFavoritos();
        const ahoraEsFavorito = favoritosActualizados.includes(pokemon.id);

        if (modoFavoritos && !ahoraEsFavorito) {
            card.remove();

            if (contenedor.children.length === 0) {
                contenedor.innerHTML = "<p>No tienes favoritos aún</p>";
            }

            return;
        }

        botonFav.textContent = ahoraEsFavorito
            ? "Quitar Favorito"
            : "Agregar a Favoritos";

        card.classList.toggle("favorito");
    });

    contenedor.appendChild(card);
}

function mostrarDetalle(pokemon) {
    contenedor.innerHTML = "";

    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
        <h2>${pokemon.name.toUpperCase()}</h2>
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        <p><strong>ID:</strong> ${pokemon.id}</p>
        <p><strong>Tipo:</strong> ${pokemon.types.map(t => t.type.name).join(", ")}</p>
        <p><strong>Altura:</strong> ${pokemon.height}</p>
        <p><strong>Peso:</strong> ${pokemon.weight}</p>
        <p><strong>Habilidades:</strong> ${pokemon.abilities.map(a => a.ability.name).join(", ")}</p>
        <button id="volverBtn">Volver</button>
    `;

    contenedor.appendChild(card);

    document.getElementById("volverBtn").addEventListener("click", () => {
        cargarPokemones();
    });
}

function obtenerFavoritos() {
    return JSON.parse(localStorage.getItem("favoritos")) || [];
}

function toggleFavorito(id) {
    let favoritos = obtenerFavoritos();

    if (favoritos.includes(id)) {
        favoritos = favoritos.filter(fav => fav !== id);
    } else {
        favoritos.push(id);
    }

    localStorage.setItem("favoritos", JSON.stringify(favoritos));
}

async function mostrarFavoritos() {
    modoFavoritos = true;
    contenedor.innerHTML = "<p>Cargando favoritos...</p>";

    const favoritos = obtenerFavoritos();

    if (favoritos.length === 0) {
        contenedor.innerHTML = "<p>No tienes favoritos aún</p>";
        return;
    }

    try {
        const promesas = favoritos.map(id =>
            fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then(res => res.json())
        );

        const pokemones = await Promise.all(promesas);

        contenedor.innerHTML = "";
        pokemones.forEach(pokemon => crearCard(pokemon));

    } catch {
        contenedor.innerHTML = "<p>Error al cargar favoritos</p>";
    }
}

cargarPokemones();