const searchButton = document.querySelector('.search-button');
const resultsContainer = document.querySelector('.result-con');
const foundMessage = document.querySelector('.found');
const speciesSelect = document.querySelector('#species');
const sexSelect = document.querySelector('#sex');
const distanceSelect = document.querySelector('#distance');
const zipInput = document.querySelector('#zip');
const API_ENDPOINT = '../api/rescue-groups';

function setMessage(message, isError = false) {
    foundMessage.textContent = message;
    foundMessage.classList.toggle('error', isError);
}

function getSearchValues() {
    return {
        species: speciesSelect.value,
        sex: sexSelect.value,
        distance: distanceSelect.value,
        zip: zipInput.value.trim()
    };
}

function validateSearch({ species, distance, zip }) {
    if (!species || !distance || !zip) {
        return 'Choose a species, distance, and ZIP code to search.';
    }

    if (!/^\d{5}$/.test(zip)) {
        return 'Enter a valid 5-digit ZIP code.';
    }

    return '';
}

function getAnimals(payload) {
    return Array.isArray(payload.data) ? payload.data : [];
}

function getAnimalAttributes(animal) {
    return animal.attributes || animal;
}

function getAnimalImage(animal) {
    const attributes = getAnimalAttributes(animal);
    return attributes.pictureThumbnailUrl || attributes.pictureUrl || '';
}

function renderAnimals(payload) {
    const animals = getAnimals(payload);
    resultsContainer.innerHTML = '';

    animals.forEach((animal) => {
        const attributes = getAnimalAttributes(animal);
        const id = animal.id || attributes.id;
        const name = attributes.name || 'Available pet';
        const card = document.createElement('article');
        const link = document.createElement('a');
        const image = document.createElement('img');
        card.className = 'result-card';
        link.href = `./more-info.html?id=${encodeURIComponent(id)}`;
        const imageUrl = getAnimalImage(animal);
        if (imageUrl) image.src = imageUrl;
        else image.hidden = true;
        image.alt = `${name} available for adoption`;
        image.loading = 'lazy';
        link.appendChild(image);
        card.appendChild(link);
        [
            name,
            attributes.sex || 'Sex not listed',
            attributes.ageString || 'Age not listed'
        ].forEach((value) => {
            const paragraph = document.createElement('p');
            paragraph.textContent = value;
            card.appendChild(paragraph);
        });
        resultsContainer.appendChild(card);
    });

    resultsContainer.style.display = animals.length ? 'grid' : 'none';
    return animals.length;
}

async function searchAnimals(values) {
    const params = new URLSearchParams({
        species: values.species,
        sex: values.sex,
        distance: values.distance,
        zip: values.zip
    });
    const response = await fetch(`${API_ENDPOINT}?${params}`);

    if (!response.ok) {
        throw new Error('The RescueGroups search could not be completed.');
    }

    return response.json();
}

searchButton.addEventListener('click', async () => {
    const values = getSearchValues();
    const validationMessage = validateSearch(values);

    if (validationMessage) {
        resultsContainer.style.display = 'none';
        setMessage(validationMessage, true);
        return;
    }

    searchButton.disabled = true;
    setMessage('Searching RescueGroups.org...');

    try {
        const payload = await searchAnimals(values);
        const count = renderAnimals(payload);
        const total = payload.meta?.count ?? count;
        setMessage(count ? `${total} adoptable pets found near ${values.zip}. Showing the first ${count}.` : 'No adoptable pets matched those filters.');
    } catch (error) {
        resultsContainer.style.display = 'none';
        setMessage(error.message, true);
    } finally {
        searchButton.disabled = false;
    }
});
