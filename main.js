const controls = [ '\n' ];
const whitespaces = [ ' ', '\t' ];
const symbols = [ '§', '@', '¥', '€', '¬', '&', '|', '#', '^', '*', '$', '%', '±', '=', '+', '-', '*', '/', '\\', '<', '>', '~', '°', '_', '`', '´', '¨', '(', ')', '[', ']', '{', '}' ];
const punctuations = [ '.', ',', ';', ':', '?', '!', '"', '\'', '«', '»' ];
const letters = [   'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
                    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
                    'á', 'à', 'ä', 'â',
                    'é', 'è', 'ë', 'ê',
                    'í', 'ì', 'ï', 'î',
                    'ó', 'ò', 'ö', 'ô',
                    'ú', 'ù', 'ü', 'û',
                    'Ç', 'ç'
];
const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const KEYWORDS = [  'let', 'new', 'from', 'to', 'static', 'in', 'as', 'do',
                    'inside', 'select', 'set', 'get', 'insert', 'delete',
                    'define', 'function', 'value', 'use', 'public', 'private',
                    'protected', 'readonly', 'import', 'export', 'namespace'
];
const LOGICS = [    'for', 'foreach', 'while', 'if', 'switch', 'try', 'catch', 'finaly'
];
const LOGIC_CONTROLS = [    'return', 'break', 'continue'
];
const logs = [];

 /**
  * A function made to look for specific pattern
  * @param {string} txtContent The string we're currently parsing.
  * @param {BasicPattern[]} patternSet A list of different pattern to compute.
  * @param {number} i The index with default value to 0. Can be modified for nested searching.
  * @param {(index: number, c: char, text: string) => boolean} endPattern A function to check if a pattern ended.
  * @return {{isPatternEnd: boolean, result: {name:string, content:any}[], lastIndex: number}} Return an object representing the value parsed.
  */
function LookForPattern(txtContent, patternSet, i = 0, endPattern = (i, c, t) => { return false; })
{
    let subdivided = []; // A result called subdivided since it's the input subdivided in multiple pieces.
    
    for(; i < txtContent.length; i++) // Let's navigate the input
    {
        if(endPattern(i, txtContent[i], txtContent)) // We're in a nested pattern that just ended
        {
            return { // We're gonna return that we're inside an ended pattern, the result and the last index visited
                isPatternEnd: true,
                result: subdivided,
                lastIndex: i
            };
        }
        for(let j = 0; j < patternSet.length; j++) // Let's check all the possible patterns
        {
            if(patternSet[j].isActualPattern(i, txtContent[i], txtContent)) // It's the pattern, let's execute something
            {
                let fetchResult = patternSet[j].fetchContent(i, txtContent[i], txtContent, patternSet, patternSet[j]); // Execute something then return the fetched result
                i = fetchResult.lastIndex; // Assign the new index
                subdivided.push({
                    begin: fetchResult.begin,
                    end: fetchResult.end,
                    nested: fetchResult.nested,
                    error: fetchResult.error,
                    name: patternSet[j].name,
                    content: fetchResult.content
                }); // Insert an array of 2 elements (name and content) of the tested pattern inside our subdivided variable.
                break; // No need to check more pattern, we've got one already
            }
        }
    }
    return { // We've done it 'till the end, no pattern ended over here
        isPatternEnd: false,
        result: subdivided,
        lastIndex: i - 1
    };
}

