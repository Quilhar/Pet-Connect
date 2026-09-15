const API_URL = 'https://api.rescuegroups.org/v5/public/animals/search/available/';
const DETAIL_URL = 'https://api.rescuegroups.org/v5/public/animals';

function addContactDetails(payload) {
    const included = Array.isArray(payload.included) ? payload.included : [];
    const animals = Array.isArray(payload.data) ? payload.data : [payload.data];

    animals.filter(Boolean).forEach((animal) => {
        const relationships = animal.relationships || {};
        const organizationId = relationships.orgs?.data?.[0]?.id;
        const locationId = relationships.locations?.data?.[0]?.id;
        const pictureIds = relationships.pictures?.data?.map((picture) => picture.id) || [];
        const organization = included.find((item) => item.type === 'orgs' && item.id === organizationId)?.attributes || {};
        const location = included.find((item) => item.type === 'locations' && item.id === locationId)?.attributes || {};
        const picture = included
            .filter((item) => item.type === 'pictures' && pictureIds.includes(item.id))
            .sort((first, second) => (first.attributes?.order || 0) - (second.attributes?.order || 0))[0]?.attributes || {};
        const pictureUrl = picture.large?.url || picture.original?.url || '';
        const pictureThumbnailUrl = picture.small?.url || '';
        const attributes = animal.attributes || {};

        animal.attributes = {
            ...attributes,
            pictureUrl: attributes.pictureUrl || pictureUrl,
            pictureThumbnailUrl: attributes.pictureThumbnailUrl || pictureThumbnailUrl,
            contactEmail: attributes.contactEmail || organization.email || '',
            contactPhone: attributes.contactPhone || organization.phone || location.phone || '',
            contactAddress: attributes.contactAddress || organization.address1 || organization.address || location.address1 || location.address || '',
            contactCity: attributes.contactCity || organization.city || location.city || '',
            contactState: attributes.contactState || organization.state || location.state || '',
            url: attributes.url || organization.url || ''
        };
    });

    return payload;
}

const jsonResponse = (statusCode, body) => ({
    statusCode,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
    },
    body: JSON.stringify(body)
});

exports.handler = async (event) => {
    const apiKey = process.env.RESCUE_GROUPS_API_KEY;

    if (!apiKey) {
        return jsonResponse(500, { error: 'RESCUE_GROUPS_API_KEY is not configured.' });
    }

    const id = event.queryStringParameters?.id;
    const query = event.queryStringParameters || {};
    const filters = [];
    const speciesViews = {
        Cat: 'cats',
        Dog: 'dogs',
        Rabbit: 'rabbits',
        Bird: 'birds',
        Fish: 'fish',
        Ferret: 'ferrets',
        'Guinea Pig': 'guineapigs',
        Hamster: 'hamsters',
        Horse: 'horses',
        Lizard: 'lizards',
        Turtle: 'turtles'
    };

    if (!id) {
        if (query.species && speciesViews[query.species]) {
            filters.push({
                fieldName: 'species.plural',
                operation: 'equal',
                criteria: speciesViews[query.species]
            });
        }
        if (query.sex && query.sex !== 'no-pref') {
            filters.push({
                fieldName: 'animals.sex',
                operation: 'equal',
                criteria: query.sex
            });
        }
    }

    const fields = [
        'name', 'species', 'sex', 'ageString', 'description', 'pictureThumbnailUrl',
        'pictureUrl', 'url', 'contactEmail', 'contactPhone', 'contactAddress',
        'contactCity', 'contactState', 'distance'
    ].join(',');
    const searchParams = new URLSearchParams({
        page: '1',
        limit: '250',
        sort: '-animals.createdDate',
        include: 'orgs,locations,pictures',
        'fields[animals]': fields
    });
    const filterRadius = query.zip && query.distance !== 'no-limit' ? {
        postalcode: query.zip,
        miles: query.distance
    } : query.zip ? { postalcode: query.zip } : undefined;
    const requestUrl = id ? `${DETAIL_URL}/${encodeURIComponent(id)}?include=orgs,locations,pictures` : `${API_URL}?${searchParams}`;
    const requestBody = id ? undefined : JSON.stringify({
        data: {
            filters,
            ...(filterRadius ? { filterRadius } : {})
        }
    });

    try {
        const response = await fetch(requestUrl, {
            method: id ? 'GET' : 'POST',
            headers: {
                Authorization: apiKey,
                Accept: 'application/vnd.api+json',
                'Content-Type': 'application/vnd.api+json',
            },
            body: requestBody
        });

        const body = await response.text();
        if (!response.ok) {
            return jsonResponse(response.status, {
                error: 'RescueGroups API request failed.',
                details: body
            });
        }

        let responsePayload;
        try {
            responsePayload = addContactDetails(JSON.parse(body));
        } catch {
            responsePayload = null;
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/vnd.api+json',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-store'
            },
            body: responsePayload ? JSON.stringify(responsePayload) : body
        };
    } catch (error) {
        return jsonResponse(502, {
            error: 'Could not reach RescueGroups API.',
            details: error.message
        });
    }
};
