const controls = [ '\n' ];
const whitespaces = [ ' ', '\t' ];
const symbols = [ '§', '@', '¥', '€', '¬', '&', '|', '#', '^', '*', '$', '%', '±', '=', '+', '-', '*', '/', '\\', '<', '>', '~', '°', '_', '`', '´', '¨', '(', ')', '[', ']', '{', '}' ];
const punctuations = [ '.', ',', ';', ':', '?', '!', '"', '\'', '«', '»' ];
const KEYWORDS = [
    'let', 'new', 'from', 'to', 'static', 'in', 'as', 'do',
    'inside', 'select', 'set', 'get', 'insert', 'delete',
    'define', 'function', 'value', 'use', 'public', 'private',
    'protected', 'readonly', 'import', 'export', 'namespace',
    'const', 'this'
];
const LOGICS = [
    'for', 'foreach', 'while', 'if', 'switch', 'try', 'catch', 'finaly'
];
const LOGIC_CONTROLS = [
    'return', 'break', 'continue'
];
const logs = [];

const syntax = new SyntaxMaker(
    new SyntaxElement('Comment Line',
        new Pattern({ defaultValue: '//',
            isPattern: (i, c, txt) => { return c === '/' && i + 1 < txt.length && txt[i + 1] === '/'; },
            fetch: (index, c, txt) => {
                let result = '//';
                let lastIndex = index;
                for(let i = index + 2; i < txt.length; i++)
                {
                    if(txt[i] === '\n')
                    {
                        break;
                    }
                    result = `${result}${txt[i]}`;
                    lastIndex = i;
                }
                return {
                    content: result,
                    lastIndex: lastIndex
                };
            }
        }),
        (content, toAdd) => `${content}<span class="comment">${toAdd.replaceAll(' ', '&nbsp;')}</span>`
    ),
    new SyntaxElement('Comment Multiline',
        new Pattern({ defaultValue: '/*',
            isPattern: (i, c, txt) => { return txt[i] === '/' && i + 1 < txt.length && txt[i + 1] === '*'; },
            fetch: (index, c, txt) => {
                let result = '/*';
                let lastIndex = index + 1;
                for(let i = index + 2; i < txt.length; i++)
                {
                    result = `${result}${txt[i]}`;
                    lastIndex = i;
                    if(txt[i] === '/' && i - 1 >= 0 && txt[i - 1] === '*')
                    {
                        break;
                    }
                }
                // If we're out of bounds but found no closing 
                if(lastIndex == txt.length - 1 && txt[txt.length - 1] !== '/' && txt[txt.length - 2] !== '*')
                {
                    return {
                        name: 'Comment Multiline',
                        error: true,
                        content: '/*',
                        lastIndex: index + 1
                    };
                }
                return {
                    name: 'Comment Multiline',
                    content: result,
                    lastIndex: lastIndex
                };
            }
        }),
        (content, toAdd, error) => {
            if(error)
            {
                return `${content}<span class="error">${toAdd.replaceAll(' ', '&nbsp;')}</span>`;
            }
            else
            {
                const formatText = (txt) =>  {
                    let rectifiedContent = '';
                    for(let i = 0; i < txt.length; i++)
                    {
                        if(txt[i] === '\n')
                        {
                            rectifiedContent = `${rectifiedContent}</span></p><p><span class="comment">`;
                        }
                        else
                        {
                            rectifiedContent = `${rectifiedContent}${txt[i]}`;
                        }
                    }
                    return `${rectifiedContent}</span>`;
                };
                return `${content}<span class="comment">${formatText(toAdd.replaceAll(' ', '&nbsp;'))}</span>`;
            }
        }
    ),
    new SyntaxElement('String Classic',
        new Pattern({ defaultValue: '\'',
            isPattern: (i, c, txt) => { return c === '\''; },
            fetch: (index, c, txt) => {
                let result = '\'';
                let lastIndex = index;
                let dualSlashIndex = -2; // Should just be negative, the value doesn't matter
                for(let i = index + 1; i < txt.length; i++)
                {
                    result = `${result}${txt[i]}`;
                    lastIndex = i;
                    if(txt[i] === '\'')
                    {
                        if(txt[i - 1] === '\\')
                        {
                            if(dualSlashIndex == i - 1)
                            {
                                break;
                            }
                        }
                        else
                        {
                            break;
                        }
                    }
                    // \ founded and the next is also \
                    if(txt[i] === '\\' && i + 1 < txt.length && txt[i + 1] === '\\')
                    {
                        result = `${result}${txt[i]}`;
                        dualSlashIndex = ++i;
                    }
                }
                // If we're out of bounds but found no closing '
                if(lastIndex == txt.length - 1 && txt[txt.length - 1] !== '\'')
                {
                    return {
                        name: 'String Classic',
                        error: true,
                        content: '\'',
                        lastIndex: index
                    };
                }
                return {
                    name: 'String Classic',
                    content: result,
                    lastIndex: lastIndex
                };
            }
        }),
        (content, toAdd) => {
            let newContent = '';
            let error = false;
            for(let i = 0; i < toAdd.length; i++)
            {
                if(toAdd[i] !== ' ' && toAdd[i] !== '\n')
                {
                    newContent = `${newContent}${Txt.HTMLEncode(toAdd[i])}`;
                }
                else
                {
                    let toWrite = toAdd[i];
                    if(toAdd[i] === '\n')
                    {
                        error = true;
                        toWrite = `</span>\r${toAdd[i]}<span class="error">`;
                    }
                    else if(toAdd[i] === ' ')
                    {
                        toWrite = '&nbsp;';
                    }
                    newContent = `${newContent}${toWrite}`;
                }
            }
            if(error)
            {
                return `${content}<span class="error">${newContent}</span>`;
            }
            else
            {
                return `${content}<span class="string">${newContent}</span>`;
            }
        }
    ),
    new SyntaxElement('Parenthesis', Pattern.simpleCharbox('', '(', ')')),
    new SyntaxElement('Bracket', Pattern.simpleCharbox('', '[', ']')),
    new SyntaxElement('Curly Bracket', Pattern.simpleCharbox('', '{', '}')),
    new SyntaxElement('Number',
        Pattern.number(),
        (content, toAdd) => {
            let encoded = Txt.HTMLEncode(toAdd);
            return `${content}<span class="number">${encoded}</span>`;
        }
    ),
    new SyntaxElement('Word',
        Pattern.word(),
        (content, toAdd) => {
            let encoded = Txt.HTMLEncode(toAdd);
            if(KEYWORDS.includes(toAdd))
            {
                return `${content}<span class="keyword">${encoded}</span>`;
            }
            else if(LOGICS.includes(toAdd))
            {
                return `${content}<span class="logic">${encoded}</span>`;
            }
            else if(LOGIC_CONTROLS.includes(toAdd))
            {
                return `${content}<span class="logcontrols">${encoded}</span>`;
            }
            else
            {
                return `${content}<span class="word">${encoded}</span>`;
            }
        }
    ),
    new SyntaxElement('Punctuation', Pattern.simpleChar('', (c) => { return punctuations.includes(c); })),
    new SyntaxElement('Symbol', Pattern.simpleChar('', (c) => { return symbols.includes(c); })),
    new SyntaxElement('Whitespaces', new Pattern({ defaultValue: ' ',
            isPattern: (i, c, txt) => { return whitespaces.includes(c); },
            fetch: (index, c, txt) => {
                let result = Txt.extractFromUntil(txt, index, (c) => {
                    return whitespaces.includes(c);
                });
                let spaceResult = result.value;
                return {
                    name: 'Whitespaces',
                    content: spaceResult,
                    lastIndex: result.lastIndex
                };
            }
        }),
        (content, toAdd) => `${content}${toAdd.replaceAll(' ', '&nbsp;')}`
    ),
    new SyntaxElement('Controls', Pattern.simpleChar('Controls', (c) => { return controls.includes(c); }), (content, toAdd) => `${content}${toAdd}`),
);


