let uInput = document.getElementById('userInput');
if(navigator.userAgent.match(/firefox|fxios/i))
{
    uInput.style.all = initial;
    uInput.style.whiteSpace = 'pre-wrap';
}
else
{
    uInput.style.whiteSpace = 'nowrap';
}