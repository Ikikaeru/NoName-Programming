class SyntaxMaker {
    constructor(...elements)
    {
        this.elements = elements;
        this.hasContent = false;
    }
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
    Nodes()
    {
        return this.nodes;
    }
    parseSyntax(txt)
    {
        const patternSet = [];
        const highlightDictionary = {};
        for(let element of this.elements)
        {
            patternSet.push(element.pattern);
            highlightDictionary[element.name] = element.highlight;
        }
        this.nodes = SyntaxMaker.search(txt, patternSet).result;
        this.highlightDictionary = highlightDictionary;
    }
    getHighlightedSyntax()
    {
        const highlightSyntax = (nodes) => {
            let result = '';
            for(let i = 0; i < nodes.length; i++)
            {
                if(nodes[i].nested) // This node is a sub element (an array if nothing goes wrong)
                {
                    let encodeBegin = Txt.HTMLEncode(nodes[i].begin);
                    if(nodes[i].error) // An error occured, most likely a not closed block
                    {
                        result = `${result}<span class="error">${encodeBegin}</span>`;
                    }
                    else // No error occured
                    {
                        result = `${result}${encodeBegin}${highlightSyntax(nodes[i].content)}${Txt.HTMLEncode(nodes[i].end)}`;
                    }
                }
                else // It's a string, ez pz let's write it with some spacing
                {
                    let highlight = this.highlightDictionary[nodes[i].name];
                    if(highlight)
                    {
                        result = highlight(result, nodes[i].content, nodes[i].error);
                    }
                    else
                    {
                        result = `${result}${Txt.HTMLEncode(nodes[i].content)}`;
                    }
                }
            }
            return result;
        }
        const formatParagraphLines = (content) =>  {
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
        return formatParagraphLines(highlightSyntax(this.nodes));
    }
    getExtractedString()
    {
        return this.extractString(this.nodes);
    }
    static extractString(nodes, spacing = false, depth = 0)
    {
        const generateSpace = (d) => {
            let spacing = '';
            for(let i = 0; i < d; i++)
            {
                spacing = `${spacing}    `;
            }
            return spacing;
        }
        let space = spacing ? generateSpace(depth) : '';
        let lineReturn = spacing ? '\n' : '';
        let result = '';
        for(let i = 0; i < nodes.length; i++)
        {
            if(nodes[i].nested) // This node is a sub element (an array if nothing goes wrong)
            {
                result = `${result}${space}${nodes[i].begin}${lineReturn}`;
                if(!nodes[i].error)
                {
                    result = `${result}${this.extractString(nodes[i].content, spacing, depth + 1)}${lineReturn}${space}${nodes[i].end}${lineReturn}`;
                }
            }
            else // It's a string, ez pz let's write it with some spacing
            {
                result = `${result}${space}${nodes[i].content}${lineReturn}`;
            }
        }
        return result;
    }
    static filter(nodes, predicate)
    {
        let result = [];
        for(let i = 0; i < nodes.length; i++)
        {
            if(predicate(nodes[i]))
            {
                if(nodes[i].nested)
                {
                    nodes[i].content = this.filter(nodes[i].content, predicate);
                }
                result.push(nodes[i]);
            }
        }
        return result;
    }
    filterSyntax(predicate)
    {
        this.nodes = filter(this.nodes, predicate);
    }
    computeSyntax(execute)
    {
        this.nodes = execute(this.nodes);
    }
}