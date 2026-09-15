const searchButton = document.querySelector('.search-button');
const resultsContainer = document.querySelector('.result-con');
const foundMessage = document.querySelector('.found');
const speciesSelect = document.querySelector('#species');
const sexSelect = document.querySelector('#sex');
const distanceSelect = document.querySelector('#distance');
const zipInput = document.querySelector('#zip');
const API_ENDPOINT = '../api/rescue-groups';

const requestedSpecies = new URLSearchParams(window.location.search).get('species');
if ([...speciesSelect.options].some((option) => option.value === requestedSpecies)) {
    speciesSelect.value = requestedSpecies;
}

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
    return attributes.pictureUrl || attributes.pictureThumbnailUrl || '';
}

function hasContactInfo(animal) {
    const attributes = getAnimalAttributes(animal);
    return [
        attributes.contactEmail,
        attributes.contactPhone,
        attributes.contactAddress,
        attributes.contactCity,
        attributes.contactState,
    ].some((value) => {
        if (typeof value === 'string') return value.trim().length > 0;
        if (Array.isArray(value)) return value.length > 0;
        return value !== null && value !== undefined;
    });
}

function renderAnimals(payload) {
    const animals = getAnimals(payload).filter(hasContactInfo);
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
        if (imageUrl) {
            image.src = imageUrl;
            image.alt = `${name} available for adoption`;
            image.loading = 'lazy';
            image.decoding = 'async';
            link.appendChild(image);
        } else {
            const placeholder = document.createElement('div');
            placeholder.className = 'result-card-placeholder';
            placeholder.textContent = 'No photo available';
            link.appendChild(placeholder);
        }
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
    if (window.location.protocol === 'file:') {
        throw new Error('The API proxy is unavailable from a file. Run netlify dev or deploy this site to Netlify.');
    }

    let response;
    try {
        response = await fetch(`${API_ENDPOINT}?${params}`);
    } catch {
        throw new Error('The API proxy could not be reached. Run netlify dev or deploy this site to Netlify.');
    }

    if (!response.ok) {
        let details = '';
        try {
            const errorPayload = await response.json();
            details = errorPayload.error || '';
        } catch {
            details = '';
        }
        throw new Error(details || `RescueGroups search failed with status ${response.status}.`);
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
        setMessage(count ? `${count} adoptable pets with contact information found near ${values.zip}.` : 'No adoptable pets with contact information matched those filters.');
    } catch (error) {
        resultsContainer.style.display = 'none';
        setMessage(error.message, true);
    } finally {
        searchButton.disabled = false;
    }
});
