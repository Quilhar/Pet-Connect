const menuButton = document.querySelector('.hamburger-button');
const menu = document.querySelector('.hamburger-con');
const closeButton = document.querySelector('.exit button');

if (menuButton && menu) {
    const setMenuState = (isOpen) => {
        menu.classList.toggle('is-open', isOpen);
        menuButton.setAttribute('aria-expanded', String(isOpen));
        menuButton.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    };

    menuButton.addEventListener('click', () => {
        setMenuState(!menu.classList.contains('is-open'));
    });

    closeButton?.addEventListener('click', () => setMenuState(false));

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && menu.classList.contains('is-open')) {
            setMenuState(false);
            menuButton.focus();
        }
    });

    menu.querySelectorAll('a, button[type="submit"]').forEach((item) => {
        item.addEventListener('click', () => setMenuState(false));
    });
}
