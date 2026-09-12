const menuButton = document.querySelector('.hamburger-button');
const menu = document.querySelector('.hamburger-con');
const closeButton = document.querySelector('.exit button');

if (menuButton && menu) {
    const setMenuState = (isOpen) => {
        menu.classList.toggle('is-open', isOpen);
        menuButton.setAttribute('aria-expanded', String(isOpen));
    };

    menuButton.addEventListener('click', () => {
        setMenuState(!menu.classList.contains('is-open'));
    });

    closeButton?.addEventListener('click', () => setMenuState(false));

    menu.querySelectorAll('a, button[type="submit"]').forEach((item) => {
        item.addEventListener('click', () => setMenuState(false));
    });
}
