class SyntaxElement {
    constructor(name, pattern, highlight = (content, toAdd) => `${content}${Txt.HTMLEncode(toAdd)}`)
    {
        this.name = name;
        this.pattern = pattern;
        this.pattern.name = this.name;
        this.highlight = highlight;
    }
}