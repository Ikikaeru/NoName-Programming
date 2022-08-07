/**
 * Pattern is a generic class made to check for pattern while looking inside a string.
 * It fetch it's inner value with the pattern founded and then return it's last index.
 */
 class Pattern
 {
    /**
     * Create a pattern object with a bunch of parameters for full customisation.
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
    /**
     * A basic pattern to test and extract a character.
     * @param {string} name Name of the pattern.
     * @param {(c:char)=>boolean} predicate The function to test the character.
     * @returns {BasicPattern} Return a char pattern.
     */
    static simpleChar(name, predicate)
    {
        return new Pattern({
            name: name,
            defaultValue: null,
            isPattern: (i, c, txt) => { return predicate(c); },
            fetch: (index, c, txt) => {
                return { name: name, content: c, lastIndex: index };
            }
        });
    }
    /**
     * A basic charbox that will contain the nested in-between string content.
     * @param {string} name The name of the charbox.
     * @param {string} begin The string that begin the charbox.
     * @param {string} end The string that end the charbox.
     * @returns {BasicPattern} Return a charbox pattern.
     */
    static simpleCharbox(name, begin, end)
    {
        return new Pattern({
            name: name,
            defaultValue: begin,
            begin: begin,
            end: end,
            isPattern: (i, c, txt) => { return c === begin; },
            isPatternEnd: (i, c, txt) => { return c === end; },
            fetch: (index, c, txt, endPattern, patternSet) => {
                let p = SyntaxMaker.search(txt, patternSet, index + 1, endPattern); // Let's look for nested pattern over here..
                // We could filter patternSet if we wanted to get rid of some functions for this case or use whatever we want anyway.
                if(p.isPatternEnd) // It's the end of our pattern
                {
                    return {
                        name: name,
                        content: p.result,
                        error: false,
                        nested: true,
                        begin: begin,
                        end: end,
                        lastIndex: p.lastIndex
                    }; // Return what we got
                }
                else // Something went wrong with brackets (user input) since it was never closed.
                {
                    return {
                        name: name,
                        content: begin,
                        nested: true,
                        error: true,
                        begin: begin,
                        end: end,
                        lastIndex: index
                    };
                }
            }
        });
    }
    /**
     * A basic pattern to extract words.
     * @returns {BasicPattern} Return a word pattern.
     */
    static word()
    {
        return new Pattern({
            name: 'Word',
            defaultValue: '',
            isPattern: (i, c, txt) => { return Txt.letters.includes(c); },
            fetch: (index, c, txt) => {
                let result = {
                    name: 'Word',
                    content: '',
                    lastIndex: index
                };
                for(let i = index; i < txt.length; i++)
                {
                    if(!Txt.letters.includes(txt[i])) // Not a letter?
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
    }
    /**
     * A basic pattern to extract numbers.
     * @param {boolean} comaOverDot If true, numbers must be written as "x,y" instead of "x.y".
     * @returns A basic number pattern.
     */
    static number(comaOverDot = false)
    {
        let dot = comaOverDot ? ',' : '.';
        return new Pattern({
            name: 'Number',
            defaultValue: 0,
            isPattern: (i, c, txt) => {
                let isDecimal = c === dot && Txt.digits.includes(Txt.extract(txt, i + 1, 1));
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
                        if(!alreadyDecimal && txt[i] === dot) // It's decimal number
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
    }
}