/*
    PATTERNS
*/
const AllBasicPatterns = [
    new BasicPattern({ name: 'Comment Line', defaultValue: '//',
        isPattern: (i, c, txt) => { return c === '/' && i + 1 < txt.length && txt[i + 1] === '/'; },
        fetch: (index, c, txt) => {
            let result = '//';
            let lastIndex = index;
            for(let i = index + 2; i < txt.length; i++)
            {
                result = `${result}${txt[i]}`;
                lastIndex = i;
                if(txt[i] === '\n')
                {
                    break;
                }
            }
            return {
                content: result,
                lastIndex: lastIndex
            };
        }
    }),
    new BasicPattern({ name: 'Comment Multiline', defaultValue: '/*',
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
                error: true,
                content: '/*',
                lastIndex: index + 1
            };
        }
        return {
            content: result,
            lastIndex: lastIndex
        };
    }
}),
new BasicPattern({ name: 'String Classic', defaultValue: '\'',
    isPattern: (i, c, txt) => { return c === '\''; },
    fetch: (index, c, txt) => {
        let result = '\'';
        let lastIndex = index;
        for(let i = index + 1; i < txt.length; i++)
        {
            result = `${result}${txt[i]}`;
            lastIndex = i;
            if(txt[i] === '\'' && txt[i - 1] !== '\\')
            {
                break;
            }
        }
        // If we're out of bounds but found no closing '
        if(lastIndex == txt.length - 1 && txt[txt.length - 1] !== '\'')
        {
            return {
                error: true,
                content: '\'',
                lastIndex: index
            };
        }
        return {
            content: result,
            lastIndex: lastIndex
        };
    }
}),
    BasicPattern.simpleCharbox('Parenthesis', '(', ')'),
    BasicPattern.simpleCharbox('Bracket', '[', ']'),
    BasicPattern.simpleCharbox('Curly Bracket', '{', '}'),
    BasicPattern.number(),
    BasicPattern.word(),
    BasicPattern.simpleChar('Punctuation', (c) => { return punctuations.includes(c); }),
    BasicPattern.simpleChar('Symbol', (c) => { return symbols.includes(c); }),
    new BasicPattern({ name: 'Whitespaces', defaultValue: ' ',
        isPattern: (i, c, txt) => { return whitespaces.includes(c); },
        fetch: (index, c, txt) => {
            let result = Txt.extractFromUntil(txt, index, (c) => {
                return whitespaces.includes(c);
            });
            let spaceResult = result.value;
            return {
                content: spaceResult,
                lastIndex: result.lastIndex
            };
        }
    }),
    BasicPattern.simpleChar('Controls', (c) => { return controls.includes(c); })
];
 
