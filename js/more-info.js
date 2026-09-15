const params = new URLSearchParams(window.location.search);
const animalId = params.get('id');
const API_ENDPOINT = '../api/rescue-groups';
const petPhoto = document.querySelector('#pet-photo');
const petName = document.querySelector('.name1-2');
const petSex = document.querySelector('.sex1-2');
const petAge = document.querySelector('.age1-2');
const description = document.querySelector('.pet-background p');
const contactBox = document.querySelector('.contact-box');
const photoPlaceholder = document.querySelector('#pet-photo-placeholder');

function getAnimalAttributes(payload) {
    const animal = Array.isArray(payload.data) ? payload.data[0] : payload.data;
    return animal?.attributes || animal || {};
}

function setContactLine(label, value, href) {
    const paragraph = document.createElement('p');
    paragraph.append(`${label}: `);
    if (value && href) {
        const link = document.createElement('a');
        link.href = href;
        link.textContent = value;
        if (href.startsWith('http')) {
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
        }
        paragraph.appendChild(link);
    } else {
        paragraph.append(value || 'Not listed');
    }
    contactBox.appendChild(paragraph);
}

async function loadAnimal() {
    if (!animalId) {
        throw new Error('No pet was selected. Return to the search page and choose a pet.');
    }

    const response = await fetch(`${API_ENDPOINT}?id=${encodeURIComponent(animalId)}`);
    if (!response.ok) {
        throw new Error('This pet could not be loaded from RescueGroups.org.');
    }

    return getAnimalAttributes(await response.json());
}

loadAnimal()
    .then((animal) => {
        const name = animal.name || 'Available pet';
        document.title = `${name} | PetConnect`;
        petName.textContent = name;
        petSex.textContent = animal.sex || 'Sex not listed';
        petAge.textContent = animal.ageString || 'Age not listed';
        const imageUrl = animal.pictureUrl || animal.pictureThumbnailUrl;
        if (imageUrl) {
            petPhoto.src = imageUrl;
        } else {
            petPhoto.hidden = true;
            photoPlaceholder.hidden = false;
        }
        petPhoto.alt = `${name} available for adoption`;
        description.textContent = animal.description || 'This organization has not provided a description for this pet.';
        contactBox.replaceChildren();
        setContactLine('Phone', animal.contactPhone, animal.contactPhone ? `tel:${animal.contactPhone.replace(/[^+\d]/g, '')}` : '');
        setContactLine('Email', animal.contactEmail, animal.contactEmail ? `mailto:${animal.contactEmail}` : '');
        setContactLine('Website', animal.url, animal.url);
        setContactLine('Address', animal.contactAddress);
        setContactLine('City and State', [animal.contactCity, animal.contactState].filter(Boolean).join(', '));
    })
    .catch((error) => {
        document.querySelector('main').innerHTML = `<p class="api-error">${error.message}</p>`;
    });
