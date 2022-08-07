
const toggleTheme = (theme) => {
    const swap = (add, rem) => {
        const everyColoredElements = [
            'html',
            'body',
            '.editor',
            '.editor_linenumber',
            '.editor_container_backdrop',
            '.editor_container_inputarea',
            '.mode-toggle'
        ];
        const swap2 = (name, add, rem) => {
            let element = document.querySelector(name);
            element.classList.add(add);
            element.classList.remove(rem);
        }
        for(const e of everyColoredElements)
        {
            swap2(e, add, rem);
        }
    };
    if(theme === 'dark')
    {
        swap('light', 'dark');
        return 'light';
    }
    swap('dark', 'light');
    return 'dark';
}
let GLOBAL_THEME = 'light';
GLOBAL_THEME = toggleTheme(GLOBAL_THEME);
let eventListen = document.querySelector('.mode-toggle');
eventListen.innerHTML = GLOBAL_THEME === 'dark' ? 'Light theme' : 'Dark theme';
eventListen.addEventListener('click', (e) => {
    GLOBAL_THEME = toggleTheme(GLOBAL_THEME);
    eventListen.innerHTML = GLOBAL_THEME === 'dark' ? 'Light theme' : 'Dark theme';
});