const navigateNodes = (nodes) => {
    let result = '';
    const HtmlEncode = (s) => {
        let el = document.createElement("div");
        el.innerText = el.textContent = s;
        s = el.innerHTML;
        return s;
    }
    for(let i = 0; i < nodes.length; i++)
    {
        if(nodes[i].nested) // This node is a sub element (an array if nothing goes wrong)
        {
            let encodeBegin = HtmlEncode(nodes[i].begin);
            if(nodes[i].error) // An error occured, most likely a not closed block
            {
                result = `${result}<span class="error">${encodeBegin}</span>`;
            }
            else // No error occured
            {
                result = `${result}${encodeBegin}${navigateNodes(nodes[i].content)}${HtmlEncode(nodes[i].end)}`;
            }
        }
        else // It's a string, ez pz let's write it with some spacing
        {
            if(nodes[i].name === 'Control' || nodes[i].content === '\n')
            {
                result = `${result}${nodes[i].content}`;
            }
            else if(nodes[i].name === 'Whitespaces'
            || nodes[i].name === 'String Classic'
            || nodes[i].name === 'Comment Line'
            || nodes[i].name === 'Comment Multiline')
            {
                if(nodes[i].error)
                {
                    result = `${result}<span class="error">${nodes[i].content.replaceAll(' ', '&nbsp;')}</span>`;
                }
                else
                {
                    switch(nodes[i].name)
                    {
                        case 'Comment Multiline':
                            const formatText = (content) =>  {
                                let rectifiedContent = '';
                                for(let i = 0; i < content.length; i++)
                                {
                                    if(content[i] === '\n')
                                    {
                                        rectifiedContent = `${rectifiedContent}</span></p><p><span class="comment">`;
                                    }
                                    else
                                    {
                                        rectifiedContent = `${rectifiedContent}${content[i]}`;
                                    }
                                }
                                return `${rectifiedContent}</span>`;
                            };
                            result = `${result}<span class="comment">${formatText(nodes[i].content.replaceAll(' ', '&nbsp;'))}</span>`;
                            break;
                        case 'Comment Line':
                            result = `${result}<span class="comment">${nodes[i].content.replaceAll(' ', '&nbsp;')}</span>`;
                            break;
                        case 'String Classic':
                            let oldContent = nodes[i].content;
                            let newContent = '';
                            let error = false;
                            for(let i = 0; i < oldContent.length; i++)
                            {
                                if(oldContent[i] !== ' ' && oldContent[i] !== '\n')
                                {
                                    newContent = `${newContent}${HtmlEncode(oldContent[i])}`;
                                }
                                else
                                {
                                    if(oldContent[i] === '\n')
                                    {
                                        error = true;
                                    }
                                    newContent = `${newContent}${oldContent[i]}`;
                                }
                            }
                            if(error)
                            {
                                result = `${result}<span class="error">${newContent.replaceAll(' ', '&nbsp;')}</span>`;
                            }
                            else
                            {
                                result = `${result}<span class="string">${newContent.replaceAll(' ', '&nbsp;')}</span>`;
                            }
                            break;
                        default:
                            result = `${result}${nodes[i].content.replaceAll(' ', '&nbsp;')}`;
                            break;
                    }
                }
            }
            else
            {
                switch(nodes[i].name)
                {
                    case 'Word':
                        if(KEYWORDS.includes(nodes[i].content))
                        {
                            result = `${result}<span class="keyword">${HtmlEncode(nodes[i].content)}</span>`;
                        }
                        else if(LOGICS.includes(nodes[i].content))
                        {
                            result = `${result}<span class="logic">${HtmlEncode(nodes[i].content)}</span>`;
                        }
                        else if(LOGIC_CONTROLS.includes(nodes[i].content))
                        {
                            result = `${result}<span class="logcontrols">${HtmlEncode(nodes[i].content)}</span>`;
                        }
                        else
                        {
                            result = `${result}<span class="word">${HtmlEncode(nodes[i].content)}</span>`;
                        }
                        break;
                    case 'Number':
                        result = `${result}<span class="number">${HtmlEncode(nodes[i].content)}</span>`;
                        break;
                    default:
                        result = `${result}${HtmlEncode(nodes[i].content)}`;
                        break;
                }
            }
        }
    }
    return result;
};
function fastInput()
{
    const countLines = (content) => {
        let line = 1;
        for(let i = 0; i < content.length; i++)
        {
            if(content[i] === '\n')
            {
                line++;
            }
        }
        return line;
    }
    const generateLines = (n) => {
        let result = '';
        for(let i = 1; i <= n; i++)
        {
            result = `${result}<p>${i}</p>`;
        }
        return result;
    }
    const formatText = (content) =>  {
        let rectifiedContent = '<p>';
        for(let i = 0; i < content.length; i++)
        {
            if(content[i] === '\n')
            {
                rectifiedContent = `${rectifiedContent}</p><p>`;
            }
            else
            {
                rectifiedContent = `${rectifiedContent}${content[i]}`;
            }
        }
        return `${rectifiedContent}</p>`;
    };
    let uInput = document.getElementById('userInput');
    let editNLines = document.querySelector('.editor_linenumber');
    editNLines.innerHTML = generateLines(Math.max(countLines(uInput.value), 35));
    let clone = document.getElementById('cloneInput');
    clone.innerHTML = formatText(navigateNodes(LookForPattern(uInput.value, AllBasicPatterns).result));
}
fastInput();
const userInput = document.getElementById('userInput');
userInput.addEventListener('input', (e) => {
    userInput.style.height = userInput.scrollHeight+'px';
    fastInput();
});
userInput.addEventListener('scroll', (e) => {
    let backdrop = document.getElementById('cloneInput');
    userInput.scroll(backdrop.scrollLeft, backdrop.scrollTop);
});
