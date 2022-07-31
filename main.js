const controls = [ '\n', '\t' ];
const whitespaces = [' ', '\t' ];
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
/**
 * BasicPattern is a generic class made to check for pattern while looking inside a string.
 * It fetch it's inner value with the pattern founded and then return it's last index.
 */
class BasicPattern
{
    /**
     * Create a basic pattern object with a bunch of parameters for full customisation.
     * @param {{name: string, defaultValue: any, isPattern: (i: number, c: char, t: string) => boolean, isPatternEnd: (i: number, c: char, t: string) => boolean, fetch: (i: number, c: char, t: string) => {lastIndex: number, content: any}} pattern 
     */
    constructor(pattern)
    {
        this.name = pattern.name;
        this.defaultValue = pattern.defaultValue;
        this.isPattern = pattern.isPattern;
        this.isPatternEnd = pattern.isPatternEnd;
        this.fetch = pattern.fetch;
    }
    /**
     * Check if we found the pattern.
     * @param {number} i The actual index tested.
     * @param {char} c The actual character tested.
     * @param {string} t The actual text content parsed for special cases.
     * @returns True only if it match the pattern.
     */
    isActualPattern(i, c, t)
    {
        if(this.isPattern !== undefined && this.isPattern !== null)
        {
            return this.isPattern(i, c, t);
        }
        return false;
    }
    /**
     * Check if the pattern ended, used to handle nesting.
     * @param {number} i The actual index tested.
     * @param {char} c The actual character tested.
     * @param {string} t The actual text content parsed for special cases.
     * @returns True only if it match the pattern.
     */
    isEndPattern(i, c, t)
    {
        if(this.isPatternEnd !== undefined && this.isPatternEnd !== null)
        {
            return this.isPatternEnd(i, c, t);
        }
        return false;
    }
    /**
     * Assign the new content matching the desired pattern then return the last index of the pattern.
     * @param {number} i The actual index tested.
     * @param {char} c The actual character tested.
     * @param {string} t The actual text content parsed for special cases.
     * @param {BasicPattern[]} patternSet The actual text content parsed for special cases.
     * @param {string} actualPattern The actual pattern we're testing, used for referencing.
     * @returns An object containing the last index of the pattern and the content to fetch. Content is equal to the default value in case fetch isn't defined.
     */
    fetchContent(i, c, t, patternSet, actualPattern)
    {
        if(this.fetch !== undefined && this.fetch !== null)
        {
            return this.fetch(i, c, t, actualPattern.isPatternEnd, patternSet);
        }
        return {
            lastIndex: i,
            content: this.defaultValue
        };
    }
}
/**
 * Shorthand static class for special string functions.
 */
class Txt
{
    /**
     * A shorthand function to extract a certain number of character from a string. 
     * @param {string} content The string where we want to extract content from.
     * @param {number} index The index from which we start.
     * @param {number} nbrLetters The number of letters to extract.
     * @returns Return a string of nbrLetters characters if there is that many from a starting point.
     */
    static extract(content, index, nbrLetters)
    {
       let result = '';
       for(let i = index; i < content.length; i++)
       {
           if(i >= index + nbrLetters)
           {
               return result;
           }
           result = `${result}${content[i]}`;
       }
       return result;
   }
}