function fastInput()
{
    const generateLines = (n) => {
        let result = '';
        for(let i = 1; i <= n; i++)
        {
            result = `${result}<p>${i}</p>`;
        }
        return result;
    }
    
    let editNLines = document.querySelector('.editor_linenumber');
    let uInput = document.getElementById('userInput');
    editNLines.innerHTML = generateLines(Math.max(Txt.countLines(uInput.value), 35));

    let clone = document.getElementById('cloneInput');

    syntax.parseSyntax(uInput.value);
    clone.innerHTML = syntax.getHighlightedSyntax();

    let fT = document.querySelector('.format_test');
    fT.innerText = syntax.getExtractedString();
}
fastInput();

const userInput = document.getElementById('userInput');
userInput.addEventListener('input', (e) => {
    userInput.style.height = userInput.scrollHeight + 'px';
    fastInput();
});
userInput.addEventListener('keydown', event => {
    if (event.key === 'Tab') {
        let newCaretPosition;
        newCaretPosition = userInput.getCaretPosition() + 4;
        userInput.value = userInput.value.substring(0, userInput.getCaretPosition()) + "    " + userInput.value.substring(userInput.getCaretPosition(), userInput.value.length);
        userInput.setCaretPosition(newCaretPosition);
        userInput.style.height = userInput.scrollHeight + 'px';
        event.preventDefault();
        fastInput();
    }
});
userInput.addEventListener('scroll', (e) => {
    let backdrop = document.getElementById('cloneInput');
    userInput.style.height = userInput.scrollHeight + 'px';
    userInput.scroll(backdrop.scrollLeft, backdrop.scrollTop);
});
