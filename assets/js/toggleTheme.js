
const toggleTheme = (theme) => {
    const body = document.querySelector('body');
    const editor = document.querySelector('.editor');
    const editor_linenumber = document.querySelector('.editor_linenumber');
    const editor_container_backdrop = document.querySelector('.editor_container_backdrop');
    const editor_container_inputarea = document.querySelector('.editor_container_inputarea');
    if(theme === 'light') // Switch to dark mode
    {
        // BODY
        body.classList.remove('light');
        body.classList.add('dark');
        // EDITOR
        editor.classList.remove('light');
        editor.classList.add('dark');
        // EDITOR LINE NUMBER
        editor_linenumber.classList.remove('light');
        editor_linenumber.classList.add('dark');
        // EDITOR CONTAINER BACKDROP
        editor_container_backdrop.classList.remove('light');
        editor_container_backdrop.classList.add('dark');
        // EDITOR CONTAINER INPUTAREA
        editor_container_inputarea.classList.remove('light');
        editor_container_inputarea.classList.add('dark');
    }
    else // Switch to light mode
    {
        // BODY
        body.classList.remove('dark');
        body.classList.add('light');
        // EDITOR
        editor.classList.remove('dark');
        editor.classList.add('light');
        // EDITOR LINE NUMBER
        editor_linenumber.classList.remove('dark');
        editor_linenumber.classList.add('light');
        // EDITOR CONTAINER BACKDROP
        editor_container_backdrop.classList.remove('dark');
        editor_container_backdrop.classList.add('light');
        // EDITOR CONTAINER INPUTAREA
        editor_container_inputarea.classList.remove('dark');
        editor_container_inputarea.classList.add('light');
    }
}
let theme = 'light';
toggleTheme(theme);