const logs = [];
/**
 * A function made to look for specific pattern
 * @param {string} txtContent The string we're currently parsing.
 * @param {BasicPattern[]} patternSet A list of different pattern to compute.
 * @param {number} i The index with default value to 0. Can be modified for nested searching.
 * @param {(index: number, c: char, text: string) => boolean} endPattern A function to check if a pattern ended.
 * @return {{isPatternEnd: boolean, result: [name:string, content:any], lastIndex: number}} Return an object representing the value parsed.
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
                subdivided.push([patternSet[j].name, fetchResult.content]); // Insert an array of 2 elements (name and content) of the tested pattern inside our subdivided variable.
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
    A BUNCH OF SHOWCASES OF BASIC PATTERN
*/
const numbersBasicPattern = new BasicPattern({
    name: 'Number',
    defaultValue: 0,
    isPattern: (i, c, txt) => {
        let isDecimal = c === '.' && digits.includes(Txt.extract(txt, i + 1, 1));
        return digits.includes(c) || isDecimal;
    },
    fetch: (index, c, txt) => {
        let result = {
            content: '',
            lastIndex: index
        };
        let alreadyDecimal = false;
        for(let i = index; i < txt.length; i++)
        {
            if(!digits.includes(txt[i])) // Not a digit?
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
        result.content = Number(result.content); // Type hack
        return result;
    }
});
const wordsBasicPattern = new BasicPattern({
    name: 'Word',
    defaultValue: '',
    isPattern: (i, c, txt) => { return letters.includes(c); },
    fetch: (index, c, txt) => {
        let result = {
            content: '',
            lastIndex: index
        };
        for(let i = index; i < txt.length; i++)
        {
            if(!letters.includes(txt[i])) // Not a letter?
            {
                result.lastIndex = i - 1; // Since this index is something we shouldn't bother with, let him tested by something else
                break;
            }
            result.lastIndex = i; // Assign the last index
            result.content = `${result.content}${txt[i]}`;
        }
        return result;
    }
});
const punctuationsBasicPattern = new BasicPattern({
    name: 'Punctuation',
    defaultValue: '',
    isPattern: (i, c, txt) => { return punctuations.includes(c); },
    fetch: (index, c, txt) => {
        return {
            content: c,
            lastIndex: index
        };
    }
});
const symbolsBasicPattern = new BasicPattern({
    name: 'Symbol',
    defaultValue: '',
    isPattern: (i, c, txt) => { return symbols.includes(c); },
    fetch: (index, c, txt) => {
        return {
            content: c,
            lastIndex: index
        };
    }
});
const whitespacesBasicPattern = new BasicPattern({
    name: 'Whitespace',
    defaultValue: '',
    isPattern: (i, c, txt) => { return whitespaces.includes(c); },
    fetch: (index, c, txt) => {
        return {
            content: c,
            lastIndex: index
        };
    }
});
const controlsBasicPattern = new BasicPattern({
    name: 'Controls',
    defaultValue: '',
    isPattern: (i, c, txt) => { return controls.includes(c); },
    fetch: (index, c, txt) => {
        return {
            content: c,
            lastIndex: index
        };
    }
});
const blockNestedPatterns = new BasicPattern({
    name: 'Curly Brackets',
    defaultValue: '{}',
    isPattern: (i, c, txt) => { return c === '{'; },
    isPatternEnd: (i, c, txt) => { return c === '}'; },
    fetch: (index, c, txt, endPattern, patternSet) => {
        let p = LookForPattern(txt, patternSet, index + 1, endPattern); // Let's look for nested pattern over here..
        // We could filter patternSet if we wanted to get rid of some functions for this case or use whatever we want anyway.
        if(p.isPatternEnd) // It's the end of our pattern
        {
            return {
                content: p.result,
                lastIndex: p.lastIndex
            }; // Return what we got
        }
        else // Something went wrong with brackets (user input) since it was never closed.
        {
            const lineData = (content, maxIndex) => {
                maxIndex++;
                let line = 1;
                let lastBeginLineChar = -1;
                for(let i = 0; i < maxIndex; i++)
                {
                    if(content[i] === '\n')
                    {
                        lastBeginLineChar = i;
                        line++;
                    }
                }
                return {
                    line: line,
                    character: maxIndex - lastBeginLineChar - 1
                };
            }
            let getLineData = lineData(txt, index);
            let charPosDenom = getLineData.character % 10;
            let denom = 'th';
            switch(charPosDenom)
            {
                case 1:
                    denom = 'st';
                    break;
                case 2:
                    denom = 'nd';
                    break;
                case 3:
                    denom = 'rd';
                    break;
            }
            let errorMsg = `<strong><em>Curly brackets</em></strong> at line ${getLineData.line}, the <strong>${getLineData.character}${denom}</strong> character: the <em>curly brackets</em> is never closed.`;
            if(!logs.includes(errorMsg))
            {
                logs.push(errorMsg);
            }
            return {
                content: '',
                lastIndex: index
            };
        }
    }
});

const AllBasicPatterns = [ // A list of all the showcases pattern, just to make things simpler
    blockNestedPatterns,
    numbersBasicPattern,
    wordsBasicPattern,
    punctuationsBasicPattern,
    symbolsBasicPattern,
    whitespacesBasicPattern,
    controlsBasicPattern
];

// A string generator to see our node hierarchy
const separateNodes = (nodes, depth = 0) => {
    const generateRepeat = (n, r) => { // Generate a repeted amount of letter for spacing
        let space = '';
        for(let i = 0; i < n; i++)
        {
            space = `${space}${r}`;
        }
        return space;
    };
    let toShow = '';
    for(let node of nodes) // Checking node by node
    {
        if(typeof node[1] === 'object') // This node is a sub element (an array if nothing goes wrong)
        {
            toShow = `${toShow}${generateRepeat(depth, '\t')}<em class='object'>${node[0]}</em>:\n${separateNodes(node[1], depth + 1)}`;
        }
        else // It's a string, ez pz let's write it with some spacing
        {
            toShow = `${toShow}${generateRepeat(depth, '\t')}<em class='object'>${node[0]}</em>:\n${generateRepeat(depth + 1, '\t')}<strong>${node[1]}</strong>\n`;
        }
    }
    return toShow;
};


function fastInput()
{
    let userInput = document.getElementById('userInput').value;
    let output = document.querySelector('.userOutput');
    let userLog = document.querySelector('.errorOutput');
    let subdivided = LookForPattern(userInput, AllBasicPatterns);
    let packLogs = '';
    for(let log of logs)
    {
        packLogs = `${packLogs}${log}\n`;
    }
    for(let i = logs.length; i > 0; i--)
    {
        logs.pop();
    }
    userLog.innerHTML = `<pre>${packLogs}</pre>`;
    output.innerHTML = `<pre>${separateNodes(subdivided.result)}</pre>`;
}
fastInput();

let userInput = document.getElementById('userInput');
userInput.addEventListener('keyup', (e) => {
    fastInput();
})