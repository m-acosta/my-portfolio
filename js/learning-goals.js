document.getElementById('game-select').addEventListener('change', function () {
    const section = document.querySelector(this.value);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
});
