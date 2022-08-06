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
     * @returns {string} Return a string of nbrLetters characters if there is that many from a starting point.
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
    /**
     * Extract the content from a string starting at a specific index until the predicate is false.
     * @param {string} content The source string from which we get the content to extract.
     * @param {number} startIndex The starting index.
     * @param {(c: char)=>boolean, i: number, txt: string} predicate A function to check if we include the character.
     * @returns {{lastIndex: number, value:string}} An object containing the substring made by following the predicate rule and the last index extracted.
     */
    static extractFromUntil(content, startIndex, predicate)
    {
        let lastIndex = startIndex;
        for(let i = startIndex; content.length; i++)
        {
            if(!predicate(content[i], i, content))
            {
                break;
            }
            lastIndex = i;
        }
        let result = '';
        for(let i = startIndex; i <= lastIndex; i++)
        {
            result = `${result}${content[i]}`;
        }
        return {
            value: result,
            lastIndex: lastIndex
        };
    }
    /**
     * Return the number of lines contained inside a string.
     * @param {number} content The string content from which we want to count the lines.
     * @returns {number} The number of lines contained in the string.
     */
    static countLines(content)
    {
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
    /**
     * Find the number of lines from the start of a string until a specified index, finding the character position of that element on the way.
     * @param {string} content The string we're going to look.
     * @param {number} maxIndex The last index we're going to look.
     * @returns {{lines: number, lineChar: number}} An object containing the number of lines found and the character position of the last index in it's current line.
     */
    static countLinesChar(content, maxIndex)
    {
        let result = {
            lines: 1,
            lineChar: 0
        }
        for(let i = 0; i <= maxIndex; i++)
        {
            result.lineChar++;
            if(content[i] === '\n')
            {
                result.lines++;
                result.lineChar = 0;
            }
        }
        return result;
    }
    static _internalDivAssign(div)
    {
        this._internalDiv = div;
    }
    /**
     * Encode a string into HTML character.
     * @param {string} content The string to encode in HTML character.
     * @returns {string} The string encoded into HTML.
     */
    static HTMLEncode(content)
    {
        if(this._internalDiv === undefined)
        {
            this._internalDivAssign(document.createElement("div"));
        }
        this._internalDiv.innerText = this._internalDiv.textContent = content;
        content = this._internalDiv.innerHTML;
        return content;
    }
}