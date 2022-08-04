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
}