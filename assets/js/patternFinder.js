class PatternFinder {
     /**
     * Search every pattern to parse it into an object.
     * @param {string} txtContent The string we're currently parsing.
     * @param {BasicPattern[]} patternSet A list of different pattern to compute.
     * @param {number} i The index with default value to 0. Can be modified for nested searching.
     * @param {(index: number, c: char, text: string) => boolean} endPattern A function to check if a pattern ended.
     * @return {{isPatternEnd: boolean, result: PatternFound[], lastIndex: number}} Return an object representing the value parsed.
     */
    static search(txtContent, patternSet, i = 0, endPattern = (i, c, t) => { return false; })
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
                    let lineData = Txt.countLinesChar(txtContent, i);
                    let fetchResult = patternSet[j].fetchContent(i, txtContent[i], txtContent, patternSet, patternSet[j]); // Execute something then return the fetched result
                    i = fetchResult.lastIndex; // Assign the new index
                    let resultObject = new PatternFound({
                        name: patternSet[j].name,
                        currentName: fetchResult.name,
                        begin: fetchResult.begin,
                        end: fetchResult.end,
                        nested: fetchResult.nested,
                        content: fetchResult.content,
                        error: fetchResult.error,
                        line: lineData.line,
                        lineChar: lineData.lineChar
                    });
                    subdivided.push(resultObject); // Insert an array of 2 elements (name and content) of the tested pattern inside our subdivided variable.
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
}