// Hamburger Button

const hamburgerBtn = document.querySelector(".hamburger-button")
const optionMenu = document.querySelector(".hamburger-con")
const exitBtn = document.querySelector(".exit button")

hamburgerBtn.addEventListener('click', () => {
    
    if (optionMenu.style.display == "none"){
        optionMenu.style.display = "flex"
        
    }
    else{
        optionMenu.style.display = "none"
    }
})

exitBtn.addEventListener('click', () => {
    
    optionMenu.style.display = "none"
    hamburgerBtn.style.display = "block"

})

// Location

const lonLatKey = '65e3ae9323d14c73bd9b88373bcdd36c'
let lonLatUrl = `https://api.geoapify.com/v1/ipinfo?&apiKey=${lonLatKey}`

async function getLocation() {
    try {
        const locationResponse = await fetch(lonLatUrl)
        const locationData = await locationResponse.json()
        
        lat = locationData.location.latitude
        lon = locationData.location.longitude
        curCity = locationData.city.name
        curState = locationData.state.name

        console.log(lat,lon)

        const coords = [lat, lon]

        return coords


    } catch (error) {
        console.error(error)
    }
}

