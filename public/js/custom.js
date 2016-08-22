// Gather each of our accordion components.
document.querySelectorAll('.accordion').forEach(($accordion) => {
    const $show = $accordion.querySelector('.show');
    const $hide = $accordion.querySelector('.hide');
    const $content = $accordion.querySelector('article');

    function toggle() {
        [$hide, $show, $content].forEach(($el) => {
            $el.dataset.visible = !($el.dataset.visible == 'true');
        });
    }

    $show.addEventListener('click', toggle);
    $hide.addEventListener('click', toggle);
});
