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
        new Pattern({
            name: 'Number',
            defaultValue: 0,
            isPattern: (i, c, txt) => {
                let isDecimal = c === '.' && Txt.digits.includes(Txt.extract(txt, i + 1, 1));
                return Txt.digits.includes(c) || isDecimal;
            },
            fetch: (index, c, txt) => {
                let result = {
                    name: 'Number',
                    content: '',
                    lastIndex: index
                };
                let alreadyDecimal = false;
                for(let i = index; i < txt.length; i++)
                {
                    if(!Txt.digits.includes(txt[i])) // Not a digit?
                    {
                        if(!alreadyDecimal && txt[i] === '.') // It's decimal number
                        {
                            alreadyDecimal = true; // We defined it as decimal to skip problems in case of multiple decimal marks
                            if(result.content.length == 0) // .5 as example
                            {
                                result.content = `0.`; // 0.5 now
                            }
                            else
                            {
                                result.content = `${result.content}.`; // xxx.yyy
                            }
                            result.lastIndex = i; // Assign the last index
                            continue;
                        }
                        result.lastIndex = i - 1; // Since this index is something we shouldn't bother with, let him tested by something else
                        break;
                    }
                    result.lastIndex = i; // Assign the last index
                    result.content = `${result.content}${txt[i]}`;
                }
                return result;
            }
        }),
        (content, toAdd) => {
            let encoded = Txt.HTMLEncode(toAdd);
            return `${content}<span class="number">${encoded}</span>`;
        }
    ),
    new SyntaxElement('Variable',
        new Pattern({
            defaultValue: '',
            isPattern: (i, c, txt) => {
                return Txt.variables.includes(c);
            },
            fetch: (index, c, txt) => {
                let result = {
                    name: 'Variable',
                    content: '',
                    lastIndex: index
                };
                for(let i = index; i < txt.length; i++)
                {
                    if(!Txt.variables.includes(txt[i])) // Not a letter?
                    {
                        result.lastIndex = i - 1; // Since this index is something we shouldn't bother with, let him tested by something else
                        break;
                    }
                    result.lastIndex = i; // Assign the last index
                    result.content = `${result.content}${txt[i]}`;
                }
                return result;
            }
        }),
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
                return `${content}<span class="varword">${encoded}</span>`;
            }
        }
    ),
    new SyntaxElement('Word',
        Pattern.word(),
        (content, toAdd) => `${content}<span class="word">${Txt.HTMLEncode(toAdd)}</span>`
    ),
    new SyntaxElement('Punctuation', Pattern.simpleChar('', (c) => { return Txt.punctuations.includes(c); })),
    new SyntaxElement('Symbol', Pattern.simpleChar('', (c) => { return Txt.symbols.includes(c); })),
    new SyntaxElement('Whitespaces', new Pattern({ defaultValue: ' ',
            isPattern: (i, c, txt) => { return Txt.whitespaces.includes(c); },
            fetch: (index, c, txt) => {
                let result = Txt.extractFromUntil(txt, index, (c) => {
                    return Txt.whitespaces.includes(c);
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
    new SyntaxElement('Controls', Pattern.simpleChar('Controls', (c) => { return Txt.controls.includes(c); }), (content, toAdd) => `${content}${toAdd}`),
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
    uInput.style.height = uInput.scrollHeight + 'px';
    editNLines.innerHTML = generateLines(Math.max(Txt.countLines(uInput.value), 35));

    let clone = document.getElementById('cloneInput');

    syntax.parseSyntax(uInput.value);
    clone.innerHTML = syntax.getHighlightedSyntax();

    let fT = document.querySelector('.format_test');

    // Functions
    const filterComment = (node) => {
        return node.name !== 'Comment Multiline' && node.name !== 'Comment Line' && node.name !== 'Controls' && node.name !== 'Whitespaces';
    };

    // Steps
    let filterSyntax = SyntaxMaker.filter(syntax.Nodes(), filterComment);

    // Generated
    fT.innerText = SyntaxMaker.extractString(filterSyntax, true);
}
fastInput();

const userInput = document.getElementById('userInput');
const lineNbr = document.querySelector('.editor_linenumber');
userInput.addEventListener('input', (e) => {
    fastInput();
    userInput.style.height = lineNbr.scrollHeight + 'px';
});
const tabLength = 4;
userInput.addEventListener('keydown', event => {
    if (event.key === 'Tab') {
        let newCaretPosition;
        let caretPos = userInput.getCaretPosition();
        const carretContent = userInput.value.substring(0, caretPos);
        let move = 0;
        if(event.shiftKey)
        {
            for(let i = carretContent.length - 1; i >= carretContent.length - tabLength && i >= 0; i--)
            {
                if(carretContent[i] !== ' ')
                {
                    if(carretContent[i] !== '\n')
                    {
                        move--;
                    }
                    break;
                }
                move++;
            }
            if(move < 0)
            {
                move = 0;
            }
            userInput.value = userInput.value.substring(0, caretPos - move) + userInput.value.substring(caretPos, userInput.value.length);
            newCaretPosition = caretPos - move;
        }
        else
        {
            let letterTillLine = 0;
            for(let i = carretContent.length - 1; i >= 0; i--)
            {
                if(carretContent[i] === '\n')
                {
                    break;
                }
                letterTillLine++;
            }
            move = tabLength - (letterTillLine % tabLength);
            const generateSpace = (n) => {
                let r = '';
                while(n > 0)
                {
                    r = `${r} `;
                    n--;
                }
                return r;
            }
            userInput.value = userInput.value.substring(0, caretPos) + generateSpace(move) + userInput.value.substring(caretPos, userInput.value.length);
            newCaretPosition = caretPos + move;
        }
        userInput.setCaretPosition(newCaretPosition);
        event.preventDefault();
        userInput.style.height = lineNbr.scrollHeight + 'px';
        fastInput();
    }
    userInput.style.height = lineNbr.scrollHeight + 'px';
});
userInput.addEventListener('scroll', (e) => {
    let backdrop = document.getElementById('cloneInput');
    userInput.style.height = lineNbr.scrollHeight + 'px';
    userInput.scroll(backdrop.scrollLeft, backdrop.scrollTop);
});
